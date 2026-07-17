import 'package:flutter/animation.dart';

/// Motion tokens. Durations and curves are centralised so every transition and
/// micro-interaction feels like it belongs to the same product.
abstract final class AppMotion {
  static const Duration instant = Duration(milliseconds: 90);
  static const Duration fast = Duration(milliseconds: 160);
  static const Duration base = Duration(milliseconds: 260);
  static const Duration slow = Duration(milliseconds: 420);
  static const Duration slower = Duration(milliseconds: 640);

  /// Default easing — settles naturally, good for entrances.
  static const Curve standard = Curves.easeOutCubic;

  /// For elements that scale/press — a touch of spring.
  static const Curve emphasized = Cubic(0.2, 0, 0, 1);

  /// For press-down feedback.
  static const Curve pressed = Curves.easeOut;
}
