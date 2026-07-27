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
    required this.compensationType,
    required this.earnedPay,
    required this.potentialPay,
    required this.payableHours,
    required this.progressPct,
    required this.daysPresent,
    required this.lateMinutes,
    required this.officeHoursPerDay,
    required this.workedHours,
    required this.payPerHour,
    required this.basicSalary,
    required this.grossPay,
    required this.deductions,
    required this.netPay,
    required this.unpaidLeaveDays,
    required this.workingDaysTotal,
    required this.finalized,
    required this.currency,
    required this.days,
  });

  /// 'monthly' (fixed salary, unpaid leave deducts) or 'hourly' (attendance ×
  /// rate). Decides which layout the screen renders.
  final String compensationType;
  final double earnedPay;
  final double potentialPay;
  final double payableHours;
  final int progressPct;
  final int daysPresent;
  final int lateMinutes;
  final double officeHoursPerDay;

  /// Hours actually worked, before the office-hours cap. Shown next to
  /// payableHours so the cap is visible rather than looking like lost time.
  final double workedHours;
  final double? payPerHour;

  // Monthly-salary figures. basicSalary is null when HR hasn't set one (or for
  // hourly employees); netPay/deductions are always present — for hourly they
  // mirror earnedPay/0 so the caller can read one field regardless of type.
  final double? basicSalary;
  final double grossPay;
  final double deductions;
  final double netPay;
  final double unpaidLeaveDays;
  final int workingDaysTotal;

  /// True once HR finalized this month — the figures are locked history.
  final bool finalized;

  /// ISO code from the organization (e.g. IDR). The API sends it so the app
  /// never has to guess — a wrong symbol on a payslip is worse than none.
  final String currency;
  final List<PayslipDay> days;

  bool get isMonthly => compensationType == 'monthly';
  bool get hasRate => payPerHour != null;
  bool get hasSalary => basicSalary != null;

  static Payslip fromJson(Map<String, dynamic> j) {
    return Payslip(
      compensationType: j['compensationType']?.toString() ?? 'hourly',
      earnedPay: asDouble(j['earnedPay'], 0),
      potentialPay: asDouble(j['potentialPay'], 0),
      payableHours: asDouble(j['payableHours'], 0),
      progressPct: asInt(j['progressPct'], 0),
      daysPresent: asInt(j['daysPresent'], 0),
      lateMinutes: asInt(j['lateMinutes'], 0),
      officeHoursPerDay: asDouble(j['officeHoursPerDay'], 8),
      workedHours: asDouble(j['workedHours'], 0),
      payPerHour: asDoubleOrNull(j['payPerHour']),
      basicSalary: asDoubleOrNull(j['basicSalary']),
      grossPay: asDouble(j['grossPay'], 0),
      deductions: asDouble(j['deductions'], 0),
      netPay: asDouble(j['netPay'], 0),
      unpaidLeaveDays: asDouble(j['unpaidLeaveDays'], 0),
      workingDaysTotal: asInt(j['workingDaysTotal'], 0),
      finalized: j['finalized'] as bool? ?? false,
      currency: j['currency']?.toString() ?? '',
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
