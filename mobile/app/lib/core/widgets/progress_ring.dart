import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// A circular progress ring with a rounded cap and an optional center child —
/// the hero stat treatment (like the attendance-rate dial in premium HR apps).
/// Animates smoothly to [value] whenever it changes.
class ProgressRing extends StatelessWidget {
  const ProgressRing({
    super.key,
    required this.value,
    this.size = 128,
    this.stroke = 12,
    this.colors,
    this.trackColor,
    this.center,
  });

  final double value; // 0..1
  final double size;
  final double stroke;
  final List<Color>? colors; // gradient sweep
  final Color? trackColor;
  final Widget? center;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final sweep = colors ?? c.primaryGradient;
    return SizedBox(
      width: size,
      height: size,
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: value.clamp(0, 1)),
        duration: const Duration(milliseconds: 900),
        curve: Curves.easeOutCubic,
        builder: (context, v, _) => CustomPaint(
          painter: _RingPainter(v, stroke, sweep, trackColor ?? c.muted),
          child: Center(child: center),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter(this.value, this.stroke, this.colors, this.track);
  final double value;
  final double stroke;
  final List<Color> colors;
  final Color track;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final center = rect.center;
    final radius = (size.width - stroke) / 2;

    final trackPaint = Paint()
      ..color = track
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, trackPaint);

    if (value <= 0) return;
    const start = -math.pi / 2; // 12 o'clock
    final sweepAngle = 2 * math.pi * value;
    final progressPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        startAngle: start,
        endAngle: start + 2 * math.pi,
        colors: colors.length == 1 ? [colors.first, colors.first] : colors,
        transform: GradientRotation(start),
      ).createShader(Rect.fromCircle(center: center, radius: radius));
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), start, sweepAngle, false, progressPaint);
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) =>
      old.value != value || old.stroke != stroke || old.colors != colors || old.track != track;
}
