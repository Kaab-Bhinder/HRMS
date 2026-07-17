# wms_api_client.api.BiometricDevicesApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**biometricControllerCreate**](BiometricDevicesApi.md#biometriccontrollercreate) | **POST** /api/v1/biometric/devices | 
[**biometricControllerIngest**](BiometricDevicesApi.md#biometriccontrolleringest) | **POST** /api/v1/biometric/devices/{id}/ingest | Push-mode ingest: device POSTs its logs here
[**biometricControllerList**](BiometricDevicesApi.md#biometriccontrollerlist) | **GET** /api/v1/biometric/devices | 
[**biometricControllerMap**](BiometricDevicesApi.md#biometriccontrollermap) | **POST** /api/v1/biometric/devices/{id}/mappings | Map a device user id to an employee
[**biometricControllerMappings**](BiometricDevicesApi.md#biometriccontrollermappings) | **GET** /api/v1/biometric/devices/{id}/mappings | 
[**biometricControllerRemove**](BiometricDevicesApi.md#biometriccontrollerremove) | **DELETE** /api/v1/biometric/devices/{id} | 
[**biometricControllerSync**](BiometricDevicesApi.md#biometriccontrollersync) | **POST** /api/v1/biometric/devices/{id}/sync | Pull logs from the device and import as attendance punches
[**biometricControllerSyncLogs**](BiometricDevicesApi.md#biometriccontrollersynclogs) | **GET** /api/v1/biometric/devices/{id}/sync-logs | 
[**biometricControllerTest**](BiometricDevicesApi.md#biometriccontrollertest) | **POST** /api/v1/biometric/devices/{id}/test | Test connectivity via the vendor adapter
[**biometricControllerUpdate**](BiometricDevicesApi.md#biometriccontrollerupdate) | **PATCH** /api/v1/biometric/devices/{id} | 


# **biometricControllerCreate**
> biometricControllerCreate(createDeviceDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final createDeviceDto = CreateDeviceDto(); // CreateDeviceDto | 

try {
    api_instance.biometricControllerCreate(createDeviceDto);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createDeviceDto** | [**CreateDeviceDto**](CreateDeviceDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerIngest**
> biometricControllerIngest(id, ingestDto)

Push-mode ingest: device POSTs its logs here

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 
final ingestDto = IngestDto(); // IngestDto | 

try {
    api_instance.biometricControllerIngest(id, ingestDto);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerIngest: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **ingestDto** | [**IngestDto**](IngestDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerList**
> biometricControllerList()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();

try {
    api_instance.biometricControllerList();
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerList: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerMap**
> biometricControllerMap(id, mapUserDto)

Map a device user id to an employee

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 
final mapUserDto = MapUserDto(); // MapUserDto | 

try {
    api_instance.biometricControllerMap(id, mapUserDto);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerMap: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **mapUserDto** | [**MapUserDto**](MapUserDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerMappings**
> biometricControllerMappings(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 

try {
    api_instance.biometricControllerMappings(id);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerMappings: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerRemove**
> biometricControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 

try {
    api_instance.biometricControllerRemove(id);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerRemove: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerSync**
> biometricControllerSync(id)

Pull logs from the device and import as attendance punches

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 

try {
    api_instance.biometricControllerSync(id);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerSync: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerSyncLogs**
> biometricControllerSyncLogs(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 

try {
    api_instance.biometricControllerSyncLogs(id);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerSyncLogs: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerTest**
> biometricControllerTest(id)

Test connectivity via the vendor adapter

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 

try {
    api_instance.biometricControllerTest(id);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerTest: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **biometricControllerUpdate**
> biometricControllerUpdate(id, updateDeviceDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = BiometricDevicesApi();
final id = id_example; // String | 
final updateDeviceDto = UpdateDeviceDto(); // UpdateDeviceDto | 

try {
    api_instance.biometricControllerUpdate(id, updateDeviceDto);
} catch (e) {
    print('Exception when calling BiometricDevicesApi->biometricControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateDeviceDto** | [**UpdateDeviceDto**](UpdateDeviceDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

