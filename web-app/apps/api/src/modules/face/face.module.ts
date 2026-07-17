import { Module } from '@nestjs/common';
import { FaceController } from './face.controller';
import { FaceService } from './face.service';
import { StubFaceRecognitionProvider } from './stub-face.provider';
import { FACE_RECOGNITION_PROVIDER } from './face-recognition.interface';

@Module({
  controllers: [FaceController],
  providers: [
    FaceService,
    // Swap this class for the real engine later — the token stays the same.
    { provide: FACE_RECOGNITION_PROVIDER, useClass: StubFaceRecognitionProvider },
  ],
  exports: [FaceService],
})
export class FaceModule {}
