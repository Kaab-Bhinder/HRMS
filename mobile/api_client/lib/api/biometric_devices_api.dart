//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class BiometricDevicesApi {
  BiometricDevicesApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'POST /api/v1/biometric/devices' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [CreateDeviceDto] createDeviceDto (required):
  Future<Response> biometricControllerCreateWithHttpInfo(CreateDeviceDto createDeviceDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices';

    // ignore: prefer_final_locals
    Object? postBody = createDeviceDto;

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
  /// * [CreateDeviceDto] createDeviceDto (required):
  Future<void> biometricControllerCreate(CreateDeviceDto createDeviceDto, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerCreateWithHttpInfo(createDeviceDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Push-mode ingest: device POSTs its logs here
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [IngestDto] ingestDto (required):
  Future<Response> biometricControllerIngestWithHttpInfo(String id, IngestDto ingestDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/ingest'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = ingestDto;

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

  /// Push-mode ingest: device POSTs its logs here
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [IngestDto] ingestDto (required):
  Future<void> biometricControllerIngest(String id, IngestDto ingestDto, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerIngestWithHttpInfo(id, ingestDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/biometric/devices' operation and returns the [Response].
  Future<Response> biometricControllerListWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices';

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

  Future<void> biometricControllerList({ Future<void>? abortTrigger, }) async {
    final response = await biometricControllerListWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Map a device user id to an employee
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [MapUserDto] mapUserDto (required):
  Future<Response> biometricControllerMapWithHttpInfo(String id, MapUserDto mapUserDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/mappings'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = mapUserDto;

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

  /// Map a device user id to an employee
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [MapUserDto] mapUserDto (required):
  Future<void> biometricControllerMap(String id, MapUserDto mapUserDto, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerMapWithHttpInfo(id, mapUserDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/biometric/devices/{id}/mappings' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> biometricControllerMappingsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/mappings'
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
  Future<void> biometricControllerMappings(String id, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerMappingsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'DELETE /api/v1/biometric/devices/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> biometricControllerRemoveWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}'
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
  Future<void> biometricControllerRemove(String id, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerRemoveWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Pull logs from the device and import as attendance punches
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> biometricControllerSyncWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/sync'
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

  /// Pull logs from the device and import as attendance punches
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> biometricControllerSync(String id, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerSyncWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/biometric/devices/{id}/sync-logs' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> biometricControllerSyncLogsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/sync-logs'
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
  Future<void> biometricControllerSyncLogs(String id, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerSyncLogsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Test connectivity via the vendor adapter
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> biometricControllerTestWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}/test'
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

  /// Test connectivity via the vendor adapter
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> biometricControllerTest(String id, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerTestWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/biometric/devices/{id}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [UpdateDeviceDto] updateDeviceDto (required):
  Future<Response> biometricControllerUpdateWithHttpInfo(String id, UpdateDeviceDto updateDeviceDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/biometric/devices/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = updateDeviceDto;

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
  /// * [UpdateDeviceDto] updateDeviceDto (required):
  Future<void> biometricControllerUpdate(String id, UpdateDeviceDto updateDeviceDto, { Future<void>? abortTrigger, }) async {
    final response = await biometricControllerUpdateWithHttpInfo(id, updateDeviceDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
