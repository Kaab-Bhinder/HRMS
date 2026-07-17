import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../../access/access_providers.dart';

/// One day in the attendance slip.
class SlipDay {
  const SlipDay({
    required this.date,
    required this.status,
    required this.workedMinutes,
    required this.lateMinutes,
    required this.breakMinutes,
    required this.isFlagged,
    this.firstInAt,
    this.lastOutAt,
    this.flagReason,
  });

  final DateTime date;
  final String status;
  final int workedMinutes;
  final int lateMinutes;
  final int breakMinutes;
  final bool isFlagged;
  final DateTime? firstInAt;
  final DateTime? lastOutAt;
  final String? flagReason;

  static SlipDay fromJson(Map<String, dynamic> j) {
    DateTime? dt(dynamic v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();
    return SlipDay(
      date: dt(j['workDate']) ?? DateTime.now(),
      status: j['status']?.toString() ?? 'absent',
      workedMinutes: (j['workedMinutes'] as num?)?.toInt() ?? 0,
      lateMinutes: (j['lateMinutes'] as num?)?.toInt() ?? 0,
      breakMinutes: (j['breakMinutes'] as num?)?.toInt() ?? 0,
      isFlagged: j['isFlagged'] as bool? ?? false,
      firstInAt: dt(j['firstInAt']),
      lastOutAt: dt(j['lastOutAt']),
      flagReason: j['flagReason']?.toString(),
    );
  }
}

class AttendanceSlip {
  const AttendanceSlip({required this.present, required this.late, required this.absent, required this.workedHours, required this.days});
  final int present;
  final int late;
  final int absent;
  final double workedHours;
  final List<SlipDay> days;

  static AttendanceSlip fromJson(Map<String, dynamic> j) {
    final totals = (j['totals'] as Map?)?.cast<String, dynamic>() ?? const {};
    return AttendanceSlip(
      present: (totals['present'] as num?)?.toInt() ?? 0,
      late: (totals['late'] as num?)?.toInt() ?? 0,
      absent: (totals['absent'] as num?)?.toInt() ?? 0,
      workedHours: (totals['workedHours'] as num?)?.toDouble() ?? 0,
      days: (j['days'] as List?)?.map((e) => SlipDay.fromJson((e as Map).cast<String, dynamic>())).toList().reversed.toList() ?? const [],
    );
  }
}

String _fmtDate(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

/// Attendance slip for the signed-in employee for the given month (first-of-month).
final mySlipProvider = FutureProvider.family<AttendanceSlip, DateTime>((ref, month) async {
  final api = ref.watch(apiClientProvider);
  final scope = await ref.watch(meScopeProvider.future);
  final employeeId = scope.employeeId;
  if (employeeId == null) throw Exception('No employee record is linked to your account.');
  final from = DateTime(month.year, month.month, 1);
  final to = DateTime(month.year, month.month + 1, 0);
  final data = await api.get('/attendance/slip', query: {
    'employeeId': employeeId,
    'from': _fmtDate(from),
    'to': _fmtDate(to),
  }) as Map<String, dynamic>;
  return AttendanceSlip.fromJson(data);
});
