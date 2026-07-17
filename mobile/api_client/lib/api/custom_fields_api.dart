//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class CustomFieldsApi {
  CustomFieldsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/custom-fields' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateCustomFieldDto] createCustomFieldDto (required):
  Future<Response> customFieldsControllerCreateWithHttpInfo(CreateCustomFieldDto createCustomFieldDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/custom-fields';

    // ignore: prefer_final_locals
    Object? postBody = createCustomFieldDto;

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
  /// * [CreateCustomFieldDto] createCustomFieldDto (required):
  Future<void> customFieldsControllerCreate(CreateCustomFieldDto createCustomFieldDto, { Future<void>? abortTrigger, }) async {
    final response = await customFieldsControllerCreateWithHttpInfo(createCustomFieldDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/custom-fields' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] entity:
  Future<Response> customFieldsControllerListWithHttpInfo({ String? entity, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/custom-fields';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (entity != null) {
      queryParams.addAll(_queryParams('', 'entity', entity));
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
  /// * [String] entity:
  Future<void> customFieldsControllerList({ String? entity, Future<void>? abortTrigger, }) async {
    final response = await customFieldsControllerListWithHttpInfo(entity: entity, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/custom-fields/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> customFieldsControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/custom-fields/{id}'
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
  Future<void> customFieldsControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await customFieldsControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/custom-fields/reorder' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [ReorderDto] reorderDto (required):
  Future<Response> customFieldsControllerReorderWithHttpInfo(ReorderDto reorderDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/custom-fields/reorder';

    // ignore: prefer_final_locals
    Object? postBody = reorderDto;

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
  /// * [ReorderDto] reorderDto (required):
  Future<void> customFieldsControllerReorder(ReorderDto reorderDto, { Future<void>? abortTrigger, }) async {
    final response = await customFieldsControllerReorderWithHttpInfo(reorderDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/custom-fields/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateCustomFieldDto] updateCustomFieldDto (required):
  Future<Response> customFieldsControllerUpdateWithHttpInfo(String id, UpdateCustomFieldDto updateCustomFieldDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/custom-fields/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateCustomFieldDto;

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
  /// * [UpdateCustomFieldDto] updateCustomFieldDto (required):
  Future<void> customFieldsControllerUpdate(String id, UpdateCustomFieldDto updateCustomFieldDto, { Future<void>? abortTrigger, }) async {
    final response = await customFieldsControllerUpdateWithHttpInfo(id, updateCustomFieldDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
