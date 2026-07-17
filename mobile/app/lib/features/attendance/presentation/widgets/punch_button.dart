import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_shadows.dart';
import '../../../../core/theme/app_motion.dart';
import '../../../../core/widgets/pressable.dart';

/// The primary action of the app. Blue gradient to check in, gold to check out
/// — so the current action is unmistakable at a glance. Animates its color and
/// glow when the state flips, and shows a spinner while the GPS fix + punch run.
class PunchButton extends StatelessWidget {
  const PunchButton({super.key, required this.isCheckedIn, required this.busy, this.onTap});

  final bool isCheckedIn;
  final bool busy;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final gradient = isCheckedIn ? [c.accent, Color.lerp(c.accent, Colors.orange, 0.25)!] : c.primaryGradient;
    final glowColor = isCheckedIn ? c.accent : c.primary;
    final fg = isCheckedIn ? c.accentForeground : c.primaryForeground;
    final label = isCheckedIn ? 'Check out' : 'Check in';
    final icon = isCheckedIn ? Icons.logout_rounded : Icons.login_rounded;

    return Pressable(
      onTap: busy ? null : onTap,
      scale: 0.97,
      child: AnimatedContainer(
        duration: AppMotion.base,
        curve: AppMotion.standard,
        height: 66,
        decoration: BoxDecoration(
          borderRadius: AppRadius.rXl,
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: gradient),
          boxShadow: busy ? null : AppShadows.glow(glowColor, opacity: 0.38, blur: 26, y: 12),
        ),
        child: Center(
          child: busy
              ? SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(fg)),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, color: fg, size: 22),
                    const SizedBox(width: AppSpacing.md),
                    Text(
                      label,
                      style: context.text.titleMedium?.copyWith(color: fg, fontWeight: FontWeight.w700, letterSpacing: 0.2),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
