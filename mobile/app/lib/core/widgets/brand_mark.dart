import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// The app's visual identity: a rounded-square medallion with a stylised "W"
/// formed from two chevrons, on the brand gradient with a soft inner sheen.
/// Custom-drawn so it never looks like a stock template icon.
class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 56, this.radius});
  final double size;
  final double? radius;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final r = radius ?? size * 0.28;
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(r),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: c.primaryGradient,
        ),
        boxShadow: [BoxShadow(color: c.primary.withValues(alpha: 0.35), blurRadius: size * 0.35, offset: Offset(0, size * 0.14))],
      ),
      child: Stack(
        children: [
          // top-left sheen
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              height: size * 0.5,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(r)),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.white.withValues(alpha: 0.18), Colors.white.withValues(alpha: 0)],
                ),
              ),
            ),
          ),
          Center(
            child: SizedBox(
              height: size * 0.44,
              width: size * 0.52,
              child: CustomPaint(painter: _VMark(c.primaryForeground, c.accent)),
            ),
          ),
        ],
      ),
    );
  }
}

class _VMark extends CustomPainter {
  _VMark(this.stroke, this.accent);
  final Color stroke;
  final Color accent;

  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = s.height * 0.22
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // White "V" — two arms meeting at the bottom.
    canvas.drawPath(
      Path()
        ..moveTo(s.width * 0.14, 0)
        ..lineTo(s.width * 0.5, s.height)
        ..lineTo(s.width * 0.86, 0),
      p..color = stroke,
    );

    // Gold accent along the upper part of the right arm (the two-tone detail).
    canvas.drawPath(
      Path()
        ..moveTo(s.width * 0.86, 0)
        ..lineTo(s.width * 0.66, s.height * 0.56),
      Paint()
        ..color = accent
        ..style = PaintingStyle.stroke
        ..strokeWidth = s.height * 0.15
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant _VMark old) => old.stroke != stroke || old.accent != accent;
}
