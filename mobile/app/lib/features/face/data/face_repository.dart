import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/network/api_client.dart';

/// Face ID enrollment + status. Frames are uploaded through the same selfie
/// endpoint check-ins use (server stores them in S3); enrollment then passes
/// only the storage keys, so image bytes never ride the JSON API.
class FaceRepository {
  FaceRepository(this._api);
  final ApiClient _api;

  Future<({bool enrolled, int templates})> status() async {
    final data = await _api.get('/face/my-status') as Map<String, dynamic>;
    return (enrolled: data['enrolled'] == true, templates: (data['templates'] as num?)?.toInt() ?? 0);
  }

  Future<String> uploadFrame(List<int> bytes, String pose) async {
    final data = await _api.uploadBytes('/attendance/selfie', bytes, filename: 'enroll-$pose.jpg') as Map<String, dynamic>;
    return data['storageKey'] as String;
  }

  /// First-time only — the server refuses once templates exist (HR re-enrolls).
  Future<int> enrollSelf(List<String> imageStorageKeys) async {
    final data = await _api.post('/face/enroll-self', body: {'imageStorageKeys': imageStorageKeys}) as Map<String, dynamic>;
    return (data['enrolled'] as num?)?.toInt() ?? imageStorageKeys.length;
  }
}

final faceRepositoryProvider = Provider<FaceRepository>((ref) => FaceRepository(ref.watch(apiClientProvider)));

/// Enrollment gate for the check-in flow and the home prompt.
final faceStatusProvider = FutureProvider<({bool enrolled, int templates})>(
  (ref) => ref.watch(faceRepositoryProvider).status(),
);
