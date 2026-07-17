//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class EmployeesApi {
  EmployeesApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Bulk import employees (per-row validation, partial success)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [BulkImportDto] bulkImportDto (required):
  Future<Response> employeesControllerBulkImportWithHttpInfo(BulkImportDto bulkImportDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/import';

    // ignore: prefer_final_locals
    Object? postBody = bulkImportDto;

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

  /// Bulk import employees (per-row validation, partial success)
  ///
  /// Parameters:
  ///
  /// * [BulkImportDto] bulkImportDto (required):
  Future<void> employeesControllerBulkImport(BulkImportDto bulkImportDto, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerBulkImportWithHttpInfo(bulkImportDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/employees' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateEmployeeDto] createEmployeeDto (required):
  Future<Response> employeesControllerCreateWithHttpInfo(CreateEmployeeDto createEmployeeDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees';

    // ignore: prefer_final_locals
    Object? postBody = createEmployeeDto;

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
  /// * [CreateEmployeeDto] createEmployeeDto (required):
  Future<void> employeesControllerCreate(CreateEmployeeDto createEmployeeDto, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerCreateWithHttpInfo(createEmployeeDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/employees/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> employeesControllerGetWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/{id}'
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
  Future<void> employeesControllerGet(String id, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerGetWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/employees/{id}/history' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> employeesControllerHistoryWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/{id}/history'
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
  Future<void> employeesControllerHistory(String id, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerHistoryWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List employees (paginated, filterable, searchable incl. custom fields)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
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
  /// * [String] departmentId:
  ///
  /// * [String] designationId:
  ///
  /// * [String] employmentType:
  ///
  /// * [String] cfKey:
  ///
  /// * [String] cfValue:
  Future<Response> employeesControllerListWithHttpInfo({ String? search, String? sort, String? order, String? status, String? departmentId, String? designationId, String? employmentType, String? cfKey, String? cfValue, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees';

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
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (designationId != null) {
      queryParams.addAll(_queryParams('', 'designationId', designationId));
    }
    if (employmentType != null) {
      queryParams.addAll(_queryParams('', 'employmentType', employmentType));
    }
    if (cfKey != null) {
      queryParams.addAll(_queryParams('', 'cfKey', cfKey));
    }
    if (cfValue != null) {
      queryParams.addAll(_queryParams('', 'cfValue', cfValue));
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

  /// List employees (paginated, filterable, searchable incl. custom fields)
  ///
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
  /// * [String] departmentId:
  ///
  /// * [String] designationId:
  ///
  /// * [String] employmentType:
  ///
  /// * [String] cfKey:
  ///
  /// * [String] cfValue:
  Future<void> employeesControllerList({ String? search, String? sort, String? order, String? status, String? departmentId, String? designationId, String? employmentType, String? cfKey, String? cfValue, Future<void>? abortTrigger, }) async {
    final response = await employeesControllerListWithHttpInfo(search: search, sort: sort, order: order, status: status, departmentId: departmentId, designationId: designationId, employmentType: employmentType, cfKey: cfKey, cfValue: cfValue, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/employees/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> employeesControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/{id}'
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
  Future<void> employeesControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/employees/{id}/restore' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> employeesControllerRestoreWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/{id}/restore'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


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
  Future<void> employeesControllerRestore(String id, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerRestoreWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/employees/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateEmployeeDto] updateEmployeeDto (required):
  Future<Response> employeesControllerUpdateWithHttpInfo(String id, UpdateEmployeeDto updateEmployeeDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/employees/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateEmployeeDto;

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
  /// * [UpdateEmployeeDto] updateEmployeeDto (required):
  Future<void> employeesControllerUpdate(String id, UpdateEmployeeDto updateEmployeeDto, { Future<void>? abortTrigger, }) async {
    final response = await employeesControllerUpdateWithHttpInfo(id, updateEmployeeDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
