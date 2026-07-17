import 'package:flutter/widgets.dart';

/// Soft, layered elevation. Premium apps avoid harsh single-drop shadows —
/// these stack a tight contact shadow with a wider ambient one. Shadows are
/// intentionally subtle in dark mode (depth comes from surface tint instead).
abstract final class AppShadows {
  static List<BoxShadow> card(Color shadow, {bool dark = false}) {
    if (dark) {
      return [
        BoxShadow(color: shadow.withValues(alpha: 0.30), blurRadius: 16, offset: const Offset(0, 6)),
      ];
    }
    return [
      BoxShadow(color: shadow.withValues(alpha: 0.04), blurRadius: 2, offset: const Offset(0, 1)),
      BoxShadow(color: shadow.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 8)),
    ];
  }

  static List<BoxShadow> raised(Color shadow, {bool dark = false}) {
    if (dark) {
      return [
        BoxShadow(color: shadow.withValues(alpha: 0.40), blurRadius: 28, offset: const Offset(0, 14)),
      ];
    }
    return [
      BoxShadow(color: shadow.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
      BoxShadow(color: shadow.withValues(alpha: 0.10), blurRadius: 30, offset: const Offset(0, 16)),
    ];
  }

  /// Colored glow beneath a primary/accent element (buttons, the check-in ring).
  static List<BoxShadow> glow(Color color, {double opacity = 0.35, double blur = 24, double y = 10}) {
    return [BoxShadow(color: color.withValues(alpha: opacity), blurRadius: blur, offset: Offset(0, y))];
  }
}
