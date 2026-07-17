import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../data/auth_repository_impl.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(apiClientProvider), ref.watch(tokenStorageProvider));
});

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState(this.status, {this.user});
  const AuthState.unknown() : status = AuthStatus.unknown, user = null;

  final AuthStatus status;
  final AuthUser? user;

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isKnown => status != AuthStatus.unknown;
}

/// Owns the session lifecycle. The router listens to this to gate navigation.
class AuthController extends Notifier<AuthState> {
  AuthRepository get _repo => ref.read(authRepositoryProvider);

  @override
  AuthState build() => const AuthState.unknown();

  /// Cold-start session restore (called from the splash screen).
  Future<void> restore() async {
    try {
      final user = await _repo.restoreSession();
      state = user != null
          ? AuthState(AuthStatus.authenticated, user: user)
          : const AuthState(AuthStatus.unauthenticated);
    } catch (_) {
      state = const AuthState(AuthStatus.unauthenticated);
    }
  }

  /// Throws [ApiException] on failure so the login screen can show the message.
  Future<void> login({required String email, required String password}) async {
    final user = await _repo.login(email: email, password: password);
    state = AuthState(AuthStatus.authenticated, user: user);
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState(AuthStatus.unauthenticated);
  }

  /// Invoked by the network layer when a refresh ultimately fails.
  void handleSessionExpired() {
    if (state.status != AuthStatus.unauthenticated) {
      state = const AuthState(AuthStatus.unauthenticated);
    }
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
