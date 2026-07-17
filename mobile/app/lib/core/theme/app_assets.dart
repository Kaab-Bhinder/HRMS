import 'package:flutter/widgets.dart';

/// Bundled image assets. The auth backdrops are the "Artistic Enterprise"
/// architectural vistas from the finalized design — a night financial district
/// (dark) and an ethereal glass-and-steel composition (light).
abstract final class AppAssets {
  static const _bgDark = 'assets/images/bg_dark.png';
  static const _bgLight = 'assets/images/bg_light.png';

  /// Backdrop that matches the current theme brightness.
  static String authBackground(Brightness b) => b == Brightness.dark ? _bgDark : _bgLight;
}
