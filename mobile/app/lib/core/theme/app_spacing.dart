import 'package:flutter/widgets.dart';

/// 4-point spacing scale. Use these everywhere instead of magic numbers so
/// rhythm stays consistent across the app.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xl2 = 24;
  static const double xl3 = 32;
  static const double xl4 = 40;
  static const double xl5 = 48;
  static const double xl6 = 64;

  /// Standard screen horizontal padding (comfortable on all phone widths).
  static const double screen = 20;
}

/// Corner-radius scale. Cards use [lg], sheets use [xl2], pills use [pill].
abstract final class AppRadius {
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xl2 = 28;
  static const double pill = 999;

  static const BorderRadius rSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius rMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius rLg = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius rXl = BorderRadius.all(Radius.circular(xl));
  static const BorderRadius rXl2 = BorderRadius.all(Radius.circular(xl2));
}
