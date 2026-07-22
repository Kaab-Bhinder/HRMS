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

  /// Devices currently signed in to this account.
  Future<List<AuthSession>> sessions();

  /// Signs out one other device.
  Future<void> revokeSession(String id);

  /// Signs out every device except this one.
  Future<void> revokeOtherSessions();
}

/// A signed-in device, as reported by `GET /auth/sessions`.
class AuthSession {
  const AuthSession({
    required this.id,
    required this.device,
    required this.isCurrent,
    this.ipAddress,
    this.lastActiveAt,
  });

  final String id;
  final String device;
  final bool isCurrent;
  final String? ipAddress;
  final DateTime? lastActiveAt;

  static AuthSession fromJson(Map<String, dynamic> j) => AuthSession(
        id: j['id'].toString(),
        // The API reports the user agent; an API client or an unknown agent
        // still needs a readable label rather than an empty row.
        device: (j['device']?.toString().trim().isNotEmpty ?? false)
            ? j['device'].toString()
            : (j['os']?.toString() ?? 'Unknown device'),
        isCurrent: j['current'] == true,
        ipAddress: j['ipAddress']?.toString(),
        lastActiveAt: DateTime.tryParse(j['lastActiveAt']?.toString() ?? '')?.toLocal(),
      );
}
