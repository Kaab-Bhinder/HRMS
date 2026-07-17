# wms_api_client.api.OrganizationApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**organizationsControllerCreateLocation**](OrganizationApi.md#organizationscontrollercreatelocation) | **POST** /api/v1/organizations/locations | 
[**organizationsControllerCurrent**](OrganizationApi.md#organizationscontrollercurrent) | **GET** /api/v1/organizations/current | 
[**organizationsControllerLocations**](OrganizationApi.md#organizationscontrollerlocations) | **GET** /api/v1/organizations/locations | 
[**organizationsControllerRemoveLocation**](OrganizationApi.md#organizationscontrollerremovelocation) | **DELETE** /api/v1/organizations/locations/{id} | 
[**organizationsControllerUpdate**](OrganizationApi.md#organizationscontrollerupdate) | **PATCH** /api/v1/organizations/current | 
[**organizationsControllerUpdateLocation**](OrganizationApi.md#organizationscontrollerupdatelocation) | **PATCH** /api/v1/organizations/locations/{id} | 


# **organizationsControllerCreateLocation**
> organizationsControllerCreateLocation(createLocationDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();
final createLocationDto = CreateLocationDto(); // CreateLocationDto | 

try {
    api_instance.organizationsControllerCreateLocation(createLocationDto);
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerCreateLocation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createLocationDto** | [**CreateLocationDto**](CreateLocationDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationsControllerCurrent**
> organizationsControllerCurrent()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();

try {
    api_instance.organizationsControllerCurrent();
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerCurrent: $e\n');
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

# **organizationsControllerLocations**
> organizationsControllerLocations()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();

try {
    api_instance.organizationsControllerLocations();
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerLocations: $e\n');
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

# **organizationsControllerRemoveLocation**
> organizationsControllerRemoveLocation(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();
final id = id_example; // String | 

try {
    api_instance.organizationsControllerRemoveLocation(id);
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerRemoveLocation: $e\n');
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

# **organizationsControllerUpdate**
> organizationsControllerUpdate(updateOrganizationDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();
final updateOrganizationDto = UpdateOrganizationDto(); // UpdateOrganizationDto | 

try {
    api_instance.organizationsControllerUpdate(updateOrganizationDto);
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateOrganizationDto** | [**UpdateOrganizationDto**](UpdateOrganizationDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationsControllerUpdateLocation**
> organizationsControllerUpdateLocation(id, updateLocationDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = OrganizationApi();
final id = id_example; // String | 
final updateLocationDto = UpdateLocationDto(); // UpdateLocationDto | 

try {
    api_instance.organizationsControllerUpdateLocation(id, updateLocationDto);
} catch (e) {
    print('Exception when calling OrganizationApi->organizationsControllerUpdateLocation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateLocationDto** | [**UpdateLocationDto**](UpdateLocationDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

