import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Type system. Body copy uses Inter (superb screen legibility); display and
/// headings use Inter Tight with negative tracking for a crisp, premium feel.
/// Numbers use tabular figures so times and counts don't jitter.
abstract final class AppTypography {
  static const _tabular = [FontFeature.tabularFigures()];

  static TextTheme build(Color fg, Color muted) {
    TextStyle tight(double size, FontWeight w, double spacing, {double? height, Color? color}) =>
        GoogleFonts.interTight(
          fontSize: size,
          fontWeight: w,
          letterSpacing: spacing,
          height: height,
          color: color ?? fg,
        );
    TextStyle inter(double size, FontWeight w, {double spacing = 0, double? height, Color? color}) =>
        GoogleFonts.inter(
          fontSize: size,
          fontWeight: w,
          letterSpacing: spacing,
          height: height,
          color: color ?? fg,
        );

    return TextTheme(
      displayLarge: tight(34, FontWeight.w700, -0.6, height: 1.1),
      displayMedium: tight(28, FontWeight.w700, -0.5, height: 1.12),
      displaySmall: tight(24, FontWeight.w700, -0.4, height: 1.15),
      headlineMedium: tight(22, FontWeight.w700, -0.35, height: 1.2),
      headlineSmall: tight(19, FontWeight.w600, -0.25, height: 1.25),
      titleLarge: tight(17, FontWeight.w600, -0.2, height: 1.3),
      titleMedium: inter(15.5, FontWeight.w600, spacing: -0.1, height: 1.35),
      titleSmall: inter(13.5, FontWeight.w600, height: 1.35),
      bodyLarge: inter(15.5, FontWeight.w400, height: 1.5),
      bodyMedium: inter(14, FontWeight.w400, height: 1.5, color: fg),
      bodySmall: inter(12.5, FontWeight.w400, height: 1.45, color: muted),
      labelLarge: inter(15, FontWeight.w600, spacing: 0.1),
      labelMedium: inter(13, FontWeight.w600, spacing: 0.1),
      labelSmall: inter(11, FontWeight.w700, spacing: 0.8, color: muted),
    );
  }

  /// For big numeric readouts (the live clock, hours worked) — tabular + tight.
  static TextStyle numeric(double size, FontWeight w, Color color) => GoogleFonts.interTight(
        fontSize: size,
        fontWeight: w,
        letterSpacing: -1,
        color: color,
        fontFeatures: _tabular,
      );

  /// Uppercase micro-label used above sections and inside chips.
  static TextStyle overline(Color color) => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.9,
        color: color,
      );
}
