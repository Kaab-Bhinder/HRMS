//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AuthApi {
  AuthApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// List the current user’s active sessions (devices)
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerListSessionsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/sessions';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

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

  /// List the current user’s active sessions (devices)
  Future<void> authControllerListSessions({ Future<void>? abortTrigger, }) async {
    final response = await authControllerListSessionsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Authenticate and receive an access token (+ refresh cookie)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [LoginDto] loginDto (required):
  Future<Response> authControllerLoginWithHttpInfo(LoginDto loginDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/login';

    // ignore: prefer_final_locals
    Object? postBody = loginDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Authenticate and receive an access token (+ refresh cookie)
  ///
  /// Parameters:
  ///
  /// * [LoginDto] loginDto (required):
  Future<void> authControllerLogin(LoginDto loginDto, { Future<void>? abortTrigger, }) async {
    final response = await authControllerLoginWithHttpInfo(loginDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/auth/logout' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [RefreshDto] refreshDto (required):
  Future<Response> authControllerLogoutWithHttpInfo(RefreshDto refreshDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/logout';

    // ignore: prefer_final_locals
    Object? postBody = refreshDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
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
  /// * [RefreshDto] refreshDto (required):
  Future<void> authControllerLogout(RefreshDto refreshDto, { Future<void>? abortTrigger, }) async {
    final response = await authControllerLogoutWithHttpInfo(refreshDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Current authenticated user with roles and permissions
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerMeWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/me';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

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

  /// Current authenticated user with roles and permissions
  Future<void> authControllerMe({ Future<void>? abortTrigger, }) async {
    final response = await authControllerMeWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Rotate tokens using the refresh cookie (web) or body token (mobile)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RefreshDto] refreshDto (required):
  Future<Response> authControllerRefreshWithHttpInfo(RefreshDto refreshDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/refresh';

    // ignore: prefer_final_locals
    Object? postBody = refreshDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Rotate tokens using the refresh cookie (web) or body token (mobile)
  ///
  /// Parameters:
  ///
  /// * [RefreshDto] refreshDto (required):
  Future<void> authControllerRefresh(RefreshDto refreshDto, { Future<void>? abortTrigger, }) async {
    final response = await authControllerRefreshWithHttpInfo(refreshDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Sign out of every other session, keeping the current one
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerRevokeOtherSessionsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/sessions/others';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Sign out of every other session, keeping the current one
  Future<void> authControllerRevokeOtherSessions({ Future<void>? abortTrigger, }) async {
    final response = await authControllerRevokeOtherSessionsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Revoke a specific session by id
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> authControllerRevokeSessionWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/auth/sessions/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Revoke a specific session by id
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> authControllerRevokeSession(String id, { Future<void>? abortTrigger, }) async {
    final response = await authControllerRevokeSessionWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
