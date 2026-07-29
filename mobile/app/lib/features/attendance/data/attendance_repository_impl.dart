import '../../../core/network/api_client.dart';
import '../domain/entities/face_match_result.dart';
import '../domain/entities/geo_point.dart';
import '../domain/entities/today_status.dart';
import '../domain/repositories/attendance_repository.dart';
import 'models/today_status_model.dart';

class AttendanceRepositoryImpl implements AttendanceRepository {
  /// Verdict from the most recent face punch (null when none / not a face punch).
  FaceMatchResult? lastFaceResult;

  AttendanceRepositoryImpl(this._api);
  final ApiClient _api;

  @override
  Future<TodayStatus> getToday() async {
    final data = await _api.get('/attendance/me/today') as Map<String, dynamic>;
    return TodayStatusModel.fromJson(data);
  }

  @override
  Future<TodayStatus> punch({required PunchKind kind, required GeoPoint location, String? faceImageKey}) async {
    final res = await _api.post('/attendance/punch', body: {
      'type': kind.wire,
      // A selfie makes it a biometric (face) punch; otherwise plain GPS.
      'method': faceImageKey != null ? 'mobile_face' : 'mobile_gps',
      'latitude': location.latitude,
      'longitude': location.longitude,
      if (location.accuracyMeters != null) 'accuracyMeters': location.accuracyMeters!.round(),
      // Anti-spoof signals for the server: fake-GPS flag + device clock (the
      // server compares this to its own trusted time).
      'isMocked': location.isMocked,
      'clientCreatedAt': DateTime.now().toUtc().toIso8601String(),
      'faceImageKey': ?faceImageKey,
    });
    // Biometric verdict from this punch (null for non-face punches) — the UI
    // shows the employee whether their face matched instead of failing quietly.
    lastFaceResult = FaceMatchResult.fromJson((res as Map<String, dynamic>)['face']);
    // Re-read the derived day so the UI reflects recomputed worked time.
    return getToday();
  }

  @override
  Future<String> uploadSelfie(List<int> bytes) async {
    final data = await _api.uploadBytes('/attendance/selfie', bytes, filename: 'selfie.jpg') as Map<String, dynamic>;
    return data['storageKey'] as String;
  }
}
