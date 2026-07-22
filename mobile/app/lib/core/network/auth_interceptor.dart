import 'dart:async';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/token_storage.dart';

/// Attaches the access token to every request and transparently refreshes it on
/// a 401 — the heart of the "stay logged in" experience.
///
/// • Mobile has no cookie jar, so the refresh token travels in the request body.
/// • Refreshes are single-flight: concurrent 401s wait on one refresh call.
/// • If refresh fails, the session is cleared and [onSessionExpired] fires so the
///   app can route back to login.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required this.storage,
    required this.refreshDio,
    required this.onSessionExpired,
  });

  final TokenStorage storage;

  /// A bare Dio (no interceptors) used only to hit /auth/refresh — prevents
  /// recursive interception.
  final Dio refreshDio;
  final void Function() onSessionExpired;

  /// The main Dio, injected after construction, used to replay failed requests.
  late final Dio dio;

  Future<bool>? _refreshing;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = storage.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    // Identifies *this* session to the session endpoints. Web does it with an
    // httpOnly cookie; mobile has no cookie jar, so without this header the API
    // cannot tell which device is calling — every session looked foreign and
    // "sign out other devices" signed the caller out of their own app.
    final refresh = storage.refreshToken;
    if (refresh != null && refresh.isNotEmpty) {
      options.headers['x-refresh-token'] = refresh;
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;
    final path = err.requestOptions.path;
    final isAuthCall = path.contains('/auth/login') || path.contains('/auth/refresh');
    final alreadyRetried = err.requestOptions.extra['retried'] == true;

    if (response?.statusCode != 401 || isAuthCall || alreadyRetried) {
      return handler.next(err);
    }

    final refreshed = await _refreshOnce();
    if (!refreshed) {
      await storage.clear();
      onSessionExpired();
      return handler.next(err);
    }

    // Replay the original request with the fresh access token.
    try {
      final options = err.requestOptions;
      options.extra['retried'] = true;
      options.headers['Authorization'] = 'Bearer ${storage.accessToken}';
      final result = await dio.fetch(options);
      return handler.resolve(result);
    } on DioException catch (e) {
      return handler.next(e);
    }
  }

  /// Runs at most one refresh at a time; parallel callers await the same future.
  Future<bool> _refreshOnce() {
    return _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  }

  Future<bool> _doRefresh() async {
    final refresh = storage.refreshToken;
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final res = await refreshDio.post(
        '${AppConfig.apiBaseUrl}/auth/refresh',
        data: {'refreshToken': refresh},
      );
      final data = res.data['data'] as Map?;
      final access = data?['accessToken'] as String?;
      final newRefresh = data?['refreshToken'] as String?;
      if (access == null) return false;
      await storage.saveTokens(access: access, refresh: newRefresh ?? refresh);
      return true;
    } catch (_) {
      return false;
    }
  }
}
