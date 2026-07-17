import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/entities/auth_user.dart';
import '../domain/repositories/auth_repository.dart';
import 'models/auth_user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._api, this._tokens);

  final ApiClient _api;
  final TokenStorage _tokens;

  @override
  Future<AuthUser> login({required String email, required String password}) async {
    final data = await _api.post('/auth/login', body: {
      'email': email.trim(),
      'password': password,
      'platform': AppConfig.platform,
    }) as Map<String, dynamic>;

    await _persist(data);
    return AuthUserModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  @override
  Future<AuthUser?> restoreSession() async {
    if (!_tokens.hasSession) return null;
    try {
      // The interceptor refreshes the access token transparently if it's stale;
      // if the refresh token is also dead, this surfaces as a 401 → null.
      final me = await _api.get('/auth/me') as Map<String, dynamic>;
      return AuthUserModel.fromJson(me);
    } on ApiException catch (e) {
      if (e.isUnauthorized || e.isForbidden) {
        await _tokens.clear();
        return null;
      }
      rethrow;
    }
  }

  @override
  Future<void> logout() async {
    final refresh = _tokens.refreshToken;
    try {
      await _api.post('/auth/logout', body: {'refreshToken': refresh});
    } catch (_) {
      // Even if the server call fails, we still drop local tokens below.
    }
    await _tokens.clear();
  }

  Future<void> _persist(Map<String, dynamic> data) async {
    final access = data['accessToken'] as String?;
    final refresh = data['refreshToken'] as String?;
    if (access != null && refresh != null) {
      await _tokens.saveTokens(access: access, refresh: refresh);
    }
  }
}
