//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class LeaveApi {
  LeaveApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/leave/requests/{id}/approve' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [DecisionDto] decisionDto (required):
  Future<Response> leaveControllerApproveWithHttpInfo(String id, DecisionDto decisionDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/requests/{id}/approve'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = decisionDto;

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
  /// * [DecisionDto] decisionDto (required):
  Future<void> leaveControllerApprove(String id, DecisionDto decisionDto, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerApproveWithHttpInfo(id, decisionDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Leave balances for an employee (current year)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] employeeId (required):
  Future<Response> leaveControllerBalancesWithHttpInfo(String employeeId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/balances/{employeeId}'
      .replaceAll('{employeeId}', employeeId);

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

  /// Leave balances for an employee (current year)
  ///
  /// Parameters:
  ///
  /// * [String] employeeId (required):
  Future<void> leaveControllerBalances(String employeeId, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerBalancesWithHttpInfo(employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/leave/requests/{id}/cancel' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> leaveControllerCancelWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/requests/{id}/cancel'
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
  Future<void> leaveControllerCancel(String id, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerCancelWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/leave/requests' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateLeaveRequestDto] createLeaveRequestDto (required):
  Future<Response> leaveControllerCreateRequestWithHttpInfo(CreateLeaveRequestDto createLeaveRequestDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/requests';

    // ignore: prefer_final_locals
    Object? postBody = createLeaveRequestDto;

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
  /// * [CreateLeaveRequestDto] createLeaveRequestDto (required):
  Future<void> leaveControllerCreateRequest(CreateLeaveRequestDto createLeaveRequestDto, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerCreateRequestWithHttpInfo(createLeaveRequestDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/leave/types' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateLeaveTypeDto] createLeaveTypeDto (required):
  Future<Response> leaveControllerCreateTypeWithHttpInfo(CreateLeaveTypeDto createLeaveTypeDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/types';

    // ignore: prefer_final_locals
    Object? postBody = createLeaveTypeDto;

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
  /// * [CreateLeaveTypeDto] createLeaveTypeDto (required):
  Future<void> leaveControllerCreateType(CreateLeaveTypeDto createLeaveTypeDto, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerCreateTypeWithHttpInfo(createLeaveTypeDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List leave requests (paginated, filterable, searchable)
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
  /// * [String] leaveTypeId:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] departmentId:
  Future<Response> leaveControllerListRequestsWithHttpInfo({ String? search, String? sort, String? order, String? status, String? leaveTypeId, String? employeeId, String? departmentId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/requests';

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
    if (leaveTypeId != null) {
      queryParams.addAll(_queryParams('', 'leaveTypeId', leaveTypeId));
    }
    if (employeeId != null) {
      queryParams.addAll(_queryParams('', 'employeeId', employeeId));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
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

  /// List leave requests (paginated, filterable, searchable)
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
  /// * [String] leaveTypeId:
  ///
  /// * [String] employeeId:
  ///
  /// * [String] departmentId:
  Future<void> leaveControllerListRequests({ String? search, String? sort, String? order, String? status, String? leaveTypeId, String? employeeId, String? departmentId, Future<void>? abortTrigger, }) async {
    final response = await leaveControllerListRequestsWithHttpInfo(search: search, sort: sort, order: order, status: status, leaveTypeId: leaveTypeId, employeeId: employeeId, departmentId: departmentId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List leave types
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> leaveControllerListTypesWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/types';

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

  /// List leave types
  Future<void> leaveControllerListTypes({ Future<void>? abortTrigger, }) async {
    final response = await leaveControllerListTypesWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/leave/requests/{id}/reject' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [DecisionDto] decisionDto (required):
  Future<Response> leaveControllerRejectWithHttpInfo(String id, DecisionDto decisionDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/requests/{id}/reject'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = decisionDto;

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
  /// * [DecisionDto] decisionDto (required):
  Future<void> leaveControllerReject(String id, DecisionDto decisionDto, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerRejectWithHttpInfo(id, decisionDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/leave/types/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> leaveControllerRemoveTypeWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/types/{id}'
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
  Future<void> leaveControllerRemoveType(String id, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerRemoveTypeWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/leave/types/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateLeaveTypeDto] updateLeaveTypeDto (required):
  Future<Response> leaveControllerUpdateTypeWithHttpInfo(String id, UpdateLeaveTypeDto updateLeaveTypeDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/leave/types/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateLeaveTypeDto;

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
  /// * [UpdateLeaveTypeDto] updateLeaveTypeDto (required):
  Future<void> leaveControllerUpdateType(String id, UpdateLeaveTypeDto updateLeaveTypeDto, { Future<void>? abortTrigger, }) async {
    final response = await leaveControllerUpdateTypeWithHttpInfo(id, updateLeaveTypeDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
