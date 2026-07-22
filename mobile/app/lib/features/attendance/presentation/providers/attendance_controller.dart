import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../data/attendance_repository_impl.dart';
import '../../data/location_service.dart';
import '../../data/selfie_service.dart';
import '../../domain/entities/today_status.dart';
import '../../domain/repositories/attendance_repository.dart';
import '../../domain/entities/geo_point.dart';

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  return AttendanceRepositoryImpl(ref.watch(apiClientProvider));
});

final locationServiceProvider = Provider<LocationService>((ref) => LocationService());
final selfieServiceProvider = Provider<SelfieService>((ref) => SelfieService());

/// Loads today's attendance and owns the check-in/out action. The screen reads
/// this as an [AsyncValue] for first-class loading/error/data handling.
class TodayController extends AsyncNotifier<TodayStatus> {
  AttendanceRepository get _repo => ref.read(attendanceRepositoryProvider);
  LocationService get _location => ref.read(locationServiceProvider);
  SelfieService get _selfie => ref.read(selfieServiceProvider);

  @override
  Future<TodayStatus> build() => _repo.getToday();

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => _repo.getToday());
  }

  /// Captures GPS and punches in or out based on the current state. Check-IN
  /// REQUIRES a live front-camera selfie (biometric) — there is no GPS-only
  /// fallback: if the user cancels or the camera is unavailable, the check-in is
  /// aborted. Throws (SelfieCancelled / LocationException / ApiException) so the
  /// screen can show the reason; on success the state is updated.
  Future<bool> togglePunch() async {
    final current = state.valueOrNull;
    final checkIn = !(current?.isCheckedIn ?? false);

    String? faceImageKey;
    if (checkIn) {
      // Mandatory: capture() throws SelfieCancelled (user backed out) or a
      // camera/permission error — either way we do NOT check them in.
      final Uint8List selfie = await _selfie.capture();
      faceImageKey = await _repo.uploadSelfie(selfie);
    }

    final fix = await _location.currentPosition();
    final updated = await _repo.punch(
      kind: checkIn ? PunchKind.checkIn : PunchKind.checkOut,
      location: fix,
      faceImageKey: faceImageKey,
    );
    state = AsyncData(updated);
    return checkIn;
  }

  /// Completes a check-in whose selfie and GPS fix were already gathered by the
  /// stepped sheet.
  ///
  /// The one-shot [togglePunch] captures both itself, which is right for a
  /// single tap. The guided flow collects them across three screens and needs to
  /// commit what the user already reviewed — re-capturing at the end would
  /// re-open the camera after they had confirmed.
  Future<void> commitCheckIn({required String faceImageKey, required GeoPoint fix}) async {
    final updated = await _repo.punch(
      kind: PunchKind.checkIn,
      location: fix,
      faceImageKey: faceImageKey,
    );
    state = AsyncData(updated);
  }

  /// Uploads a captured selfie and returns its storage key.
  Future<String> uploadSelfie(Uint8List bytes) => _repo.uploadSelfie(bytes);

  /// Current GPS fix, exposed so the sheet can show where the user is before
  /// committing.
  Future<GeoPoint> currentPosition() => _location.currentPosition();

  /// Starts or ends a break. Returns true if a break was just started.
  Future<bool> toggleBreak() async {
    final current = state.valueOrNull;
    final start = !(current?.isOnBreak ?? false);
    final fix = await _location.currentPosition();
    final updated = await _repo.punch(kind: start ? PunchKind.breakStart : PunchKind.breakEnd, location: fix);
    state = AsyncData(updated);
    return start;
  }
}

final todayControllerProvider =
    AsyncNotifierProvider<TodayController, TodayStatus>(TodayController.new);
