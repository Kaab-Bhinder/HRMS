//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class ReportsApi {
  ReportsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/reports' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateSavedReportDto] createSavedReportDto (required):
  Future<Response> reportsControllerCreateWithHttpInfo(CreateSavedReportDto createSavedReportDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/reports';

    // ignore: prefer_final_locals
    Object? postBody = createSavedReportDto;

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
  /// * [CreateSavedReportDto] createSavedReportDto (required):
  Future<void> reportsControllerCreate(CreateSavedReportDto createSavedReportDto, { Future<void>? abortTrigger, }) async {
    final response = await reportsControllerCreateWithHttpInfo(createSavedReportDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Run and download a report (module + format + filters)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] module (required):
  ///
  /// * [String] format:
  ///
  /// * [String] search:
  ///
  /// * [String] status:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] leaveTypeId:
  ///
  /// * [String] from:
  ///
  /// * [String] to:
  Future<Response> reportsControllerExportWithHttpInfo(String module, { String? format, String? search, String? status, String? departmentId, String? employeeId, String? leaveTypeId, String? from, String? to, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/reports/export';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'module', module));
    if (format != null) {
      queryParams.addAll(_queryParams('', 'format', format));
    }
    if (search != null) {
      queryParams.addAll(_queryParams('', 'search', search));
    }
    if (status != null) {
      queryParams.addAll(_queryParams('', 'status', status));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
    }
    if (leaveTypeId != null) {
      queryParams.addAll(_queryParams('', 'leaveTypeId', leaveTypeId));
    }
    if (from != null) {
      queryParams.addAll(_queryParams('', 'from', from));
    }
    if (to != null) {
      queryParams.addAll(_queryParams('', 'to', to));
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

  /// Run and download a report (module + format + filters)
  ///
  /// Parameters:
  ///
  /// * [String] module (required):
  ///
  /// * [String] format:
  ///
  /// * [String] search:
  ///
  /// * [String] status:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] leaveTypeId:
  ///
  /// * [String] from:
  ///
  /// * [String] to:
  Future<void> reportsControllerExport(String module, { String? format, String? search, String? status, String? departmentId, String? employeeId, String? leaveTypeId, String? from, String? to, Future<void>? abortTrigger, }) async {
    final response = await reportsControllerExportWithHttpInfo(module, format: format, search: search, status: status, departmentId: departmentId, employeeId: employeeId, leaveTypeId: leaveTypeId, from: from, to: to, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List saved reports (paginated, filter by ?module=)
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
  /// * [String] module:
  Future<Response> reportsControllerListWithHttpInfo({ String? search, String? sort, String? order, String? module, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/reports';

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
    if (module != null) {
      queryParams.addAll(_queryParams('', 'module', module));
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

  /// List saved reports (paginated, filter by ?module=)
  ///
  /// Parameters:
  ///
  /// * [String] search:
  ///
  /// * [String] sort:
  ///
  /// * [String] order:
  ///
  /// * [String] module:
  Future<void> reportsControllerList({ String? search, String? sort, String? order, String? module, Future<void>? abortTrigger, }) async {
    final response = await reportsControllerListWithHttpInfo(search: search, sort: sort, order: order, module: module, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/reports/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> reportsControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/reports/{id}'
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
  Future<void> reportsControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await reportsControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/reports/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateSavedReportDto] updateSavedReportDto (required):
  Future<Response> reportsControllerUpdateWithHttpInfo(String id, UpdateSavedReportDto updateSavedReportDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/reports/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateSavedReportDto;

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
  /// * [UpdateSavedReportDto] updateSavedReportDto (required):
  Future<void> reportsControllerUpdate(String id, UpdateSavedReportDto updateSavedReportDto, { Future<void>? abortTrigger, }) async {
    final response = await reportsControllerUpdateWithHttpInfo(id, updateSavedReportDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
