//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class UsersApi {
  UsersApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/users' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateUserDto] createUserDto (required):
  Future<Response> usersControllerCreateWithHttpInfo(CreateUserDto createUserDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users';

    // ignore: prefer_final_locals
    Object? postBody = createUserDto;

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
  /// * [CreateUserDto] createUserDto (required):
  Future<void> usersControllerCreate(CreateUserDto createUserDto, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerCreateWithHttpInfo(createUserDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/users/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> usersControllerGetWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}'
      .replaceAll('{id}', id);

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

  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> usersControllerGet(String id, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerGetWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/users' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] search:
  ///
  /// * [String] sort:
  ///
  /// * [String] order:
  ///
  /// * [String] status:
  ///
  /// * [String] roleId:
  ///   Filter by assigned role id
  Future<Response> usersControllerListWithHttpInfo({ String? search, String? sort, String? order, String? status, String? roleId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (search != null) {
      queryParams.addAll(_queryParams('', 'search', search));
    }
    if (sort != null) {
      queryParams.addAll(_queryParams('', 'sort', sort));
    }
    if (order != null) {
      queryParams.addAll(_queryParams('', 'order', order));
    }
    if (status != null) {
      queryParams.addAll(_queryParams('', 'status', status));
    }
    if (roleId != null) {
      queryParams.addAll(_queryParams('', 'roleId', roleId));
    }

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
  /// * [String] search:
  ///
  /// * [String] sort:
  ///
  /// * [String] order:
  ///
  /// * [String] status:
  ///
  /// * [String] roleId:
  ///   Filter by assigned role id
  Future<void> usersControllerList({ String? search, String? sort, String? order, String? status, String? roleId, Future<void>? abortTrigger, }) async {
    final response = await usersControllerListWithHttpInfo(search: search, sort: sort, order: order, status: status, roleId: roleId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/users/{id}/sessions' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> usersControllerListSessionsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}/sessions'
      .replaceAll('{id}', id);

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

  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> usersControllerListSessions(String id, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerListSessionsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/users/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> usersControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}'
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

  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> usersControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/users/{id}/reset-password' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [ResetPasswordDto] resetPasswordDto (required):
  Future<Response> usersControllerResetPasswordWithHttpInfo(String id, ResetPasswordDto resetPasswordDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}/reset-password'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = resetPasswordDto;

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
  /// * [String] id (required):
  ///
  /// * [ResetPasswordDto] resetPasswordDto (required):
  Future<void> usersControllerResetPassword(String id, ResetPasswordDto resetPasswordDto, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerResetPasswordWithHttpInfo(id, resetPasswordDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/users/{id}/sessions' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> usersControllerRevokeSessionsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}/sessions'
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

  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> usersControllerRevokeSessions(String id, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerRevokeSessionsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/users/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateUserDto] updateUserDto (required):
  Future<Response> usersControllerUpdateWithHttpInfo(String id, UpdateUserDto updateUserDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/users/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateUserDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
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
  /// * [String] id (required):
  ///
  /// * [UpdateUserDto] updateUserDto (required):
  Future<void> usersControllerUpdate(String id, UpdateUserDto updateUserDto, { Future<void>? abortTrigger, }) async {
    final response = await usersControllerUpdateWithHttpInfo(id, updateUserDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
