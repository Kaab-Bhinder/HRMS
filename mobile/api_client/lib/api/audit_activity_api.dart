//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AuditActivityApi {
  AuditActivityApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'GET /api/v1/audit/activity' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] limit (required):
  Future<Response> auditControllerActivityWithHttpInfo(String limit, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/audit/activity';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'limit', limit));

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Parameters:
  ///
  /// * [String] limit (required):
  Future<void> auditControllerActivity(String limit, { Future<void>? abortTrigger, }) async {
    final response = await auditControllerActivityWithHttpInfo(limit, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/audit/logs' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] page (required):
  ///
  /// * [String] limit (required):
  ///
  /// * [String] search (required):
  ///
  /// * [String] action (required):
  ///
  /// * [String] entityType (required):
  ///
  /// * [String] actorUserId (required):
  ///
  /// * [String] from (required):
  ///
  /// * [String] to (required):
  Future<Response> auditControllerLogsWithHttpInfo(String page, String limit, String search, String action, String entityType, String actorUserId, String from, String to, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/audit/logs';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'page', page));
      queryParams.addAll(_queryParams('', 'limit', limit));
      queryParams.addAll(_queryParams('', 'search', search));
      queryParams.addAll(_queryParams('', 'action', action));
      queryParams.addAll(_queryParams('', 'entityType', entityType));
      queryParams.addAll(_queryParams('', 'actorUserId', actorUserId));
      queryParams.addAll(_queryParams('', 'from', from));
      queryParams.addAll(_queryParams('', 'to', to));

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Parameters:
  ///
  /// * [String] page (required):
  ///
  /// * [String] limit (required):
  ///
  /// * [String] search (required):
  ///
  /// * [String] action (required):
  ///
  /// * [String] entityType (required):
  ///
  /// * [String] actorUserId (required):
  ///
  /// * [String] from (required):
  ///
  /// * [String] to (required):
  Future<void> auditControllerLogs(String page, String limit, String search, String action, String entityType, String actorUserId, String from, String to, { Future<void>? abortTrigger, }) async {
    final response = await auditControllerLogsWithHttpInfo(page, limit, search, action, entityType, actorUserId, from, to, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
