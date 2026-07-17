import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import '../theme/app_shadows.dart';
import 'pressable.dart';

enum AppButtonVariant { primary, secondary, ghost, danger }

enum AppButtonSize { large, medium }

/// The one button used across the app. Handles variants, loading, an optional
/// leading icon, full-width layout, press feedback, and a soft glow on primary.
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.large,
    this.icon,
    this.loading = false,
    this.expand = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final IconData? icon;
  final bool loading;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final disabled = onPressed == null || loading;
    final height = size == AppButtonSize.large ? 54.0 : 44.0;

    late Color bg;
    late Color fg;
    Border? border;
    List<BoxShadow>? shadow;

    switch (variant) {
      case AppButtonVariant.primary:
        bg = c.primary;
        fg = c.primaryForeground;
        shadow = disabled ? null : AppShadows.glow(c.primary, opacity: 0.28, blur: 20, y: 8);
      case AppButtonVariant.danger:
        bg = c.danger;
        fg = Colors.white;
        shadow = disabled ? null : AppShadows.glow(c.danger, opacity: 0.26, blur: 20, y: 8);
      case AppButtonVariant.secondary:
        bg = c.surface;
        fg = c.foreground;
        border = Border.all(color: c.border, width: 1.2);
      case AppButtonVariant.ghost:
        bg = Colors.transparent;
        fg = c.primary;
    }

    final content = loading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(strokeWidth: 2.2, valueColor: AlwaysStoppedAnimation(fg)),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 19, color: fg),
                const SizedBox(width: AppSpacing.sm),
              ],
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: context.text.labelLarge?.copyWith(color: fg),
                ),
              ),
            ],
          );

    return Opacity(
      opacity: disabled && !loading ? 0.55 : 1,
      child: Pressable(
        onTap: disabled ? null : onPressed,
        scale: 0.98,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: height,
          width: expand ? double.infinity : null,
          padding: EdgeInsets.symmetric(horizontal: expand ? AppSpacing.lg : AppSpacing.xl2),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.rMd,
            border: border,
            boxShadow: shadow,
          ),
          child: Center(child: content),
        ),
      ),
    );
  }
}
