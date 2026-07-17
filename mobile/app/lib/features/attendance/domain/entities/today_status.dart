/// The employee's attendance snapshot for today (mirrors `GET /attendance/me/today`).
class TodayStatus {
  const TodayStatus({
    required this.date,
    required this.status,
    required this.isCheckedIn,
    required this.isOnBreak,
    required this.workedMinutes,
    required this.breakMinutes,
    required this.overtimeMinutes,
    required this.lateMinutes,
    this.firstInAt,
    this.lastOutAt,
    this.lastPunchAt,
    this.lastPunchType,
    this.activeSessionId,
  });

  final String date;
  final String status; // present | absent | late | half_day | ...
  final bool isCheckedIn;
  final bool isOnBreak;
  final int workedMinutes;
  final int breakMinutes;
  final int overtimeMinutes;
  final int lateMinutes;
  final DateTime? firstInAt;
  final DateTime? lastOutAt;
  final DateTime? lastPunchAt;
  final String? lastPunchType;
  final String? activeSessionId;

  bool get hasCheckedInToday => firstInAt != null;

  /// "7h 24m" from worked minutes.
  String get workedLabel => _hm(workedMinutes);
  String get breakLabel => _hm(breakMinutes);

  static String _hm(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    if (h == 0) return '${m}m';
    return '${h}h ${m}m';
  }

  TodayStatus copyWith({bool? isCheckedIn, bool? isOnBreak}) => TodayStatus(
        date: date,
        status: status,
        isCheckedIn: isCheckedIn ?? this.isCheckedIn,
        isOnBreak: isOnBreak ?? this.isOnBreak,
        workedMinutes: workedMinutes,
        breakMinutes: breakMinutes,
        overtimeMinutes: overtimeMinutes,
        lateMinutes: lateMinutes,
        firstInAt: firstInAt,
        lastOutAt: lastOutAt,
        lastPunchAt: lastPunchAt,
        lastPunchType: lastPunchType,
        activeSessionId: activeSessionId,
      );
}
