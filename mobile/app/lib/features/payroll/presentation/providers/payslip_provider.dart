import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../../access/access_providers.dart';
import '../../../../core/network/json_num.dart';

class PayslipDay {
  const PayslipDay({required this.date, required this.status, required this.payableMinutes, required this.pay, required this.isFlagged});
  final DateTime date;
  final String status;
  final int payableMinutes;
  final double pay;
  final bool isFlagged;

  static PayslipDay fromJson(Map<String, dynamic> j) {
    return PayslipDay(
      date: DateTime.tryParse(j['workDate']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      status: j['status']?.toString() ?? 'absent',
      payableMinutes: asInt(j['payableMinutes'], 0),
      pay: asDouble(j['pay'], 0),
      isFlagged: j['isFlagged'] as bool? ?? false,
    );
  }
}

class Payslip {
  const Payslip({
    required this.earnedPay,
    required this.potentialPay,
    required this.payableHours,
    required this.progressPct,
    required this.daysPresent,
    required this.lateMinutes,
    required this.officeHoursPerDay,
    required this.payPerHour,
    required this.days,
  });

  final double earnedPay;
  final double potentialPay;
  final double payableHours;
  final int progressPct;
  final int daysPresent;
  final int lateMinutes;
  final double officeHoursPerDay;
  final double? payPerHour;
  final List<PayslipDay> days;

  bool get hasRate => payPerHour != null;

  static Payslip fromJson(Map<String, dynamic> j) {
    return Payslip(
      earnedPay: asDouble(j['earnedPay'], 0),
      potentialPay: asDouble(j['potentialPay'], 0),
      payableHours: asDouble(j['payableHours'], 0),
      progressPct: asInt(j['progressPct'], 0),
      daysPresent: asInt(j['daysPresent'], 0),
      lateMinutes: asInt(j['lateMinutes'], 0),
      officeHoursPerDay: asDouble(j['officeHoursPerDay'], 8),
      payPerHour: asDoubleOrNull(j['payPerHour']),
      days: (j['days'] as List?)?.map((e) => PayslipDay.fromJson((e as Map).cast<String, dynamic>())).toList().reversed.toList() ?? const [],
    );
  }
}

/// Payslip for the signed-in employee for the given month (first-of-month).
final myPayslipProvider = FutureProvider.family<Payslip, DateTime>((ref, month) async {
  final api = ref.watch(apiClientProvider);
  final scope = await ref.watch(meScopeProvider.future);
  final employeeId = scope.employeeId;
  if (employeeId == null) throw Exception('No employee record is linked to your account.');
  final data = await api.get('/payroll/payslip', query: {
    'employeeId': employeeId,
    'year': '${month.year}',
    'month': '${month.month}',
  }) as Map<String, dynamic>;
  return Payslip.fromJson(data);
});
