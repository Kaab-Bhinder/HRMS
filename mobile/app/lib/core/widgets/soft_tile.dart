import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import '../theme/app_shadows.dart';
import 'pressable.dart';

/// A compact destination tile: a colored icon badge over a title and a short
/// supporting line.
///
/// Each tile takes a distinct hue from [AppColors.swatches] so a grid of them
/// reads as separate places rather than one undifferentiated block. The hue is
/// carried by the badge only — the card itself stays on the neutral surface, so
/// several tiles side by side never turn into a fruit salad.
class SoftTile extends StatelessWidget {
  const SoftTile({
    super.key,
    required this.icon,
    required this.title,
    required this.tone,
    this.value,
    this.caption,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final Color tone;

  /// Optional headline figure (e.g. "17 days"), shown large under the title.
  final String? value;

  /// Optional supporting line under the value.
  final String? caption;

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return Pressable(
      onTap: onTap,
      scale: 0.97,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          // Tinted body, per the design: each destination owns a hue so the
          // grid reads as four places, not one block. Kept low-alpha so four
          // tints side by side stay calm.
          color: Color.alphaBlend(tone.withValues(alpha: context.isDark ? 0.14 : 0.10), c.surface),
          borderRadius: AppRadius.rXl,
          border: Border.all(color: tone.withValues(alpha: context.isDark ? 0.22 : 0.18)),
          boxShadow: AppShadows.card(c.shadow, dark: context.isDark),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: Color.alphaBlend(tone.withValues(alpha: context.isDark ? 0.30 : 0.20), c.surface),
                borderRadius: AppRadius.rMd,
              ),
              child: Icon(icon, size: 20, color: tone),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              title,
              style: context.text.titleSmall?.copyWith(color: tone),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (value != null) ...[
              const SizedBox(height: 2),
              Text(
                value!,
                style: context.text.titleLarge,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (caption != null) ...[
              const SizedBox(height: 2),
              Text(
                caption!,
                style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
