//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AttendanceApi {
  AttendanceApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Your current active tracking session (if any)
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> attendanceControllerActiveSessionWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/tracking/active';

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

  /// Your current active tracking session (if any)
  Future<void> attendanceControllerActiveSession({ Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerActiveSessionWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/attendance/regularizations/{id}/approve' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> attendanceControllerApproveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/regularizations/{id}/approve'
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
  Future<void> attendanceControllerApprove(String id, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerApproveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/attendance' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] search:
  ///
  /// * [String] sort:
  ///
  /// * [String] order:
  ///
  /// * [String] date:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] status:
  ///
  /// * [bool] flagged:
  Future<Response> attendanceControllerListWithHttpInfo({ String? search, String? sort, String? order, String? date, String? employeeId, String? departmentId, String? status, bool? flagged, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance';

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
    if (date != null) {
      queryParams.addAll(_queryParams('', 'date', date));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (status != null) {
      queryParams.addAll(_queryParams('', 'status', status));
    }
    if (flagged != null) {
      queryParams.addAll(_queryParams('', 'flagged', flagged));
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
  /// * [String] date:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] status:
  ///
  /// * [bool] flagged:
  Future<void> attendanceControllerList({ String? search, String? sort, String? order, String? date, String? employeeId, String? departmentId, String? status, bool? flagged, Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerListWithHttpInfo(search: search, sort: sort, order: order, date: date, employeeId: employeeId, departmentId: departmentId, status: status, flagged: flagged, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/attendance/regularizations' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] status (required):
  Future<Response> attendanceControllerListRegularizationsWithHttpInfo(String status, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/regularizations';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'status', status));

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
  /// * [String] status (required):
  Future<void> attendanceControllerListRegularizations(String status, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerListRegularizationsWithHttpInfo(status, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Live map: active sessions with latest positions (admin)
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> attendanceControllerLiveWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/live';

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

  /// Live map: active sessions with latest positions (admin)
  Future<void> attendanceControllerLive({ Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerLiveWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Admin manual attendance entry
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ManualEntryDto] manualEntryDto (required):
  Future<Response> attendanceControllerManualWithHttpInfo(ManualEntryDto manualEntryDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/manual';

    // ignore: prefer_final_locals
    Object? postBody = manualEntryDto;

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

  /// Admin manual attendance entry
  ///
  /// Parameters:
  ///
  /// * [ManualEntryDto] manualEntryDto (required):
  Future<void> attendanceControllerManual(ManualEntryDto manualEntryDto, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerManualWithHttpInfo(manualEntryDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Stream batched location pings for your active session
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [PingDto] pingDto (required):
  Future<Response> attendanceControllerPingWithHttpInfo(PingDto pingDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/tracking/ping';

    // ignore: prefer_final_locals
    Object? postBody = pingDto;

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

  /// Stream batched location pings for your active session
  ///
  /// Parameters:
  ///
  /// * [PingDto] pingDto (required):
  Future<void> attendanceControllerPing(PingDto pingDto, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerPingWithHttpInfo(pingDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Punch attendance via any method (manual/web/gps/face/qr)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [PunchDto] punchDto (required):
  Future<Response> attendanceControllerPunchWithHttpInfo(PunchDto punchDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/punch';

    // ignore: prefer_final_locals
    Object? postBody = punchDto;

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

  /// Punch attendance via any method (manual/web/gps/face/qr)
  ///
  /// Parameters:
  ///
  /// * [PunchDto] punchDto (required):
  Future<void> attendanceControllerPunch(PunchDto punchDto, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerPunchWithHttpInfo(punchDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Request a missed-punch correction (routes to approval engine)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RegularizationDto] regularizationDto (required):
  Future<Response> attendanceControllerRegularizeWithHttpInfo(RegularizationDto regularizationDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/regularizations';

    // ignore: prefer_final_locals
    Object? postBody = regularizationDto;

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

  /// Request a missed-punch correction (routes to approval engine)
  ///
  /// Parameters:
  ///
  /// * [RegularizationDto] regularizationDto (required):
  Future<void> attendanceControllerRegularize(RegularizationDto regularizationDto, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerRegularizeWithHttpInfo(regularizationDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/attendance/regularizations/{id}/reject' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> attendanceControllerRejectWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/regularizations/{id}/reject'
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
  Future<void> attendanceControllerReject(String id, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerRejectWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Full ordered route for a session (playback, admin)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> attendanceControllerRouteWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/sessions/{id}/route'
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

  /// Full ordered route for a session (playback, admin)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> attendanceControllerRoute(String id, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerRouteWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/attendance/summary' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] date (required):
  Future<Response> attendanceControllerSummaryWithHttpInfo(String date, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/attendance/summary';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'date', date));

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
  /// * [String] date (required):
  Future<void> attendanceControllerSummary(String date, { Future<void>? abortTrigger, }) async {
    final response = await attendanceControllerSummaryWithHttpInfo(date, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
