//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AnalyticsApi {
  AnalyticsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Attendance status breakdown for a date range
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<Response> analyticsControllerAttendanceWithHttpInfo({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/analytics/attendance';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (from != null) {
      queryParams.addAll(_queryParams('', 'from', from));
    }
    if (to != null) {
      queryParams.addAll(_queryParams('', 'to', to));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (locationId != null) {
      queryParams.addAll(_queryParams('', 'locationId', locationId));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
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

  /// Attendance status breakdown for a date range
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<void> analyticsControllerAttendance({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    final response = await analyticsControllerAttendanceWithHttpInfo(from: from, to: to, departmentId: departmentId, locationId: locationId, employeeId: employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Per-department headcount and present percentage
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<Response> analyticsControllerDepartmentsWithHttpInfo({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/analytics/departments';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (from != null) {
      queryParams.addAll(_queryParams('', 'from', from));
    }
    if (to != null) {
      queryParams.addAll(_queryParams('', 'to', to));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (locationId != null) {
      queryParams.addAll(_queryParams('', 'locationId', locationId));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
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

  /// Per-department headcount and present percentage
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<void> analyticsControllerDepartments({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    final response = await analyticsControllerDepartmentsWithHttpInfo(from: from, to: to, departmentId: departmentId, locationId: locationId, employeeId: employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Dashboard overview (KPIs + charts, aggregates only, filterable)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<Response> analyticsControllerOverviewWithHttpInfo({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/analytics/overview';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (from != null) {
      queryParams.addAll(_queryParams('', 'from', from));
    }
    if (to != null) {
      queryParams.addAll(_queryParams('', 'to', to));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (locationId != null) {
      queryParams.addAll(_queryParams('', 'locationId', locationId));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
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

  /// Dashboard overview (KPIs + charts, aggregates only, filterable)
  ///
  /// Parameters:
  ///
  /// * [String] from:
  ///   ISO date (inclusive lower bound)
  ///
  /// * [String] to:
  ///   ISO date (inclusive upper bound)
  ///
  /// * [String] departmentId:
  ///
  /// * [String] locationId:
  ///
  /// * [String] employeeId:
  Future<void> analyticsControllerOverview({ String? from, String? to, String? departmentId, String? locationId, String? employeeId, Future<void>? abortTrigger, }) async {
    final response = await analyticsControllerOverviewWithHttpInfo(from: from, to: to, departmentId: departmentId, locationId: locationId, employeeId: employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
