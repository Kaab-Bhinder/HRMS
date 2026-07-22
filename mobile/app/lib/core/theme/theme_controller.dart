import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _key = 'theme_mode';

/// Light/dark preference for this device.
///
/// Deliberately local: theme is a per-device choice, not an organisation
/// setting, so it never round-trips to the API. Persisted with the same secure
/// storage the session uses — not for secrecy, but to avoid pulling in a second
/// storage dependency for one string.
///
/// Defaults to [ThemeMode.system] so a first launch matches the phone rather
/// than forcing a look on the user.
class ThemeController extends StateNotifier<ThemeMode> {
  ThemeController(this._storage) : super(ThemeMode.system) {
    _restore();
  }

  final FlutterSecureStorage _storage;

  Future<void> _restore() async {
    try {
      final saved = await _storage.read(key: _key);
      state = switch (saved) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };
    } catch (_) {
      // Keep the system default; a preference is not worth failing startup for.
    }
  }

  Future<void> set(ThemeMode mode) async {
    state = mode;
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    try {
      await _storage.write(key: _key, value: value);
    } catch (_) {
      // The in-memory change already applied; persistence is best-effort.
    }
  }

  /// Toggles between light and dark. From `system`, flips to the opposite of
  /// whatever the device is currently showing so the switch visibly does
  /// something on first use.
  Future<void> toggle({required bool systemIsDark}) async {
    final isDark = state == ThemeMode.dark || (state == ThemeMode.system && systemIsDark);
    await set(isDark ? ThemeMode.light : ThemeMode.dark);
  }
}

final themeControllerProvider = StateNotifierProvider<ThemeController, ThemeMode>(
  (ref) => ThemeController(const FlutterSecureStorage()),
);
