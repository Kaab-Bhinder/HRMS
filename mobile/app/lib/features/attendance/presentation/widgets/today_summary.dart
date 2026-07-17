import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_card.dart';
import '../../domain/entities/today_status.dart';

/// Three-up metric card summarising the day: hours worked, check-in and
/// check-out times. Dashes gracefully when a value isn't available yet.
class TodaySummary extends StatelessWidget {
  const TodaySummary({super.key, required this.status});
  final TodayStatus status;

  @override
  Widget build(BuildContext context) {
    String time(DateTime? d) => d == null ? '—' : DateFormat('h:mm a').format(d);
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.lg),
      child: Row(
        children: [
          _Metric(icon: Icons.timelapse_rounded, label: 'Worked', value: status.workedLabel, tone: context.colors.primary),
          _divider(context),
          _Metric(icon: Icons.login_rounded, label: 'Check in', value: time(status.firstInAt), tone: context.colors.success),
          _divider(context),
          _Metric(icon: Icons.logout_rounded, label: 'Check out', value: time(status.lastOutAt), tone: context.colors.accent),
        ],
      ),
    );
  }

  Widget _divider(BuildContext context) => Container(width: 1, height: 34, color: context.colors.border);
}

class _Metric extends StatelessWidget {
  const _Metric({required this.icon, required this.label, required this.value, required this.tone});
  final IconData icon;
  final String label;
  final String value;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, size: 18, color: tone),
          const SizedBox(height: AppSpacing.sm),
          Text(value, style: context.text.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(label, style: context.text.bodySmall?.copyWith(color: context.colors.mutedForeground)),
        ],
      ),
    );
  }
}
