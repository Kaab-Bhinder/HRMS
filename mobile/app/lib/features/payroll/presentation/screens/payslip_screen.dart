import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/hero_surface.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/skeleton.dart';
import '../providers/payslip_provider.dart';
import '../../../../core/i18n/app_i18n.dart';

class PayslipScreen extends ConsumerStatefulWidget {
  const PayslipScreen({super.key});

  @override
  ConsumerState<PayslipScreen> createState() => _PayslipScreenState();
}

class _PayslipScreenState extends ConsumerState<PayslipScreen> {
  late DateTime _month = DateTime(DateTime.now().year, DateTime.now().month, 1);

  bool get _isCurrentMonth {
    final now = DateTime.now();
    return _month.year == now.year && _month.month == now.month;
  }

  void _shift(int by) => setState(() => _month = DateTime(_month.year, _month.month + by, 1));

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final slip = ref.watch(myPayslipProvider(_month));
    final money = NumberFormat.decimalPattern();

    return Scaffold(
      appBar: AppBar(title: const Text('My Payslip')),
      body: SafeArea(
        child: RefreshIndicator(
          color: c.primary,
          onRefresh: () async => ref.invalidate(myPayslipProvider(_month)),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.md, AppSpacing.screen, AppSpacing.xl3),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(onPressed: () => _shift(-1), icon: const Icon(Icons.chevron_left_rounded)),
                  Text(DateFormat('MMMM yyyy').format(_month), style: context.text.titleMedium),
                  IconButton(onPressed: _isCurrentMonth ? null : () => _shift(1), icon: Icon(Icons.chevron_right_rounded, color: _isCurrentMonth ? c.mutedForeground.withValues(alpha: 0.4) : c.foreground)),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              slip.when(
                loading: () => const Column(children: [Skeleton(height: 150, radius: AppRadius.xl), SizedBox(height: AppSpacing.md), Skeleton(height: 220, radius: AppRadius.xl)]),
                error: (e, _) => AppCard(child: ErrorStateView(message: e is ApiException ? e.message : 'Couldn’t load your payslip.', onRetry: () => ref.invalidate(myPayslipProvider(_month)))),
                data: (s) {
                  final cur = s.currency.isEmpty ? '' : '${s.currency} ';
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (s.isMonthly)
                        _MonthlyHero(slip: s, cur: cur, money: money, isCurrentMonth: _isCurrentMonth, month: _month)
                      else
                        _HourlyHero(slip: s, cur: cur, money: money, isCurrentMonth: _isCurrentMonth),
                      const SizedBox(height: AppSpacing.md),

                      if (s.isMonthly) ...[
                        // Fixed salary: the only thing that reduces it is unpaid
                        // leave, so say exactly that instead of the hourly cap rule.
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: c.tint(c.info, 0.10),
                            borderRadius: AppRadius.rLg,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.info_outline_rounded, size: 16, color: c.info),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  context.tr('Your salary is fixed for the month. Only approved unpaid leave reduces it.'),
                                  style: context.text.bodySmall?.copyWith(color: c.foreground),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          children: [
                            _Stat(
                              label: context.tr('Basic salary'),
                              value: s.hasSalary ? '$cur${money.format(s.basicSalary)}' : '—',
                              hint: s.hasSalary ? context.tr('per month') : context.tr('Not set by HR yet'),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            _Stat(
                              label: context.tr('Deductions'),
                              value: s.deductions > 0 ? '−$cur${money.format(s.deductions)}' : '—',
                              hint: s.unpaidLeaveDays > 0
                                  ? '${_trimD(s.unpaidLeaveDays)} ${context.tr(s.unpaidLeaveDays == 1 ? 'day unpaid leave' : 'days unpaid leave')}'
                                  : context.tr('No unpaid leave'),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          children: [
                            _Stat(
                              label: context.tr('Days present'),
                              value: '${s.daysPresent}',
                              hint: '${context.tr('of')} ${s.workingDaysTotal} ${context.tr('working days')}',
                            ),
                            const SizedBox(width: AppSpacing.md),
                            _Stat(
                              label: context.tr('Late time'),
                              value: '${s.lateMinutes} min',
                              hint: context.tr('This month'),
                            ),
                          ],
                        ),
                      ] else ...[
                        // The cap is the single most misread rule on this screen:
                        // extra hours do not increase pay. Saying so here prevents
                        // "my payslip is wrong" conversations.
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: c.tint(c.info, 0.10),
                            borderRadius: AppRadius.rLg,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.info_outline_rounded, size: 16, color: c.info),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  'Pay is based on recorded office hours. Time beyond scheduled hours '
                                  'does not increase payable hours.',
                                  style: context.text.bodySmall?.copyWith(color: c.foreground),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          children: [
                            _Stat(
                              label: context.tr('Payable hours'),
                              value: '${s.payableHours}h',
                              hint: 'of ${s.workedHours}h worked',
                            ),
                            const SizedBox(width: AppSpacing.md),
                            _Stat(
                              label: context.tr('Days present'),
                              value: '${s.daysPresent}',
                              hint: '${s.officeHoursPerDay}h office day',
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          children: [
                            _Stat(
                              label: context.tr('Hourly rate'),
                              value: s.hasRate ? '$cur${money.format(s.payPerHour)}' : '—',
                              hint: context.tr(s.hasRate ? 'Current rate' : 'Not set by HR yet'),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            _Stat(
                              label: context.tr('Late time'),
                              value: '${s.lateMinutes} min',
                              hint: context.tr('This month'),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: AppSpacing.xl),

                      Text(context.tr(s.isMonthly ? 'Attendance this month' : 'Daily breakdown'), style: context.text.titleLarge),
                      const SizedBox(height: AppSpacing.md),
                      if (s.days.isEmpty)
                        const AppCard(child: EmptyState(
                            icon: Icons.receipt_long_rounded,
                            title: 'Nothing yet',
                            message: 'Pay will appear as you record attendance.'))
                      else
                        _PayTable(days: s.days, money: money, showPay: !s.isMonthly),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

}

/// Drop a trailing ".0" so 5.0 reads as 5 but a half-day stays 0.5.
String _trimD(double v) => v == v.roundToDouble() ? v.toInt().toString() : v.toStringAsFixed(1);

/// Hero for monthly-salary employees: net pay for the month, the deduction
/// line when unpaid leave exists, payday countdown for the live month, and a
/// lock note once HR finalizes.
class _MonthlyHero extends StatelessWidget {
  const _MonthlyHero({required this.slip, required this.cur, required this.money, required this.isCurrentMonth, required this.month});
  final Payslip slip;
  final String cur;
  final NumberFormat money;
  final bool isCurrentMonth;
  final DateTime month;

  @override
  Widget build(BuildContext context) {
    final s = slip;
    final now = DateTime.now();
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final daysLeft = isCurrentMonth ? daysInMonth - now.day : 0;

    return HeroSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(context.tr(isCurrentMonth ? 'SALARY THIS MONTH' : 'NET PAY'),
                    style: AppTypography.overline(HeroSurface.onHeroMuted)),
              ),
              if (s.finalized)
                Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.lock_rounded, size: 12, color: HeroSurface.onHeroMuted),
                  const SizedBox(width: 4),
                  Text(context.tr('Finalized'), style: AppTypography.overline(HeroSurface.onHeroMuted)),
                ]),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(s.hasSalary ? '$cur${money.format(s.netPay)}' : '—',
              style: AppTypography.numeric(34, FontWeight.w700, HeroSurface.onHero)),
          const SizedBox(height: 2),
          Text(
            // Don't announce "full salary" when HR hasn't set one — the 0
            // would read as an actual (terrifying) payslip figure.
            !s.hasSalary
                ? context.tr('Not set by HR yet')
                : s.deductions > 0
                    ? '${context.tr('Basic')} $cur${money.format(s.basicSalary ?? 0)} − $cur${money.format(s.deductions)} ${context.tr('unpaid leave')}'
                    : context.tr('Full basic salary — no deductions'),
            style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted),
          ),
          if (isCurrentMonth) ...[
            const SizedBox(height: AppSpacing.lg),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: Stack(
                children: [
                  Container(height: 7, color: Colors.white.withValues(alpha: 0.18)),
                  LayoutBuilder(
                    builder: (context, box) => Container(
                      height: 7,
                      width: box.maxWidth * (now.day / daysInMonth).clamp(0.0, 1.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        gradient: const LinearGradient(colors: [Color(0xFF8FD8FF), Color(0xFF5BE0A8)]),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              daysLeft <= 0
                  ? context.tr('Payday is here')
                  : '$daysLeft ${context.tr(daysLeft == 1 ? 'day to payday' : 'days to payday')}',
              style: context.text.labelSmall?.copyWith(color: HeroSurface.onHeroMuted, letterSpacing: 0.1),
            ),
          ],
        ],
      ),
    );
  }
}

/// Hero for hourly employees — earned so far against the month's potential.
class _HourlyHero extends StatelessWidget {
  const _HourlyHero({required this.slip, required this.cur, required this.money, required this.isCurrentMonth});
  final Payslip slip;
  final String cur;
  final NumberFormat money;
  final bool isCurrentMonth;

  @override
  Widget build(BuildContext context) {
    final s = slip;
    return HeroSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.tr(isCurrentMonth ? 'EARNED THIS MONTH' : 'EARNED'),
              style: AppTypography.overline(HeroSurface.onHeroMuted)),
          const SizedBox(height: AppSpacing.sm),
          Text('$cur${money.format(s.earnedPay)}',
              style: AppTypography.numeric(34, FontWeight.w700, HeroSurface.onHero)),
          const SizedBox(height: 2),
          Text('of $cur${money.format(s.potentialPay)} potential',
              style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted)),
          const SizedBox(height: AppSpacing.lg),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: Stack(
              children: [
                Container(height: 7, color: Colors.white.withValues(alpha: 0.18)),
                LayoutBuilder(
                  builder: (context, box) => Container(
                    height: 7,
                    width: box.maxWidth * (s.progressPct / 100).clamp(0.0, 1.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      gradient: const LinearGradient(colors: [Color(0xFF8FD8FF), Color(0xFF5BE0A8)]),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('${s.progressPct}% of the month recorded',
              style: context.text.labelSmall?.copyWith(color: HeroSurface.onHeroMuted, letterSpacing: 0.1)),
        ],
      ),
    );
  }
}

/// Compact tabular daily pay breakdown — Date · Status · Payable · Pay.
/// One figure in the 2x2 grid.
class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.hint});
  final String label;
  final String value;
  final String hint;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Expanded(
      child: AppCard(
        radius: AppRadius.rXl,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            const SizedBox(height: 4),
            Text(value, style: AppTypography.numeric(20, FontWeight.w700, c.foreground)),
            const SizedBox(height: 2),
            Text(hint,
                style: context.text.labelSmall?.copyWith(color: c.mutedForeground, letterSpacing: 0),
                maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class _PayTable extends StatelessWidget {
  const _PayTable({required this.days, required this.money, this.showPay = true});
  final List<PayslipDay> days;
  final NumberFormat money;

  /// Monthly employees don't accrue pay per day — their table is an attendance
  /// record, so the per-day Pay column (all zeros) is dropped.
  final bool showPay;

  static Color _dot(BuildContext context, String s) {
    final c = context.colors;
    return switch (s) {
      'present' => c.success,
      'late' => c.warning,
      'half_day' => c.accent,
      'absent' => c.danger,
      _ => c.mutedForeground,
    };
  }

  static String _shortStatus(String s) => switch (s) {
        'half_day' => 'Half day',
        'on_leave' => 'Leave',
        'weekly_off' => 'Off',
        _ => '${s[0].toUpperCase()}${s.substring(1)}',
      };
  static String _hours(int m) => m == 0 ? '—' : (m / 60).toStringAsFixed(1);

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final t = context.text;
    final head = t.labelSmall?.copyWith(color: c.mutedForeground, fontWeight: FontWeight.w600);
    Widget cell(Widget child, {bool right = false}) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 9),
          child: Align(alignment: right ? Alignment.centerRight : Alignment.centerLeft, child: child),
        );

    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      child: Table(
        border: TableBorder(horizontalInside: BorderSide(color: c.border, width: 0.7)),
        columnWidths: showPay
            ? const {0: FixedColumnWidth(52), 1: FlexColumnWidth(1), 2: FixedColumnWidth(50), 3: FixedColumnWidth(72)}
            : const {0: FixedColumnWidth(64), 1: FlexColumnWidth(1), 2: FixedColumnWidth(56)},
        defaultVerticalAlignment: TableCellVerticalAlignment.middle,
        children: [
          TableRow(children: [
            cell(Text('Date', style: head)),
            cell(Text('Status', style: head)),
            cell(Text('Hrs', style: head, textAlign: TextAlign.right), right: true),
            if (showPay) cell(Text('Pay', style: head, textAlign: TextAlign.right), right: true),
          ]),
          for (final d in days)
            TableRow(
              decoration: d.isFlagged ? BoxDecoration(color: c.danger.withValues(alpha: 0.06)) : null,
              children: [
                cell(Text(DateFormat('d MMM').format(d.date), style: t.titleSmall?.copyWith(fontSize: 13))),
                cell(Row(mainAxisSize: MainAxisSize.min, children: [
                  Container(width: 7, height: 7, decoration: BoxDecoration(color: _dot(context, d.status), shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  Flexible(child: Text(_shortStatus(d.status), style: t.labelSmall?.copyWith(color: c.foreground), overflow: TextOverflow.ellipsis)),
                ])),
                cell(Text(_hours(d.payableMinutes), style: t.bodySmall, textAlign: TextAlign.right), right: true),
                if (showPay) cell(Text(money.format(d.pay), style: t.titleSmall?.copyWith(fontWeight: FontWeight.w700), textAlign: TextAlign.right), right: true),
              ],
            ),
        ],
      ),
    );
  }
}

