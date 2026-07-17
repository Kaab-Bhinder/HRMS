import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

enum PillTone { neutral, primary, success, warning, danger, accent, info }

/// Compact status chip with a tone-tinted fill and optional leading dot.
class StatusPill extends StatelessWidget {
  const StatusPill(this.label, {super.key, this.tone = PillTone.neutral, this.dot = true, this.icon});

  final String label;
  final PillTone tone;
  final bool dot;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final color = switch (tone) {
      PillTone.neutral => c.mutedForeground,
      PillTone.primary => c.primary,
      PillTone.success => c.success,
      PillTone.warning => c.warning,
      PillTone.danger => c.danger,
      PillTone.accent => c.accent,
      PillTone.info => c.info,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 5),
          ] else if (dot) ...[
            Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 6),
          ],
          Text(
            label,
            style: context.text.labelMedium?.copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
