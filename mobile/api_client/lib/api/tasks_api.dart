//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class TasksApi {
  TasksApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'GET /api/v1/tasks/{id}/activity' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> tasksControllerActivityWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/activity'
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
  Future<void> tasksControllerActivity(String id, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerActivityWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/tasks/{id}/comments' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [CreateCommentDto] createCommentDto (required):
  Future<Response> tasksControllerAddCommentWithHttpInfo(String id, CreateCommentDto createCommentDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/comments'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = createCommentDto;

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
  /// * [CreateCommentDto] createCommentDto (required):
  Future<void> tasksControllerAddComment(String id, CreateCommentDto createCommentDto, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerAddCommentWithHttpInfo(id, createCommentDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/tasks/{id}/assign' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [AssignTaskDto] assignTaskDto (required):
  Future<Response> tasksControllerAssignWithHttpInfo(String id, AssignTaskDto assignTaskDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/assign'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = assignTaskDto;

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
  /// * [AssignTaskDto] assignTaskDto (required):
  Future<void> tasksControllerAssign(String id, AssignTaskDto assignTaskDto, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerAssignWithHttpInfo(id, assignTaskDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// All non-deleted tasks (frontend groups by status)
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> tasksControllerBoardWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/board';

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

  /// All non-deleted tasks (frontend groups by status)
  Future<void> tasksControllerBoard({ Future<void>? abortTrigger, }) async {
    final response = await tasksControllerBoardWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'POST /api/v1/tasks' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateTaskDto] createTaskDto (required):
  Future<Response> tasksControllerCreateWithHttpInfo(CreateTaskDto createTaskDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks';

    // ignore: prefer_final_locals
    Object? postBody = createTaskDto;

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
  /// * [CreateTaskDto] createTaskDto (required):
  Future<void> tasksControllerCreate(CreateTaskDto createTaskDto, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerCreateWithHttpInfo(createTaskDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/tasks/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> tasksControllerGetWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}'
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
  Future<void> tasksControllerGet(String id, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerGetWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// List tasks (paginated, filterable, searchable)
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
  /// * [String] priority:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] assigneeId:
  Future<Response> tasksControllerListWithHttpInfo({ String? search, String? sort, String? order, String? status, String? priority, String? departmentId, String? assigneeId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks';

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
    if (priority != null) {
      queryParams.addAll(_queryParams('', 'priority', priority));
    }
    if (departmentId != null) {
      queryParams.addAll(_queryParams('', 'departmentId', departmentId));
    }
    if (assigneeId != null) {
      queryParams.addAll(_queryParams('', 'assigneeId', assigneeId));
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

  /// List tasks (paginated, filterable, searchable)
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
  /// * [String] priority:
  ///
  /// * [String] departmentId:
  ///
  /// * [String] assigneeId:
  Future<void> tasksControllerList({ String? search, String? sort, String? order, String? status, String? priority, String? departmentId, String? assigneeId, Future<void>? abortTrigger, }) async {
    final response = await tasksControllerListWithHttpInfo(search: search, sort: sort, order: order, status: status, priority: priority, departmentId: departmentId, assigneeId: assigneeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/tasks/{id}/comments' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> tasksControllerListCommentsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/comments'
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
  Future<void> tasksControllerListComments(String id, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerListCommentsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/tasks/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> tasksControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}'
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
  Future<void> tasksControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Task counts per status + total
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> tasksControllerStatsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/stats';

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

  /// Task counts per status + total
  Future<void> tasksControllerStats({ Future<void>? abortTrigger, }) async {
    final response = await tasksControllerStatsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/tasks/{id}/assign/{employeeId}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [String] employeeId (required):
  Future<Response> tasksControllerUnassignWithHttpInfo(String id, String employeeId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/assign/{employeeId}'
      .replaceAll('{id}', id)
      .replaceAll('{employeeId}', employeeId);

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
  ///
  /// * [String] employeeId (required):
  Future<void> tasksControllerUnassign(String id, String employeeId, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerUnassignWithHttpInfo(id, employeeId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/tasks/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateTaskDto] updateTaskDto (required):
  Future<Response> tasksControllerUpdateWithHttpInfo(String id, UpdateTaskDto updateTaskDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateTaskDto;

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
  /// * [UpdateTaskDto] updateTaskDto (required):
  Future<void> tasksControllerUpdate(String id, UpdateTaskDto updateTaskDto, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerUpdateWithHttpInfo(id, updateTaskDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Update task status (assignee mark-complete for mobile; admins update any)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateTaskStatusDto] updateTaskStatusDto (required):
  Future<Response> tasksControllerUpdateStatusWithHttpInfo(String id, UpdateTaskStatusDto updateTaskStatusDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tasks/{id}/status'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateTaskStatusDto;

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

  /// Update task status (assignee mark-complete for mobile; admins update any)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateTaskStatusDto] updateTaskStatusDto (required):
  Future<void> tasksControllerUpdateStatus(String id, UpdateTaskStatusDto updateTaskStatusDto, { Future<void>? abortTrigger, }) async {
    final response = await tasksControllerUpdateStatusWithHttpInfo(id, updateTaskStatusDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
