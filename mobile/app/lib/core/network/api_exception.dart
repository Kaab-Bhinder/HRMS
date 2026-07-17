import 'package:dio/dio.dart';

/// A normalized error surfaced to the UI. Maps the backend's uniform error
/// envelope `{ success:false, error:{ code, message, fields } }` and Dio's
/// transport failures into one friendly, typed shape.
class ApiException implements Exception {
  ApiException(this.message, {this.code, this.statusCode, this.fields});

  final String message;
  final String? code;
  final int? statusCode;
  final Map<String, dynamic>? fields;

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;

  @override
  String toString() => message;

  factory ApiException.fromDio(DioException e) {
    final res = e.response;
    final data = res?.data;
    if (data is Map && data['error'] is Map) {
      final err = data['error'] as Map;
      return ApiException(
        (err['message'] as String?) ?? 'Something went wrong',
        code: err['code'] as String?,
        statusCode: res?.statusCode,
        fields: (err['fields'] as Map?)?.cast<String, dynamic>(),
      );
    }
    final friendly = switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        'The connection timed out. Check your network and try again.',
      DioExceptionType.connectionError =>
        'Can’t reach the server. Make sure you’re online.',
      _ => res?.statusCode != null
          ? 'Request failed (${res?.statusCode}).'
          : 'Something went wrong. Please try again.',
    };
    return ApiException(friendly, statusCode: res?.statusCode);
  }
}
