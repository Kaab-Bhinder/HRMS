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
                      HeroSurface(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_isCurrentMonth ? 'EARNED THIS MONTH' : 'EARNED',
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
                                        gradient: const LinearGradient(
                                            colors: [Color(0xFF8FD8FF), Color(0xFF5BE0A8)]),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            Text('${s.progressPct}% of the month recorded',
                                style: context.text.labelSmall
                                    ?.copyWith(color: HeroSurface.onHeroMuted, letterSpacing: 0.1)),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),

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
                            label: 'Payable hours',
                            value: '${s.payableHours}h',
                            hint: 'of ${s.workedHours}h worked',
                          ),
                          const SizedBox(width: AppSpacing.md),
                          _Stat(
                            label: 'Days present',
                            value: '${s.daysPresent}',
                            hint: '${s.officeHoursPerDay}h office day',
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          _Stat(
                            label: 'Hourly rate',
                            value: s.hasRate ? '$cur${money.format(s.payPerHour)}' : '—',
                            hint: s.hasRate ? 'Current rate' : 'Not set by HR yet',
                          ),
                          const SizedBox(width: AppSpacing.md),
                          _Stat(
                            label: 'Late time',
                            value: '${s.lateMinutes} min',
                            hint: 'This month',
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      Text(context.tr('Daily breakdown'), style: context.text.titleLarge),
                      const SizedBox(height: AppSpacing.md),
                      if (s.days.isEmpty)
                        const AppCard(child: EmptyState(
                            icon: Icons.receipt_long_rounded,
                            title: 'Nothing yet',
                            message: 'Pay will appear as you record attendance.'))
                      else
                        _PayTable(days: s.days, money: money),
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
  const _PayTable({required this.days, required this.money});
  final List<PayslipDay> days;
  final NumberFormat money;

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
        columnWidths: const {0: FixedColumnWidth(52), 1: FlexColumnWidth(1), 2: FixedColumnWidth(50), 3: FixedColumnWidth(72)},
        defaultVerticalAlignment: TableCellVerticalAlignment.middle,
        children: [
          TableRow(children: [
            cell(Text('Date', style: head)),
            cell(Text('Status', style: head)),
            cell(Text('Hrs', style: head, textAlign: TextAlign.right), right: true),
            cell(Text('Pay', style: head, textAlign: TextAlign.right), right: true),
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
                cell(Text(money.format(d.pay), style: t.titleSmall?.copyWith(fontWeight: FontWeight.w700), textAlign: TextAlign.right), right: true),
              ],
            ),
        ],
      ),
    );
  }
}

