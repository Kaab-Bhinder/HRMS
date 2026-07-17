# wms_api_client.api.SettingsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**settingsControllerGetAll**](SettingsApi.md#settingscontrollergetall) | **GET** /api/v1/settings | 
[**settingsControllerGetSection**](SettingsApi.md#settingscontrollergetsection) | **GET** /api/v1/settings/{section} | 
[**settingsControllerPatchSection**](SettingsApi.md#settingscontrollerpatchsection) | **PATCH** /api/v1/settings/{section} | 
[**settingsControllerPutSection**](SettingsApi.md#settingscontrollerputsection) | **PUT** /api/v1/settings/{section} | 


# **settingsControllerGetAll**
> settingsControllerGetAll()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = SettingsApi();

try {
    api_instance.settingsControllerGetAll();
} catch (e) {
    print('Exception when calling SettingsApi->settingsControllerGetAll: $e\n');
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

# **settingsControllerGetSection**
> settingsControllerGetSection(section)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = SettingsApi();
final section = section_example; // String | 

try {
    api_instance.settingsControllerGetSection(section);
} catch (e) {
    print('Exception when calling SettingsApi->settingsControllerGetSection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **section** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerPatchSection**
> settingsControllerPatchSection(section, updateSettingDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = SettingsApi();
final section = section_example; // String | 
final updateSettingDto = UpdateSettingDto(); // UpdateSettingDto | 

try {
    api_instance.settingsControllerPatchSection(section, updateSettingDto);
} catch (e) {
    print('Exception when calling SettingsApi->settingsControllerPatchSection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **section** | **String**|  | 
 **updateSettingDto** | [**UpdateSettingDto**](UpdateSettingDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerPutSection**
> settingsControllerPutSection(section, updateSettingDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = SettingsApi();
final section = section_example; // String | 
final updateSettingDto = UpdateSettingDto(); // UpdateSettingDto | 

try {
    api_instance.settingsControllerPutSection(section, updateSettingDto);
} catch (e) {
    print('Exception when calling SettingsApi->settingsControllerPutSection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **section** | **String**|  | 
 **updateSettingDto** | [**UpdateSettingDto**](UpdateSettingDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

