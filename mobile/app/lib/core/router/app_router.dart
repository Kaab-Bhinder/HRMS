import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_controller.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/shell/app_shell.dart';

abstract final class Routes {
  static const splash = '/splash';
  static const login = '/login';
  static const home = '/home';
}

/// GoRouter wired to auth state: unknown → splash, signed-out → login,
/// signed-in → home. A [ValueNotifier] bridges Riverpod changes to GoRouter's
/// [GoRouter.refreshListenable] so redirects re-run whenever the session flips.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier(0);
  ref.listen(authControllerProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: Routes.splash,
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loc = state.matchedLocation;

      if (auth.status == AuthStatus.unknown) {
        return loc == Routes.splash ? null : Routes.splash;
      }
      if (!auth.isAuthenticated) {
        return loc == Routes.login ? null : Routes.login;
      }
      if (loc == Routes.login || loc == Routes.splash) return Routes.home;
      return null;
    },
    routes: [
      GoRoute(path: Routes.splash, builder: (_, _) => const SplashScreen()),
      GoRoute(
        path: Routes.login,
        pageBuilder: (_, _) => const CustomTransitionPage(
          child: LoginScreen(),
          transitionDuration: Duration(milliseconds: 650),
          transitionsBuilder: _fadeThrough,
        ),
      ),
      GoRoute(
        path: Routes.home,
        pageBuilder: (_, _) => const CustomTransitionPage(
          child: AppShell(),
          transitionsBuilder: _fadeThrough,
        ),
      ),
    ],
  );
});

Widget _fadeThrough(
  BuildContext context,
  Animation<double> animation,
  Animation<double> secondary,
  Widget child,
) {
  final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
  return FadeTransition(opacity: curved, child: child);
}
