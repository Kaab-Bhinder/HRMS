import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Builds the light & dark [ThemeData] from our tokens and wires component
/// defaults (inputs, sheets, app bar) so screens stay consistent for free.
abstract final class AppTheme {
  static ThemeData light() => _build(AppColors.light, Brightness.light);
  static ThemeData dark() => _build(AppColors.dark, Brightness.dark);

  static ThemeData _build(AppColors c, Brightness brightness) {
    final text = AppTypography.build(c.foreground, c.mutedForeground);
    final scheme = ColorScheme(
      brightness: brightness,
      primary: c.primary,
      onPrimary: c.primaryForeground,
      secondary: c.accent,
      onSecondary: c.accentForeground,
      error: c.danger,
      onError: Colors.white,
      surface: c.surface,
      onSurface: c.foreground,
      surfaceContainerHighest: c.surfaceAlt,
      outline: c.border,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: c.background,
      canvasColor: c.background,
      textTheme: text,
      primaryColor: c.primary,
      splashColor: c.primary.withValues(alpha: 0.06),
      highlightColor: c.primary.withValues(alpha: 0.04),
      dividerTheme: DividerThemeData(color: c.border, thickness: 1, space: 1),
      extensions: [c],
      appBarTheme: AppBarTheme(
        backgroundColor: c.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        foregroundColor: c.foreground,
        titleTextStyle: text.titleLarge,
        systemOverlayStyle: brightness == Brightness.dark
            ? SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent)
            : SystemUiOverlayStyle.dark.copyWith(statusBarColor: Colors.transparent),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.lg),
        hintStyle: text.bodyMedium?.copyWith(color: c.mutedForeground),
        prefixIconColor: c.mutedForeground,
        suffixIconColor: c.mutedForeground,
        border: _border(c.border),
        enabledBorder: _border(c.border),
        focusedBorder: _border(c.primary, width: 1.6),
        errorBorder: _border(c.danger),
        focusedErrorBorder: _border(c.danger, width: 1.6),
        errorStyle: text.bodySmall?.copyWith(color: c.danger),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: c.surface,
        surfaceTintColor: Colors.transparent,
        modalBarrierColor: c.overlay,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
        ),
        showDragHandle: false,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: c.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.rXl),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: c.foreground,
        contentTextStyle: text.bodyMedium?.copyWith(color: c.background),
        shape: RoundedRectangleBorder(borderRadius: AppRadius.rMd),
      ),
      splashFactory: InkRipple.splashFactory,
      pageTransitionsTheme: const PageTransitionsTheme(builders: {
        TargetPlatform.android: _FadeThroughTransitionBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      }),
    );
  }

  static OutlineInputBorder _border(Color color, {double width = 1.2}) => OutlineInputBorder(
        borderRadius: AppRadius.rMd,
        borderSide: BorderSide(color: color, width: width),
      );
}

/// A restrained fade+slide page transition — calmer than Material's default.
class _FadeThroughTransitionBuilder extends PageTransitionsBuilder {
  const _FadeThroughTransitionBuilder();
  @override
  Widget buildTransitions<T>(route, context, animation, secondaryAnimation, child) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.02), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  }
}

/// Ergonomic access to design tokens: `context.colors`, `context.text`.
extension ThemeX on BuildContext {
  AppColors get colors => Theme.of(this).extension<AppColors>()!;
  TextTheme get text => Theme.of(this).textTheme;
  bool get isDark => Theme.of(this).brightness == Brightness.dark;
}
