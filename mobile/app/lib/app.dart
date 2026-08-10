import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/i18n/app_i18n.dart';

/// App root: wires the router and the light/dark themes.
///
/// Theme follows the OS until the user picks one in Profile → Appearance, after
/// which their choice persists on this device.
class WmsApp extends ConsumerWidget {
  const WmsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeControllerProvider);
    final lang = ref.watch(localeControllerProvider);
    return MaterialApp.router(
      title: 'Prima',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      routerConfig: router,
      builder: (context, child) => I18nScope(lang: lang, child: child ?? const SizedBox.shrink()),
    );
  }
}
