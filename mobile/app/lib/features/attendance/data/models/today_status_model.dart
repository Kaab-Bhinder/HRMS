import '../../domain/entities/today_status.dart';

class TodayStatusModel {
  static TodayStatus fromJson(Map<String, dynamic> j) {
    DateTime? dt(dynamic v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();
    return TodayStatus(
      date: j['date']?.toString() ?? '',
      status: j['status']?.toString() ?? 'absent',
      isCheckedIn: j['isCheckedIn'] as bool? ?? false,
      isOnBreak: j['isOnBreak'] as bool? ?? false,
      workedMinutes: (j['workedMinutes'] as num?)?.toInt() ?? 0,
      breakMinutes: (j['breakMinutes'] as num?)?.toInt() ?? 0,
      overtimeMinutes: (j['overtimeMinutes'] as num?)?.toInt() ?? 0,
      lateMinutes: (j['lateMinutes'] as num?)?.toInt() ?? 0,
      firstInAt: dt(j['firstInAt']),
      lastOutAt: dt(j['lastOutAt']),
      lastPunchAt: dt(j['lastPunchAt']),
      lastPunchType: j['lastPunchType']?.toString(),
      activeSessionId: j['activeSessionId']?.toString(),
    );
  }
}
