import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// One plotted point: a short axis label and its value.
class SparkPoint {
  const SparkPoint(this.label, this.value);
  final String label;
  final double value;
}

/// A smooth line chart with a highlighted point and a floating value bubble.
///
/// Deliberately minimal: no gridlines or y-axis, because on a phone those cost
/// more than they explain. The shape carries the trend and the bubble carries
/// the exact figure. Tapping (or dragging across) moves the highlight.
class SparkChart extends StatefulWidget {
  const SparkChart({
    super.key,
    required this.points,
    required this.format,
    this.height = 150,
    this.color,
  });

  final List<SparkPoint> points;

  /// Renders a value for the bubble — e.g. hours as "7h 45m".
  final String Function(double) format;

  final double height;
  final Color? color;

  @override
  State<SparkChart> createState() => _SparkChartState();
}

class _SparkChartState extends State<SparkChart> {
  int? _active;

  /// Defaults the highlight to the last point — the most recent value is the
  /// one people look for first.
  int get _index => _active ?? widget.points.length - 1;

  void _selectAt(double dx, double width) {
    final n = widget.points.length;
    if (n < 2) return;
    final step = width / (n - 1);
    final i = (dx / step).round().clamp(0, n - 1);
    if (i != _active) setState(() => _active = i);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final line = widget.color ?? c.primary;
    if (widget.points.length < 2) {
      return SizedBox(
        height: widget.height,
        child: Center(
          child: Text('Not enough data yet',
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, box) {
        final w = box.maxWidth;
        return GestureDetector(
          onTapDown: (d) => _selectAt(d.localPosition.dx, w),
          onHorizontalDragUpdate: (d) => _selectAt(d.localPosition.dx, w),
          behavior: HitTestBehavior.opaque,
          child: Column(
            children: [
              SizedBox(
                height: widget.height,
                width: w,
                child: CustomPaint(
                  painter: _SparkPainter(
                    points: widget.points,
                    active: _index,
                    line: line,
                    label: widget.format(widget.points[_index].value),
                    bubbleFill: c.foreground,
                    bubbleText: c.background,
                    textStyle: AppTypography.numeric(12.5, FontWeight.w700, c.background),
                    guide: c.mutedForeground,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  for (var i = 0; i < widget.points.length; i++)
                    Text(
                      widget.points[i].label,
                      style: context.text.labelSmall?.copyWith(
                        color: i == _index ? c.foreground : c.mutedForeground,
                      ),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SparkPainter extends CustomPainter {
  _SparkPainter({
    required this.points,
    required this.active,
    required this.line,
    required this.label,
    required this.bubbleFill,
    required this.bubbleText,
    required this.textStyle,
    required this.guide,
  });

  final List<SparkPoint> points;
  final int active;
  final Color line;
  final String label;
  final Color bubbleFill;
  final Color bubbleText;
  final TextStyle textStyle;
  final Color guide;

  static const _bubbleH = 26.0;
  static const _topPad = 34.0; // room for the bubble above the highest point

  @override
  void paint(Canvas canvas, Size size) {
    final values = points.map((p) => p.value).toList();
    final maxV = values.reduce(math.max);
    final minV = values.reduce(math.min);
    // A flat series would divide by zero; give it a nominal band so the line
    // renders through the middle instead of collapsing to the top edge.
    final span = (maxV - minV).abs() < 0.0001 ? 1.0 : maxV - minV;

    final plotH = size.height - _topPad - 8;
    final step = size.width / (points.length - 1);
    Offset at(int i) => Offset(
          i * step,
          _topPad + plotH - ((values[i] - minV) / span) * plotH,
        );

    final coords = [for (var i = 0; i < points.length; i++) at(i)];

    // Catmull-Rom-ish smoothing: each segment uses control points derived from
    // its neighbours, which keeps the curve from overshooting on spiky data.
    final path = Path()..moveTo(coords.first.dx, coords.first.dy);
    for (var i = 0; i < coords.length - 1; i++) {
      final p0 = i == 0 ? coords[i] : coords[i - 1];
      final p1 = coords[i];
      final p2 = coords[i + 1];
      final p3 = (i + 2 < coords.length) ? coords[i + 2] : p2;
      path.cubicTo(
        p1.dx + (p2.dx - p0.dx) / 6, p1.dy + (p2.dy - p0.dy) / 6,
        p2.dx - (p3.dx - p1.dx) / 6, p2.dy - (p3.dy - p1.dy) / 6,
        p2.dx, p2.dy,
      );
    }

    // Fill under the curve, fading out downward.
    final fill = Path.from(path)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(
      fill,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [line.withValues(alpha: 0.22), line.withValues(alpha: 0)],
        ).createShader(Offset.zero & size),
    );

    canvas.drawPath(
      path,
      Paint()
        ..color = line
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.6
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );

    // Dashed vertical guide down from the active point.
    final a = coords[active];
    final dash = Paint()
      ..color = guide.withValues(alpha: 0.45)
      ..strokeWidth = 1;
    for (var y = a.dy + 8; y < size.height; y += 8) {
      canvas.drawLine(Offset(a.dx, y), Offset(a.dx, math.min(y + 4, size.height)), dash);
    }

    // Marker.
    canvas.drawCircle(a, 7, Paint()..color = line.withValues(alpha: 0.22));
    canvas.drawCircle(a, 4.5, Paint()..color = line);
    canvas.drawCircle(a, 2, Paint()..color = bubbleFill);

    // Value bubble, clamped so it never runs off either edge.
    final tp = TextPainter(
      text: TextSpan(text: label, style: textStyle.copyWith(color: bubbleText)),
      textDirection: TextDirection.ltr,
    )..layout();
    final bw = tp.width + 20;
    final left = (a.dx - bw / 2).clamp(0.0, size.width - bw);
    final top = math.max(0.0, a.dy - _bubbleH - 14);
    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(left, top, bw, _bubbleH),
      const Radius.circular(9),
    );
    canvas.drawRRect(rect, Paint()..color = bubbleFill);
    tp.paint(canvas, Offset(left + 10, top + (_bubbleH - tp.height) / 2));
  }

  @override
  bool shouldRepaint(_SparkPainter old) =>
      old.active != active || old.points != points || old.line != line || old.label != label;
}
