//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class PerformanceApi {
  PerformanceApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/performance/cycles' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateCycleDto] createCycleDto (required):
  Future<Response> performanceControllerCreateCycleWithHttpInfo(CreateCycleDto createCycleDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/cycles';

    // ignore: prefer_final_locals
    Object? postBody = createCycleDto;

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
  /// * [CreateCycleDto] createCycleDto (required):
  Future<void> performanceControllerCreateCycle(CreateCycleDto createCycleDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerCreateCycleWithHttpInfo(createCycleDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/performance/goals' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateGoalDto] createGoalDto (required):
  Future<Response> performanceControllerCreateGoalWithHttpInfo(CreateGoalDto createGoalDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/goals';

    // ignore: prefer_final_locals
    Object? postBody = createGoalDto;

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
  /// * [CreateGoalDto] createGoalDto (required):
  Future<void> performanceControllerCreateGoal(CreateGoalDto createGoalDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerCreateGoalWithHttpInfo(createGoalDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/performance/reviews' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateReviewDto] createReviewDto (required):
  Future<Response> performanceControllerCreateReviewWithHttpInfo(CreateReviewDto createReviewDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/reviews';

    // ignore: prefer_final_locals
    Object? postBody = createReviewDto;

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
  /// * [CreateReviewDto] createReviewDto (required):
  Future<void> performanceControllerCreateReview(CreateReviewDto createReviewDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerCreateReviewWithHttpInfo(createReviewDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/performance/reviews/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> performanceControllerGetReviewWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/reviews/{id}'
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
  Future<void> performanceControllerGetReview(String id, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerGetReviewWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List review cycles
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> performanceControllerListCyclesWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/cycles';

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

  /// List review cycles
  Future<void> performanceControllerListCycles({ Future<void>? abortTrigger, }) async {
    final response = await performanceControllerListCyclesWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List goals (filterable by status and employee)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] status:
  ///
  /// * [String] employeeId:
  Future<Response> performanceControllerListGoalsWithHttpInfo({ String? status, String? employeeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/goals';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (status != null) {
      queryParams.addAll(_queryParams('', 'status', status));
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

  /// List goals (filterable by status and employee)
  ///
  /// Parameters:
  ///
  /// * [String] status:
  ///
  /// * [String] employeeId:
  Future<void> performanceControllerListGoals({ String? status, String? employeeId, Future<void>? abortTrigger, }) async {
    final response = await performanceControllerListGoalsWithHttpInfo(status: status, employeeId: employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List performance reviews (paginated, filterable, searchable by employee name)
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
  /// * [String] cycleId:
  ///
  /// * [String] employeeId:
  Future<Response> performanceControllerListReviewsWithHttpInfo({ String? search, String? sort, String? order, String? status, String? cycleId, String? employeeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/reviews';

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
    if (cycleId != null) {
      queryParams.addAll(_queryParams('', 'cycleId', cycleId));
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

  /// List performance reviews (paginated, filterable, searchable by employee name)
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
  /// * [String] cycleId:
  ///
  /// * [String] employeeId:
  Future<void> performanceControllerListReviews({ String? search, String? sort, String? order, String? status, String? cycleId, String? employeeId, Future<void>? abortTrigger, }) async {
    final response = await performanceControllerListReviewsWithHttpInfo(search: search, sort: sort, order: order, status: status, cycleId: cycleId, employeeId: employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/performance/goals/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> performanceControllerRemoveGoalWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/goals/{id}'
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
  Future<void> performanceControllerRemoveGoal(String id, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerRemoveGoalWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/performance/reviews/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> performanceControllerRemoveReviewWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/reviews/{id}'
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
  Future<void> performanceControllerRemoveReview(String id, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerRemoveReviewWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/performance/cycles/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateCycleDto] updateCycleDto (required):
  Future<Response> performanceControllerUpdateCycleWithHttpInfo(String id, UpdateCycleDto updateCycleDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/cycles/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateCycleDto;

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
  /// * [UpdateCycleDto] updateCycleDto (required):
  Future<void> performanceControllerUpdateCycle(String id, UpdateCycleDto updateCycleDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerUpdateCycleWithHttpInfo(id, updateCycleDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/performance/goals/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateGoalDto] updateGoalDto (required):
  Future<Response> performanceControllerUpdateGoalWithHttpInfo(String id, UpdateGoalDto updateGoalDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/goals/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateGoalDto;

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
  /// * [UpdateGoalDto] updateGoalDto (required):
  Future<void> performanceControllerUpdateGoal(String id, UpdateGoalDto updateGoalDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerUpdateGoalWithHttpInfo(id, updateGoalDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/performance/reviews/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateReviewDto] updateReviewDto (required):
  Future<Response> performanceControllerUpdateReviewWithHttpInfo(String id, UpdateReviewDto updateReviewDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/performance/reviews/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateReviewDto;

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
  /// * [UpdateReviewDto] updateReviewDto (required):
  Future<void> performanceControllerUpdateReview(String id, UpdateReviewDto updateReviewDto, { Future<void>? abortTrigger, }) async {
    final response = await performanceControllerUpdateReviewWithHttpInfo(id, updateReviewDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
