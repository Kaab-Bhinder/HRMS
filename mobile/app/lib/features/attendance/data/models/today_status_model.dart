import '../../domain/entities/today_status.dart';
import '../../../../core/network/json_num.dart';

class TodayStatusModel {
  static TodayStatus fromJson(Map<String, dynamic> j) {
    DateTime? dt(dynamic v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();
    return TodayStatus(
      date: j['date']?.toString() ?? '',
      status: j['status']?.toString() ?? 'absent',
      isCheckedIn: j['isCheckedIn'] as bool? ?? false,
      isOnBreak: j['isOnBreak'] as bool? ?? false,
      workedMinutes: asInt(j['workedMinutes'], 0),
      breakMinutes: asInt(j['breakMinutes'], 0),
      overtimeMinutes: asInt(j['overtimeMinutes'], 0),
      lateMinutes: asInt(j['lateMinutes'], 0),
      firstInAt: dt(j['firstInAt']),
      lastOutAt: dt(j['lastOutAt']),
      lastPunchAt: dt(j['lastPunchAt']),
      lastPunchType: j['lastPunchType']?.toString(),
      activeSessionId: j['activeSessionId']?.toString(),
    );
  }
}
