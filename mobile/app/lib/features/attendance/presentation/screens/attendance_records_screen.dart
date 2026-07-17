import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/skeleton.dart';
import '../../../../core/widgets/status_pill.dart';
import '../providers/records_provider.dart';

class AttendanceRecordsScreen extends ConsumerStatefulWidget {
  const AttendanceRecordsScreen({super.key});

  @override
  ConsumerState<AttendanceRecordsScreen> createState() => _AttendanceRecordsScreenState();
}

class _AttendanceRecordsScreenState extends ConsumerState<AttendanceRecordsScreen> {
  late DateTime _month = DateTime(DateTime.now().year, DateTime.now().month, 1);

  bool get _isCurrentMonth {
    final now = DateTime.now();
    return _month.year == now.year && _month.month == now.month;
  }

  void _shift(int by) => setState(() => _month = DateTime(_month.year, _month.month + by, 1));

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final slip = ref.watch(mySlipProvider(_month));

    return Scaffold(
      appBar: AppBar(title: const Text('My Attendance')),
      body: SafeArea(
        child: RefreshIndicator(
          color: c.primary,
          onRefresh: () async => ref.invalidate(mySlipProvider(_month)),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.md, AppSpacing.screen, AppSpacing.xl3),
            children: [
              _MonthBar(label: DateFormat('MMMM yyyy').format(_month), canNext: !_isCurrentMonth, onPrev: () => _shift(-1), onNext: () => _shift(1)),
              const SizedBox(height: AppSpacing.lg),
              slip.when(
                loading: () => const Column(children: [Skeleton(height: 84, radius: AppRadius.xl), SizedBox(height: AppSpacing.md), Skeleton(height: 240, radius: AppRadius.xl)]),
                error: (e, _) => AppCard(child: ErrorStateView(message: e is ApiException ? e.message : 'Couldn’t load your records.', onRetry: () => ref.invalidate(mySlipProvider(_month)))),
                data: (s) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _Stat(label: 'Present', value: '${s.present}', tone: c.success),
                        const SizedBox(width: AppSpacing.md),
                        _Stat(label: 'Late', value: '${s.late}', tone: c.warning),
                        const SizedBox(width: AppSpacing.md),
                        _Stat(label: 'Absent', value: '${s.absent}', tone: c.danger),
                        const SizedBox(width: AppSpacing.md),
                        _Stat(label: 'Hours', value: '${s.workedHours}', tone: c.primary),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    if (s.days.isEmpty)
                      const AppCard(child: EmptyState(icon: Icons.event_busy_rounded, title: 'No records', message: 'No attendance was recorded this month.'))
                    else
                      _RecordsTable(days: s.days),
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

class _MonthBar extends StatelessWidget {
  const _MonthBar({required this.label, required this.canNext, required this.onPrev, required this.onNext});
  final String label;
  final bool canNext;
  final VoidCallback onPrev;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(onPressed: onPrev, icon: const Icon(Icons.chevron_left_rounded)),
        Text(label, style: context.text.titleMedium),
        IconButton(onPressed: canNext ? onNext : null, icon: Icon(Icons.chevron_right_rounded, color: canNext ? c.foreground : c.mutedForeground.withValues(alpha: 0.4))),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.tone});
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
            Text(value, style: AppTypography.numeric(20, FontWeight.w700, tone)),
            const SizedBox(height: 2),
            Text(label, style: context.text.bodySmall?.copyWith(color: context.colors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}

/// Compact tabular view of the month — one thin row per date with aligned
/// columns (Date · In · Out · Hrs · Status), instead of a card per day.
class _RecordsTable extends StatelessWidget {
  const _RecordsTable({required this.days});
  final List<SlipDay> days;

  static const _dot = {
    'present': PillTone.success, 'late': PillTone.warning, 'half_day': PillTone.accent,
    'absent': PillTone.danger, 'on_leave': PillTone.accent, 'weekly_off': PillTone.neutral, 'holiday': PillTone.neutral,
  };

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      child: Table(
        border: TableBorder(horizontalInside: BorderSide(color: c.border, width: 0.7)),
        columnWidths: const {
          0: FixedColumnWidth(50),
          1: FlexColumnWidth(1),
          2: FlexColumnWidth(1),
          3: FixedColumnWidth(46),
          4: FixedColumnWidth(78),
        },
        defaultVerticalAlignment: TableCellVerticalAlignment.middle,
        children: [
          _headerRow(context),
          for (final d in days) _dayRow(context, d),
        ],
      ),
    );
  }

  TableRow _headerRow(BuildContext context) {
    final s = context.text.labelSmall?.copyWith(color: context.colors.mutedForeground, fontWeight: FontWeight.w600);
    return TableRow(
      children: [
        _cell(Text('Date', style: s)),
        _cell(Text('In', style: s)),
        _cell(Text('Out', style: s)),
        _cell(Text('Hrs', style: s, textAlign: TextAlign.right), right: true),
        _cell(Text('Status', style: s, textAlign: TextAlign.right), right: true),
      ],
    );
  }

  TableRow _dayRow(BuildContext context, SlipDay d) {
    final c = context.colors;
    final t = context.text;
    final fmt = DateFormat('HH:mm');
    final tone = _dot[d.status] ?? PillTone.neutral;
    final dotColor = _toneColor(context, tone);
    return TableRow(
      decoration: d.isFlagged ? BoxDecoration(color: c.danger.withValues(alpha: 0.06)) : null,
      children: [
        _cell(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('${d.date.day} ${DateFormat('MMM').format(d.date)}', style: t.titleSmall?.copyWith(fontSize: 13)),
            Text(DateFormat('EEE').format(d.date), style: t.labelSmall?.copyWith(color: c.mutedForeground)),
          ],
        )),
        _cell(Text(d.firstInAt == null ? '—' : fmt.format(d.firstInAt!), style: t.bodySmall)),
        _cell(Text(d.lastOutAt == null ? (d.firstInAt == null ? '—' : '…') : fmt.format(d.lastOutAt!), style: t.bodySmall)),
        _cell(
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_hours(d.workedMinutes), style: t.bodySmall, textAlign: TextAlign.right),
              if (d.lateMinutes > 0) Text('${d.lateMinutes}m late', style: t.labelSmall?.copyWith(color: c.warning), textAlign: TextAlign.right),
            ],
          ),
          right: true,
        ),
        _cell(
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 7, height: 7, decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              Flexible(child: Text(_shortStatus(d.status), style: t.labelSmall?.copyWith(color: c.foreground), overflow: TextOverflow.ellipsis, textAlign: TextAlign.right)),
              if (d.isFlagged) ...[
                const SizedBox(width: 3),
                Icon(Icons.flag_rounded, size: 12, color: c.danger),
              ],
            ],
          ),
          right: true,
        ),
      ],
    );
  }

  Widget _cell(Widget child, {bool right = false}) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 9),
        child: Align(alignment: right ? Alignment.centerRight : Alignment.centerLeft, child: child),
      );

  static Color _toneColor(BuildContext context, PillTone tone) {
    final c = context.colors;
    return switch (tone) {
      PillTone.success => c.success,
      PillTone.warning => c.warning,
      PillTone.danger => c.danger,
      PillTone.accent => c.accent,
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
}
