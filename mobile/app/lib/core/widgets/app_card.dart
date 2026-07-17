import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import '../theme/app_shadows.dart';
import 'pressable.dart';

/// The surface primitive: a bordered, softly-shadowed container. Everything
/// that groups content sits on an [AppCard] so elevation reads consistently.
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.radius = AppRadius.rLg,
    this.color,
    this.border = true,
    this.elevated = true,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final BorderRadius radius;
  final Color? color;
  final bool border;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final card = AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? c.surface,
        borderRadius: radius,
        border: border ? Border.all(color: c.border, width: 1) : null,
        boxShadow: elevated ? AppShadows.card(c.shadow, dark: context.isDark) : null,
      ),
      child: child,
    );
    if (onTap == null) return card;
    return Pressable(onTap: onTap, scale: 0.985, child: card);
  }
}
