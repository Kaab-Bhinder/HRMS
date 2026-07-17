import '../entities/geo_point.dart';
import '../entities/today_status.dart';

/// Attendance punch kinds accepted by the API.
enum PunchKind { checkIn, checkOut, breakStart, breakEnd }

extension PunchKindApi on PunchKind {
  String get wire => switch (this) {
        PunchKind.checkIn => 'check_in',
        PunchKind.checkOut => 'check_out',
        PunchKind.breakStart => 'break_start',
        PunchKind.breakEnd => 'break_end',
      };
}

abstract interface class AttendanceRepository {
  Future<TodayStatus> getToday();

  /// Punch (in/out/break) with a GPS fix. When [faceImageKey] is provided the
  /// punch is recorded as a face check-in (biometric). Returns today status.
  Future<TodayStatus> punch({required PunchKind kind, required GeoPoint location, String? faceImageKey});

  /// Uploads a check-in selfie; returns its storage key to pass to [punch].
  Future<String> uploadSelfie(List<int> bytes);
}
