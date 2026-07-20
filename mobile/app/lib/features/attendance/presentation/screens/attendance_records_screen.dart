import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/ambient_background.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/hero_surface.dart';
import '../../../../core/widgets/skeleton.dart';
import '../../../../core/widgets/status_pill.dart';
import '../providers/records_provider.dart';

class AttendanceRecordsScreen extends ConsumerStatefulWidget {
  const AttendanceRecordsScreen({super.key, this.embedded = false});

  /// True when hosted inside the bottom-nav shell, where the tab supplies the
  /// frame: the screen then renders without its own Scaffold/AppBar (and
  /// without a back button, since there is nothing to pop).
  final bool embedded;

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

    final body = AmbientBackground(
      child: SafeArea(
        child: RefreshIndicator(
          color: c.primary,
          onRefresh: () async => ref.invalidate(mySlipProvider(_month)),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(
              AppSpacing.screen, AppSpacing.md, AppSpacing.screen,
              // Clear the floating nav bar when hosted as a tab.
              widget.embedded ? 108 : AppSpacing.xl3,
            ),
            children: [
              if (widget.embedded) ...[
                Text('My Attendance', style: context.text.headlineSmall),
                Text('Your check-ins, hours and flags',
                    style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                const SizedBox(height: AppSpacing.lg),
              ],
              _MonthBar(label: DateFormat('MMMM yyyy').format(_month), canNext: !_isCurrentMonth, onPrev: () => _shift(-1), onNext: () => _shift(1)),
              const SizedBox(height: AppSpacing.lg),
              slip.when(
                loading: () => const Column(children: [Skeleton(height: 168, radius: AppRadius.xl2), SizedBox(height: AppSpacing.lg), Skeleton(height: 240, radius: AppRadius.xl)]),
                error: (e, _) => AppCard(child: ErrorStateView(message: e is ApiException ? e.message : 'Couldn’t load your records.', onRetry: () => ref.invalidate(mySlipProvider(_month)))),
                data: (s) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _MonthHero(slip: s, month: _month),
                    const SizedBox(height: AppSpacing.xl2),
                    Text('Daily record', style: context.text.titleLarge),
                    const SizedBox(height: AppSpacing.md),
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

    // As a tab the shell already provides the frame; standalone (pushed from
    // Home) it needs its own Scaffold and app bar.
    if (widget.embedded) return body;
    return Scaffold(appBar: AppBar(title: const Text('My Attendance')), body: body);
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
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: c.border),
      ),
      child: Row(
        children: [
          _arrow(context, Icons.chevron_left_rounded, onPrev),
          Expanded(
            child: Center(child: Text(label, style: context.text.titleSmall)),
          ),
          _arrow(context, Icons.chevron_right_rounded, canNext ? onNext : null),
        ],
      ),
    );
  }

  Widget _arrow(BuildContext context, IconData icon, VoidCallback? onTap) {
    final c = context.colors;
    final enabled = onTap != null;
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        height: 36,
        width: 36,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: enabled ? c.muted : Colors.transparent,
        ),
        child: Icon(icon,
            size: 20,
            color: enabled ? c.foreground : c.mutedForeground.withValues(alpha: 0.35)),
      ),
    );
  }
}

/// Month summary. Hours worked is the headline; the present/late/absent counts
/// sit beneath it as supporting detail rather than four equal-weight boxes,
/// which gave no sense of what to read first.
class _MonthHero extends StatelessWidget {
  const _MonthHero({required this.slip, required this.month});
  final AttendanceSlip slip;
  final DateTime month;

  @override
  Widget build(BuildContext context) {
    final flagged = slip.days.where((d) => d.isFlagged).length;

    return HeroSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(DateFormat('MMMM').format(month).toUpperCase(),
                  style: AppTypography.overline(HeroSurface.onHeroMuted)),
              const Spacer(),
              if (flagged > 0)
                HeroChip(
                  label: '$flagged flagged',
                  icon: Icons.flag_rounded,
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(slip.workedHours.toStringAsFixed(1),
                  style: AppTypography.numeric(40, FontWeight.w700, HeroSurface.onHero)),
              const SizedBox(width: AppSpacing.sm),
              Text('hours worked',
                  style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted)),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              _heroCount(context, 'Present', slip.present, const Color(0xFF5BE0A8)),
              _heroCount(context, 'Late', slip.late, const Color(0xFFF5C56B)),
              _heroCount(context, 'Absent', slip.absent, const Color(0xFFF59B9B)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _heroCount(BuildContext context, String label, int value, Color dot) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(height: 7, width: 7, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(label, style: context.text.bodySmall?.copyWith(color: HeroSurface.onHeroMuted)),
            ],
          ),
          const SizedBox(height: 2),
          Text('$value', style: AppTypography.numeric(19, FontWeight.w700, HeroSurface.onHero)),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      radius: AppRadius.rXl,
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
