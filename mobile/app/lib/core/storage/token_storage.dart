import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persists the access + refresh tokens in the platform keystore (iOS Keychain /
/// Android EncryptedSharedPreferences). Keeps an in-memory copy so the network
/// interceptor can attach the token synchronously without an async read per call.
class TokenStorage {
  TokenStorage(this._storage);

  final FlutterSecureStorage _storage;

  static const _kAccess = 'wms.access_token';
  static const _kRefresh = 'wms.refresh_token';

  String? _access;
  String? _refresh;

  String? get accessToken => _access;
  String? get refreshToken => _refresh;
  bool get hasSession => _refresh != null && _refresh!.isNotEmpty;

  /// Hydrate the in-memory cache from disk. Call once at startup.
  Future<void> load() async {
    _access = await _storage.read(key: _kAccess);
    _refresh = await _storage.read(key: _kRefresh);
  }

  Future<void> saveTokens({required String access, required String refresh}) async {
    _access = access;
    _refresh = refresh;
    await _storage.write(key: _kAccess, value: access);
    await _storage.write(key: _kRefresh, value: refresh);
  }

  Future<void> updateAccess(String access) async {
    _access = access;
    await _storage.write(key: _kAccess, value: access);
  }

  Future<void> clear() async {
    _access = null;
    _refresh = null;
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }
}
