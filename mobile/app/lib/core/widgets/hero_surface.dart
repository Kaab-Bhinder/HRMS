import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

/// The one dominant surface on a screen — a deep gradient panel that carries the
/// single most important number (hours worked today, this month's pay).
///
/// A faint diagonal sheen and a large off-canvas ring give it dimension without
/// any imagery. Content sits on a dark field in both themes, so children should
/// use [onHero] / [onHeroMuted] rather than the usual foreground tokens.
class HeroSurface extends StatelessWidget {
  const HeroSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.xl),
  });

  final Widget child;
  final EdgeInsets padding;

  /// Text color for content placed on a [HeroSurface].
  static const onHero = Color(0xFFF2F6FC);

  /// Secondary text on a [HeroSurface] — labels, units, captions.
  static const onHeroMuted = Color(0xB3F2F6FC);

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: AppRadius.rXl2,
        gradient: LinearGradient(
          colors: c.heroGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: c.heroGradient.first.withValues(alpha: context.isDark ? 0.50 : 0.32),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: AppRadius.rXl2,
        child: Stack(
          children: [
            // Oversized rings bleeding off the top-right corner. Clipped by the
            // parent, so only the arcs read — a lit edge, not a circle.
            Positioned(top: -90, right: -70, child: _Ring(size: 210, alpha: 0.10)),
            Positioned(top: -30, right: -120, child: _Ring(size: 260, alpha: 0.07)),
            // Diagonal sheen across the upper half.
            Positioned.fill(
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.white.withValues(alpha: 0.10),
                        Colors.white.withValues(alpha: 0),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Padding(padding: padding, child: child),
          ],
        ),
      ),
    );
  }
}

class _Ring extends StatelessWidget {
  const _Ring({required this.size, required this.alpha});
  final double size;
  final double alpha;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        height: size,
        width: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withValues(alpha: alpha), width: 28),
        ),
      ),
    );
  }
}

/// A translucent chip for use *on* a [HeroSurface], where the normal surface and
/// border tokens would be invisible against the gradient.
class HeroChip extends StatelessWidget {
  const HeroChip({super.key, required this.label, this.icon, this.tone});

  final String label;
  final IconData? icon;

  /// Optional dot color — e.g. green for "checked in".
  final Color? tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: Colors.white.withValues(alpha: 0.20)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (tone != null) ...[
            Container(height: 7, width: 7, decoration: BoxDecoration(color: tone, shape: BoxShape.circle)),
            const SizedBox(width: 6),
          ] else if (icon != null) ...[
            Icon(icon, size: 14, color: HeroSurface.onHero),
            const SizedBox(width: 6),
          ],
          Text(
            label,
            style: context.text.labelMedium?.copyWith(color: HeroSurface.onHero),
          ),
        ],
      ),
    );
  }
}
