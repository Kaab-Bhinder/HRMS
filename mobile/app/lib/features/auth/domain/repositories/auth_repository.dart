import '../entities/auth_user.dart';

/// Contract the presentation layer depends on. The data layer provides the
/// concrete implementation (API + secure storage).
abstract interface class AuthRepository {
  /// Authenticate as the mobile platform. Persists tokens on success.
  Future<AuthUser> login({required String email, required String password});

  /// Restore a session from stored tokens on cold start, or null if none/expired.
  Future<AuthUser?> restoreSession();

  /// Revoke the session server-side and clear local tokens.
  Future<void> logout();

  /// Change the signed-in user's password. The current one is required: a
  /// stolen access token alone must not be enough to take over the account.
  /// Every other session is revoked server-side; this one survives.
  Future<void> changePassword({required String currentPassword, required String newPassword});
}
