import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

/// One bar: a short day label and the hours worked.
class DayBar {
  const DayBar({required this.label, required this.hours, this.isToday = false});
  final String label;
  final double hours;
  final bool isToday;
}

/// Weekly hours as vertical bars with a selectable value bubble.
///
/// Replaces a line chart: seven discrete days are quantities, not a continuous
/// series, and bars make a missed day (a gap at zero) obvious in a way a line
/// smoothing through it does not.
class WeekBars extends StatefulWidget {
  const WeekBars({super.key, required this.days, this.height = 120});

  final List<DayBar> days;
  final double height;

  @override
  State<WeekBars> createState() => _WeekBarsState();
}

class _WeekBarsState extends State<WeekBars> {
  int? _selected;

  /// Defaults to today, else the last day with any hours — the bar a person
  /// is most likely looking for.
  int get _index {
    if (_selected != null) return _selected!;
    final today = widget.days.indexWhere((d) => d.isToday);
    if (today >= 0) return today;
    for (var i = widget.days.length - 1; i >= 0; i--) {
      if (widget.days[i].hours > 0) return i;
    }
    return widget.days.length - 1;
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    if (widget.days.isEmpty) {
      return SizedBox(
        height: widget.height,
        child: Center(
          child: Text('No hours recorded yet',
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
        ),
      );
    }

    // Scale to the busiest day, with a floor so a light week is not all
    // full-height bars.
    final peak = widget.days.map((d) => d.hours).fold<double>(0, (a, b) => a > b ? a : b);
    final scale = peak < 1 ? 1.0 : peak;

    return Column(
      children: [
        SizedBox(
          height: widget.height,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (var i = 0; i < widget.days.length; i++)
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selected = i),
                    behavior: HitTestBehavior.opaque,
                    child: _Bar(
                      day: widget.days[i],
                      fraction: (widget.days[i].hours / scale).clamp(0.0, 1.0),
                      selected: i == _index,
                      maxHeight: widget.height,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            for (var i = 0; i < widget.days.length; i++)
              Expanded(
                child: Text(
                  widget.days[i].label,
                  textAlign: TextAlign.center,
                  style: context.text.labelSmall?.copyWith(
                    letterSpacing: 0.2,
                    color: i == _index ? c.foreground : c.mutedForeground,
                    fontWeight: i == _index ? FontWeight.w700 : FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({
    required this.day,
    required this.fraction,
    required this.selected,
    required this.maxHeight,
  });

  final DayBar day;
  final double fraction;
  final bool selected;
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    // Leave headroom so the selected bubble never clips the top.
    final barSpace = maxHeight - 26;
    final h = (barSpace * fraction).clamp(day.hours > 0 ? 6.0 : 3.0, barSpace);

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (selected)
          Container(
            margin: const EdgeInsets.only(bottom: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: c.primary,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Text(
              day.hours == 0 ? '—' : '${day.hours.toStringAsFixed(1)}h',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: c.primaryForeground,
              ),
            ),
          )
        else
          const SizedBox(height: 22),
        AnimatedContainer(
          duration: const Duration(milliseconds: 320),
          curve: Curves.easeOutCubic,
          height: h,
          width: selected ? 10 : 7,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            // An unworked day still gets a faint stub, so the week reads as
            // seven slots rather than five bars floating in space.
            color: day.hours == 0
                ? c.mutedForeground.withValues(alpha: 0.25)
                : selected
                    ? c.primary
                    : c.primary.withValues(alpha: 0.45),
          ),
        ),
      ],
    );
  }
}
