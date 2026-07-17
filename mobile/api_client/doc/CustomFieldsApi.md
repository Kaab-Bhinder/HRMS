# wms_api_client.api.CustomFieldsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**customFieldsControllerCreate**](CustomFieldsApi.md#customfieldscontrollercreate) | **POST** /api/v1/custom-fields | 
[**customFieldsControllerList**](CustomFieldsApi.md#customfieldscontrollerlist) | **GET** /api/v1/custom-fields | 
[**customFieldsControllerRemove**](CustomFieldsApi.md#customfieldscontrollerremove) | **DELETE** /api/v1/custom-fields/{id} | 
[**customFieldsControllerReorder**](CustomFieldsApi.md#customfieldscontrollerreorder) | **PATCH** /api/v1/custom-fields/reorder | 
[**customFieldsControllerUpdate**](CustomFieldsApi.md#customfieldscontrollerupdate) | **PATCH** /api/v1/custom-fields/{id} | 


# **customFieldsControllerCreate**
> customFieldsControllerCreate(createCustomFieldDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = CustomFieldsApi();
final createCustomFieldDto = CreateCustomFieldDto(); // CreateCustomFieldDto | 

try {
    api_instance.customFieldsControllerCreate(createCustomFieldDto);
} catch (e) {
    print('Exception when calling CustomFieldsApi->customFieldsControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createCustomFieldDto** | [**CreateCustomFieldDto**](CreateCustomFieldDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **customFieldsControllerList**
> customFieldsControllerList(entity)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = CustomFieldsApi();
final entity = entity_example; // String | 

try {
    api_instance.customFieldsControllerList(entity);
} catch (e) {
    print('Exception when calling CustomFieldsApi->customFieldsControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **entity** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **customFieldsControllerRemove**
> customFieldsControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = CustomFieldsApi();
final id = id_example; // String | 

try {
    api_instance.customFieldsControllerRemove(id);
} catch (e) {
    print('Exception when calling CustomFieldsApi->customFieldsControllerRemove: $e\n');
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

# **customFieldsControllerReorder**
> customFieldsControllerReorder(reorderDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = CustomFieldsApi();
final reorderDto = ReorderDto(); // ReorderDto | 

try {
    api_instance.customFieldsControllerReorder(reorderDto);
} catch (e) {
    print('Exception when calling CustomFieldsApi->customFieldsControllerReorder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **reorderDto** | [**ReorderDto**](ReorderDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **customFieldsControllerUpdate**
> customFieldsControllerUpdate(id, updateCustomFieldDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = CustomFieldsApi();
final id = id_example; // String | 
final updateCustomFieldDto = UpdateCustomFieldDto(); // UpdateCustomFieldDto | 

try {
    api_instance.customFieldsControllerUpdate(id, updateCustomFieldDto);
} catch (e) {
    print('Exception when calling CustomFieldsApi->customFieldsControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateCustomFieldDto** | [**UpdateCustomFieldDto**](UpdateCustomFieldDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

