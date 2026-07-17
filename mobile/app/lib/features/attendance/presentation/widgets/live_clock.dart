import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_typography.dart';

/// A large, tabular, self-updating clock. Ticks once a second and disposes its
/// timer cleanly. Seconds are dimmed so the eye reads hours:minutes first.
class LiveClock extends StatefulWidget {
  const LiveClock({super.key, this.color});
  final Color? color;

  @override
  State<LiveClock> createState() => _LiveClockState();
}

class _LiveClockState extends State<LiveClock> {
  late Timer _timer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.color ?? context.colors.foreground;
    final hm = DateFormat('h:mm').format(_now);
    final ss = DateFormat('ss').format(_now);
    final ampm = DateFormat('a').format(_now);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(hm, style: AppTypography.numeric(44, FontWeight.w700, c)),
        const SizedBox(width: 4),
        Text(ss, style: AppTypography.numeric(20, FontWeight.w600, c.withValues(alpha: 0.45))),
        const SizedBox(width: 6),
        Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Text(ampm, style: context.text.labelMedium?.copyWith(color: c.withValues(alpha: 0.6))),
        ),
      ],
    );
  }
}
