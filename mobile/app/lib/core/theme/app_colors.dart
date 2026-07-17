import 'package:flutter/material.dart';

/// Semantic color tokens for the app, exposed as a [ThemeExtension] so every
/// widget reads the same palette via `context.colors`. Values mirror the web
/// admin's design tokens (deep-blue primary + gold accent) so both products
/// feel like one family, in both light and dark themes.
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.foreground,
    required this.muted,
    required this.mutedForeground,
    required this.border,
    required this.input,
    required this.ring,
    required this.primary,
    required this.primaryForeground,
    required this.primaryGradient,
    required this.accent,
    required this.accentForeground,
    required this.success,
    required this.warning,
    required this.danger,
    required this.info,
    required this.overlay,
    required this.shadow,
  });

  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color foreground;
  final Color muted;
  final Color mutedForeground;
  final Color border;
  final Color input;
  final Color ring;
  final Color primary;
  final Color primaryForeground;
  final List<Color> primaryGradient;
  final Color accent;
  final Color accentForeground;
  final Color success;
  final Color warning;
  final Color danger;
  final Color info;
  final Color overlay; // scrim behind sheets/dialogs
  final Color shadow; // base shadow color for elevation

  static const light = AppColors(
    background: Color(0xFFF8FAFB),
    surface: Colors.white,
    surfaceAlt: Color(0xFFF1F4F7),
    foreground: Color(0xFF1B2431),
    muted: Color(0xFFE9EDF2),
    mutedForeground: Color(0xFF5A6675),
    border: Color(0xFFDDE3EA),
    input: Color(0xFFDAE0E8),
    ring: Color(0xFF2166AC),
    primary: Color(0xFF1B4E8A),
    primaryForeground: Colors.white,
    primaryGradient: [Color(0xFF1B4E8A), Color(0xFF2E6DB4)],
    accent: Color(0xFFC0891C),
    accentForeground: Color(0xFF2E220A),
    success: Color(0xFF208763),
    warning: Color(0xFFCB7A0D),
    danger: Color(0xFFD5342E),
    info: Color(0xFF2166AC),
    overlay: Color(0x66101827),
    shadow: Color(0xFF1B2431),
  );

  static const dark = AppColors(
    background: Color(0xFF0D131C),
    surface: Color(0xFF141C27),
    surfaceAlt: Color(0xFF1B2530),
    foreground: Color(0xFFE3E9F0),
    muted: Color(0xFF232E3B),
    mutedForeground: Color(0xFF93A0B2),
    border: Color(0xFF2A3542),
    input: Color(0xFF2E3A48),
    ring: Color(0xFF5B94D6),
    primary: Color(0xFF5B94D6),
    primaryForeground: Color(0xFF0A1626),
    primaryGradient: [Color(0xFF3E7FC4), Color(0xFF5B94D6)],
    accent: Color(0xFFE0AC43),
    accentForeground: Color(0xFF1A1305),
    success: Color(0xFF3BB88A),
    warning: Color(0xFFE0A03C),
    danger: Color(0xFFE45B55),
    info: Color(0xFF5B94D6),
    overlay: Color(0x99060B12),
    shadow: Color(0xFF000000),
  );

  /// Tint helper — a translucent wash of any token (for chip/badge fills).
  Color tint(Color c, [double opacity = 0.12]) => c.withValues(alpha: opacity);

  @override
  AppColors copyWith({
    Color? background,
    Color? surface,
    Color? surfaceAlt,
    Color? foreground,
    Color? muted,
    Color? mutedForeground,
    Color? border,
    Color? input,
    Color? ring,
    Color? primary,
    Color? primaryForeground,
    List<Color>? primaryGradient,
    Color? accent,
    Color? accentForeground,
    Color? success,
    Color? warning,
    Color? danger,
    Color? info,
    Color? overlay,
    Color? shadow,
  }) {
    return AppColors(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      foreground: foreground ?? this.foreground,
      muted: muted ?? this.muted,
      mutedForeground: mutedForeground ?? this.mutedForeground,
      border: border ?? this.border,
      input: input ?? this.input,
      ring: ring ?? this.ring,
      primary: primary ?? this.primary,
      primaryForeground: primaryForeground ?? this.primaryForeground,
      primaryGradient: primaryGradient ?? this.primaryGradient,
      accent: accent ?? this.accent,
      accentForeground: accentForeground ?? this.accentForeground,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
      info: info ?? this.info,
      overlay: overlay ?? this.overlay,
      shadow: shadow ?? this.shadow,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t)!,
      foreground: Color.lerp(foreground, other.foreground, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      mutedForeground: Color.lerp(mutedForeground, other.mutedForeground, t)!,
      border: Color.lerp(border, other.border, t)!,
      input: Color.lerp(input, other.input, t)!,
      ring: Color.lerp(ring, other.ring, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      primaryForeground: Color.lerp(primaryForeground, other.primaryForeground, t)!,
      primaryGradient: [
        Color.lerp(primaryGradient.first, other.primaryGradient.first, t)!,
        Color.lerp(primaryGradient.last, other.primaryGradient.last, t)!,
      ],
      accent: Color.lerp(accent, other.accent, t)!,
      accentForeground: Color.lerp(accentForeground, other.accentForeground, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      info: Color.lerp(info, other.info, t)!,
      overlay: Color.lerp(overlay, other.overlay, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
    );
  }
}
