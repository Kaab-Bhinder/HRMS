import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

/// Shimmering placeholder block used for loading states. A single animated
/// gradient sweeps across a muted base — calmer than a spinner and it hints at
/// the shape of the content that's arriving.
class Skeleton extends StatefulWidget {
  const Skeleton({super.key, this.width, this.height = 16, this.radius = AppRadius.sm});
  final double? width;
  final double height;
  final double radius;

  /// A rounded line, convenient for text placeholders.
  const Skeleton.line({super.key, this.width, this.height = 12}) : radius = 6;

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1300))..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, _) {
        final t = _ctrl.value;
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.radius),
            gradient: LinearGradient(
              begin: Alignment(-1 - 2 * (1 - t), 0),
              end: Alignment(1 - 2 * (1 - t), 0),
              colors: [c.muted, c.surfaceAlt, c.muted],
              stops: const [0.35, 0.5, 0.65],
            ),
          ),
        );
      },
    );
  }
}
