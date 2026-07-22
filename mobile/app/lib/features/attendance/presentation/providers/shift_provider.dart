import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../../../core/network/json_num.dart';

/// The organisation's working day, as configured in Attendance Settings.
///
/// This used to be a hardcoded `8 * 60` on the Home screen. That was wrong in
/// two ways: it ignored the admin's office hours entirely, and it did not even
/// match the current configuration — 09:00–17:00 with a 60-minute break is a
/// 7-hour working day, so the progress ring read 97% when the employee had
/// actually completed their day.
///
/// The formula mirrors PayrollService.officeMinutesPerDay exactly, so the
/// target an employee sees on Home is the same number their pay is capped at.
/// If those two ever disagree, someone is working unpaid time.
class ShiftTarget {
  const ShiftTarget({
    required this.targetMinutes,
    required this.startTime,
    required this.endTime,
    required this.breakMinutes,
  });

  final int targetMinutes;
  final String startTime;
  final String endTime;
  final int breakMinutes;

  /// "7h" or "7h 30m" — for the `of …` label beside hours worked.
  String get label {
    final h = targetMinutes ~/ 60;
    final m = targetMinutes % 60;
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  /// Sensible default if settings cannot be read, matching the server's own
  /// fallback of 480 minutes.
  static const fallback = ShiftTarget(
    targetMinutes: 480,
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 0,
  );
}

int _minutesOfDay(String hhmm) {
  final parts = hhmm.split(':');
  if (parts.length < 2) return 0;
  return (int.tryParse(parts[0]) ?? 0) * 60 + (int.tryParse(parts[1]) ?? 0);
}

final shiftTargetProvider = FutureProvider<ShiftTarget>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final s = await api.get('/attendance/settings') as Map<String, dynamic>;
    final oh = (s['officeHours'] as Map?)?.cast<String, dynamic>() ?? const {};
    final start = oh['startTime']?.toString() ?? '09:00';
    final end = oh['endTime']?.toString() ?? '17:00';
    final breakMinutes = asInt(oh['breakMinutes'], 0);

    var mins = _minutesOfDay(end) - _minutesOfDay(start);
    if (mins < 0) mins += 24 * 60; // shift crosses midnight
    final target = (mins - breakMinutes).clamp(1, 24 * 60);

    return ShiftTarget(
      targetMinutes: target,
      startTime: start,
      endTime: end,
      breakMinutes: breakMinutes,
    );
  } catch (_) {
    return ShiftTarget.fallback;
  }
});
