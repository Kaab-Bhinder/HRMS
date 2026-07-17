import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';

/// Distinguishes "user cancelled the camera" from "device has no camera".
class SelfieCancelled implements Exception {}

/// Captures a front-camera selfie for biometric check-in. Returns the JPEG
/// bytes, throws [SelfieCancelled] if the user backs out, or rethrows on a
/// hardware/permission failure so the caller can decide how to degrade.
class SelfieService {
  final ImagePicker _picker = ImagePicker();

  Future<Uint8List> capture() async {
    final shot = await _picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.front,
      imageQuality: 70,
      maxWidth: 1080,
    );
    if (shot == null) throw SelfieCancelled();
    return shot.readAsBytes();
  }
}
