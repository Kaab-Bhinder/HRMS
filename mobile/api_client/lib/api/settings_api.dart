//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class SettingsApi {
  SettingsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'GET /api/v1/settings' operation and returns the [Response].
  Future<Response> settingsControllerGetAllWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/settings';

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

  Future<void> settingsControllerGetAll({ Future<void>? abortTrigger, }) async {
    final response = await settingsControllerGetAllWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/v1/settings/{section}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] section (required):
  Future<Response> settingsControllerGetSectionWithHttpInfo(String section, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/settings/{section}'
      .replaceAll('{section}', section);

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
  /// * [String] section (required):
  Future<void> settingsControllerGetSection(String section, { Future<void>? abortTrigger, }) async {
    final response = await settingsControllerGetSectionWithHttpInfo(section, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PATCH /api/v1/settings/{section}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] section (required):
  ///
  /// * [UpdateSettingDto] updateSettingDto (required):
  Future<Response> settingsControllerPatchSectionWithHttpInfo(String section, UpdateSettingDto updateSettingDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/settings/{section}'
      .replaceAll('{section}', section);

    // ignore: prefer_final_locals
    Object? postBody = updateSettingDto;

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
  /// * [String] section (required):
  ///
  /// * [UpdateSettingDto] updateSettingDto (required):
  Future<void> settingsControllerPatchSection(String section, UpdateSettingDto updateSettingDto, { Future<void>? abortTrigger, }) async {
    final response = await settingsControllerPatchSectionWithHttpInfo(section, updateSettingDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'PUT /api/v1/settings/{section}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] section (required):
  ///
  /// * [UpdateSettingDto] updateSettingDto (required):
  Future<Response> settingsControllerPutSectionWithHttpInfo(String section, UpdateSettingDto updateSettingDto, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/settings/{section}'
      .replaceAll('{section}', section);

    // ignore: prefer_final_locals
    Object? postBody = updateSettingDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PUT',
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
  /// * [String] section (required):
  ///
  /// * [UpdateSettingDto] updateSettingDto (required):
  Future<void> settingsControllerPutSection(String section, UpdateSettingDto updateSettingDto, { Future<void>? abortTrigger, }) async {
    final response = await settingsControllerPutSectionWithHttpInfo(section, updateSettingDto, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
