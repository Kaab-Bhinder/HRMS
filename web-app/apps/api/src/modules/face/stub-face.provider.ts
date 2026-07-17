import { Injectable } from '@nestjs/common';
import { FaceEnrollResult, FaceRecognitionProvider, FaceVerifyResult } from './face-recognition.interface';

/**
 * Placeholder face engine. Records enrollment and returns a pass-through verify
 * result so the whole attendance flow works end-to-end today. Swap for a real
 * engine implementing FaceRecognitionProvider — no caller changes.
 */
@Injectable()
export class StubFaceRecognitionProvider implements FaceRecognitionProvider {
  readonly provider = 'stub';

  async enroll(_imageStorageKey: string, _employeeId: string): Promise<FaceEnrollResult> {
    return { quality: 90, provider: this.provider };
  }

  async verify(_imageStorageKey: string, _employeeId: string): Promise<FaceVerifyResult> {
    // A real engine returns actual scores; the stub approves so flows are testable.
    return { confidence: 99, liveness: 99, livenessPassed: true, matched: true, provider: this.provider };
  }
}
