/**
 * Face recognition engine contract. The real engine (AWS Rekognition, a custom
 * model, etc.) implements this interface later — nothing else changes. Phase 3
 * ships StubFaceRecognitionProvider.
 */
export const FACE_RECOGNITION_PROVIDER = Symbol('FACE_RECOGNITION_PROVIDER');

export interface FaceEnrollResult {
  externalTemplateId?: string;
  embedding?: Buffer;
  quality: number; // 0-100
  provider: string;
}

export interface FaceVerifyResult {
  confidence: number; // 0-100 match confidence
  liveness: number; // 0-100 liveness score
  livenessPassed: boolean;
  matched: boolean;
  matchedTemplateId?: string;
  provider: string;
}

export interface FaceRecognitionProvider {
  /** Enroll a reference face for an employee. */
  enroll(imageStorageKey: string, employeeId: string): Promise<FaceEnrollResult>;
  /** Verify a captured selfie against an employee's enrolled template(s). */
  verify(imageStorageKey: string, employeeId: string): Promise<FaceVerifyResult>;
}
