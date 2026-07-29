import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { FaceController } from './face.controller';
import { FaceService } from './face.service';
import { FaceRetentionService } from './face-retention.service';
import { StubFaceRecognitionProvider } from './stub-face.provider';
import { RekognitionFaceProvider } from './rekognition-face.provider';
import { FACE_RECOGNITION_PROVIDER } from './face-recognition.interface';

@Module({
  imports: [FilesModule],
  controllers: [FaceController],
  providers: [
    FaceService,
    FaceRetentionService,
    StubFaceRecognitionProvider,
    RekognitionFaceProvider,
    {
      // FACE_ENGINE=rekognition turns on the real engine (needs the S3 bucket
      // + AWS creds it shares with storage). Anything else keeps the stub, so
      // dev environments work with zero AWS setup.
      provide: FACE_RECOGNITION_PROVIDER,
      useFactory: (stub: StubFaceRecognitionProvider, rekog: RekognitionFaceProvider) =>
        (process.env.FACE_ENGINE ?? 'stub') === 'rekognition' ? rekog : stub,
      inject: [StubFaceRecognitionProvider, RekognitionFaceProvider],
    },
  ],
  exports: [FaceService],
})
export class FaceModule {}
