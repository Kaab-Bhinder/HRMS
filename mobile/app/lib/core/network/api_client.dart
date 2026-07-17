import 'package:dio/dio.dart';
import 'api_exception.dart';

/// Thin wrapper over Dio that unwraps the backend's response envelope
/// (`{ success, data, meta }`) and rethrows failures as [ApiException].
/// Repositories depend on this, never on Dio directly.
class ApiClient {
  ApiClient(this._dio);
  final Dio _dio;

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) =>
      _send(() => _dio.get(path, queryParameters: query));

  Future<dynamic> post(String path, {Object? body}) =>
      _send(() => _dio.post(path, data: body));

  Future<dynamic> patch(String path, {Object? body}) =>
      _send(() => _dio.patch(path, data: body));

  Future<dynamic> delete(String path, {Object? body}) =>
      _send(() => _dio.delete(path, data: body));

  /// Multipart upload of raw bytes under [field]. Returns the unwrapped `data`.
  Future<dynamic> uploadBytes(String path, List<int> bytes, {String field = 'file', String filename = 'upload.jpg', String contentType = 'image/jpeg'}) {
    final form = FormData.fromMap({
      field: MultipartFile.fromBytes(bytes, filename: filename, contentType: DioMediaType.parse(contentType)),
    });
    return _send(() => _dio.post(path, data: form));
  }

  /// Returns the unwrapped `data`. For list endpoints the caller can read
  /// `meta` from [rawGet] if needed.
  Future<dynamic> _send(Future<Response> Function() request) async {
    try {
      final res = await request();
      final body = res.data;
      if (body is Map && body.containsKey('data')) return body['data'];
      return body;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  /// Full envelope (data + meta) for paginated endpoints.
  Future<({dynamic data, Map<String, dynamic>? meta})> getEnvelope(String path, {Map<String, dynamic>? query}) async {
    try {
      final res = await _dio.get(path, queryParameters: query);
      final body = res.data;
      if (body is Map) {
        return (data: body['data'], meta: (body['meta'] as Map?)?.cast<String, dynamic>());
      }
      return (data: body, meta: null);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
