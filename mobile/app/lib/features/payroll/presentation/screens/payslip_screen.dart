import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/progress_ring.dart';
import '../../../../core/widgets/skeleton.dart';
import '../providers/payslip_provider.dart';

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
                data: (s) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppCard(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_isCurrentMonth ? 'EARNED SO FAR' : 'EARNED', style: AppTypography.overline(c.mutedForeground)),
                                const SizedBox(height: 4),
                                Text(money.format(s.earnedPay), style: AppTypography.numeric(30, FontWeight.w800, c.foreground)),
                                const SizedBox(height: AppSpacing.sm),
                                if (s.hasRate)
                                  Text('${money.format(s.payPerHour)} / hr · ${s.payableHours}h payable', style: context.text.bodySmall?.copyWith(color: c.mutedForeground))
                                else
                                  Text('No hourly rate set yet', style: context.text.bodySmall?.copyWith(color: c.warning)),
                              ],
                            ),
                          ),
                          ProgressRing(
                            value: (s.progressPct / 100).clamp(0.0, 1.0),
                            size: 96,
                            stroke: 9,
                            center: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('${s.progressPct}%', style: AppTypography.numeric(18, FontWeight.w700, c.foreground)),
                                Text('of month', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        _Mini(label: 'Projected', value: money.format(s.potentialPay), tone: c.info),
                        const SizedBox(width: AppSpacing.md),
                        _Mini(label: 'Days present', value: '${s.daysPresent}', tone: c.success),
                        const SizedBox(width: AppSpacing.md),
                        _Mini(label: 'Late (min)', value: '${s.lateMinutes}', tone: c.warning),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Text('Daily breakdown', style: context.text.titleMedium),
                    const SizedBox(height: AppSpacing.md),
                    if (s.days.isEmpty)
                      const AppCard(child: EmptyState(icon: Icons.receipt_long_rounded, title: 'Nothing yet', message: 'Pay will appear as you record attendance.'))
                    else
                      _PayTable(days: s.days, money: money),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

}

/// Compact tabular daily pay breakdown — Date · Status · Payable · Pay.
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

class _Mini extends StatelessWidget {
  const _Mini({required this.label, required this.value, required this.tone});
  final String label;
  final String value;
  final Color tone;
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: AppCard(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.sm),
        child: Column(
          children: [
            Text(value, style: AppTypography.numeric(18, FontWeight.w700, tone)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, style: context.text.bodySmall?.copyWith(color: context.colors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}
