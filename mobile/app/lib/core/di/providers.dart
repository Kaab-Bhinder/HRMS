import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/auth_interceptor.dart';
import '../storage/token_storage.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';

/// Root dependency graph. Riverpod is our DI container: each provider builds a
/// singleton the rest of the app reads by type, fully testable via overrides.

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
});

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(ref.watch(secureStorageProvider));
});

BaseOptions _baseOptions() => BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      contentType: 'application/json',
      // We handle non-2xx ourselves so the interceptor can attempt a refresh.
      validateStatus: (code) => code != null && code < 500,
    );

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(tokenStorageProvider);
  final dio = Dio(_baseOptions());
  final refreshDio = Dio(_baseOptions()); // bare — no interceptor, avoids recursion

  final interceptor = AuthInterceptor(
    storage: storage,
    refreshDio: refreshDio,
    onSessionExpired: () => ref.read(authControllerProvider.notifier).handleSessionExpired(),
  )..dio = dio;

  dio.interceptors.add(interceptor);
  return dio;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider));
});
