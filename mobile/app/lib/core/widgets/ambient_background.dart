import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// A soft tinted wash painted behind a screen's content.
///
/// Two wide, very-low-alpha radial blobs sit in opposite corners so the page has
/// gentle depth instead of one flat fill. It is deliberately subtle: at these
/// opacities it should register as atmosphere, not as a visible shape. Wrap a
/// screen body in this and keep the scaffold transparent.
class AmbientBackground extends StatelessWidget {
  const AmbientBackground({super.key, required this.child, this.intensity = 1});

  final Widget child;

  /// Scales blob opacity. Use a lower value on dense screens (long lists) where
  /// the wash would otherwise compete with the content.
  final double intensity;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    // Dark surfaces need more alpha to register at all; light surfaces blow out
    // quickly, so they get roughly half as much.
    final base = (context.isDark ? 0.20 : 0.11) * intensity;

    return DecoratedBox(
      decoration: BoxDecoration(color: c.background),
      child: Stack(
        children: [
          Positioned(
            top: -140,
            right: -110,
            child: _Blob(color: c.ambient.first, size: 380, opacity: base),
          ),
          Positioned(
            top: 220,
            left: -160,
            child: _Blob(color: c.ambient.last, size: 340, opacity: base * 0.8),
          ),
          Positioned.fill(child: child),
        ],
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.color, required this.size, required this.opacity});
  final Color color;
  final double size;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        height: size,
        width: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              color.withValues(alpha: opacity),
              color.withValues(alpha: 0),
            ],
          ),
        ),
      ),
    );
  }
}
