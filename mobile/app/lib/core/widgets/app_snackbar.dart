import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

enum SnackTone { neutral, success, danger }

/// Consistent, floating toast with a tone-colored leading glyph. Call
/// `AppSnackbar.show(context, ...)` instead of raw ScaffoldMessenger.
abstract final class AppSnackbar {
  static void show(BuildContext context, String message, {SnackTone tone = SnackTone.neutral}) {
    final c = context.colors;
    final (icon, color) = switch (tone) {
      SnackTone.success => (Icons.check_circle_rounded, c.success),
      SnackTone.danger => (Icons.error_rounded, c.danger),
      SnackTone.neutral => (Icons.info_rounded, c.primary),
    };
    final messenger = ScaffoldMessenger.of(context)..clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: AppSpacing.md),
            Expanded(child: Text(message, style: context.text.bodyMedium?.copyWith(color: c.background))),
          ],
        ),
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(AppSpacing.lg),
      ),
    );
  }
}
