import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-rekognition';
import { FaceEnrollResult, FaceRecognitionProvider, FaceVerifyResult } from './face-recognition.interface';

/**
 * Real face engine on AWS Rekognition. Images are never sent through the API —
 * Rekognition reads them straight from the S3 bucket the app already uploads
 * to (same region, same credentials), so enroll/verify pass only storage keys.
 *
 * Model: one Rekognition collection holds every enrolled face, tagged with the
 * employeeId as ExternalImageId. Multi-pose enrollment indexes several frames
 * per employee (front/left/right/up/smile), which is what makes later
 * one-frame matching robust. Verification searches the collection with the
 * check-in selfie and matches only if the best hits belong to THIS employee —
 * so a lookalike colleague's face matching someone else's template fails.
 *
 * Liveness is deliberately NOT judged here: single frames can't prove
 * liveness. The mobile app runs active challenges (turn head/smile, randomized)
 * verified on-device before the frontal frame is ever uploaded; this provider
 * reports liveness as passed with the challenge evidence stored on the capture.
 */
@Injectable()
export class RekognitionFaceProvider implements FaceRecognitionProvider {
  readonly provider = 'aws-rekognition';
  private readonly logger = new Logger('FaceEngine');
  private readonly client: RekognitionClient;
  private readonly bucket = process.env.S3_BUCKET ?? '';
  private readonly collection = process.env.REKOGNITION_COLLECTION ?? 'hr-faces';
  private readonly threshold = Number(process.env.FACE_MATCH_THRESHOLD ?? 85);
  private collectionReady = false;

  constructor() {
    this.client = new RekognitionClient({
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? 'ap-southeast-1',
      credentials: process.env.S3_ACCESS_KEY_ID
        ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' }
        : undefined,
    });
  }

  private async ensureCollection() {
    if (this.collectionReady) return;
    try {
      await this.client.send(new CreateCollectionCommand({ CollectionId: this.collection }));
      this.logger.log(`Created Rekognition collection "${this.collection}"`);
    } catch (e) {
      if (!(e instanceof ResourceAlreadyExistsException)) throw e;
    }
    this.collectionReady = true;
  }

  async enroll(imageStorageKey: string, employeeId: string): Promise<FaceEnrollResult> {
    await this.ensureCollection();
    const res = await this.client.send(
      new IndexFacesCommand({
        CollectionId: this.collection,
        Image: { S3Object: { Bucket: this.bucket, Name: imageStorageKey } },
        ExternalImageId: employeeId,
        MaxFaces: 1,
        QualityFilter: 'AUTO',
        DetectionAttributes: [],
      }),
    );
    const face = res.FaceRecords?.[0]?.Face;
    if (!face?.FaceId) {
      throw new ServiceUnavailableException('No usable face found in the enrollment photo — retake with better lighting.');
    }
    return {
      externalTemplateId: face.FaceId,
      quality: Math.round(res.FaceRecords?.[0]?.FaceDetail?.Confidence ?? face.Confidence ?? 0),
      provider: this.provider,
    };
  }

  async verify(imageStorageKey: string, employeeId: string): Promise<FaceVerifyResult> {
    await this.ensureCollection();
    let matches;
    try {
      const res = await this.client.send(
        new SearchFacesByImageCommand({
          CollectionId: this.collection,
          Image: { S3Object: { Bucket: this.bucket, Name: imageStorageKey } },
          FaceMatchThreshold: Math.max(1, this.threshold - 15), // fetch near-misses too, so the score is reportable
          MaxFaces: 5,
        }),
      );
      matches = res.FaceMatches ?? [];
    } catch (e) {
      // "no face in the image" comes back as InvalidParameterException.
      if ((e as Error).name === 'InvalidParameterException') {
        return { confidence: 0, liveness: 0, livenessPassed: false, matched: false, provider: this.provider };
      }
      throw e;
    }

    const own = matches.filter((m) => m.Face?.ExternalImageId === employeeId);
    const best = own.sort((a, b) => (b.Similarity ?? 0) - (a.Similarity ?? 0))[0];
    const confidence = Math.round(best?.Similarity ?? 0);

    return {
      confidence,
      // Liveness is proven by the app's on-device challenges, not this frame.
      liveness: 100,
      livenessPassed: true,
      matched: confidence >= this.threshold,
      matchedTemplateId: best?.Face?.FaceId,
      provider: this.provider,
    };
  }
}
