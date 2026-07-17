# wms_api_client.api.FilesDocumentsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**filesControllerGet**](FilesDocumentsApi.md#filescontrollerget) | **GET** /api/v1/files/{id} | 
[**filesControllerList**](FilesDocumentsApi.md#filescontrollerlist) | **GET** /api/v1/files | List files for an owner (e.g. ownerType=employee&ownerId=...)
[**filesControllerPresign**](FilesDocumentsApi.md#filescontrollerpresign) | **POST** /api/v1/files/presign | Get a presigned upload URL (validates MIME)
[**filesControllerRegister**](FilesDocumentsApi.md#filescontrollerregister) | **POST** /api/v1/files | Register uploaded file metadata (e.g. an employee document)
[**filesControllerRemove**](FilesDocumentsApi.md#filescontrollerremove) | **DELETE** /api/v1/files/{id} | 


# **filesControllerGet**
> filesControllerGet(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FilesDocumentsApi();
final id = id_example; // String | 

try {
    api_instance.filesControllerGet(id);
} catch (e) {
    print('Exception when calling FilesDocumentsApi->filesControllerGet: $e\n');
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

# **filesControllerList**
> filesControllerList(ownerType, ownerId)

List files for an owner (e.g. ownerType=employee&ownerId=...)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FilesDocumentsApi();
final ownerType = ownerType_example; // String | 
final ownerId = ownerId_example; // String | 

try {
    api_instance.filesControllerList(ownerType, ownerId);
} catch (e) {
    print('Exception when calling FilesDocumentsApi->filesControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ownerType** | **String**|  | 
 **ownerId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerPresign**
> filesControllerPresign(presignDto)

Get a presigned upload URL (validates MIME)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FilesDocumentsApi();
final presignDto = PresignDto(); // PresignDto | 

try {
    api_instance.filesControllerPresign(presignDto);
} catch (e) {
    print('Exception when calling FilesDocumentsApi->filesControllerPresign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **presignDto** | [**PresignDto**](PresignDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerRegister**
> filesControllerRegister(registerFileDto)

Register uploaded file metadata (e.g. an employee document)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FilesDocumentsApi();
final registerFileDto = RegisterFileDto(); // RegisterFileDto | 

try {
    api_instance.filesControllerRegister(registerFileDto);
} catch (e) {
    print('Exception when calling FilesDocumentsApi->filesControllerRegister: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerFileDto** | [**RegisterFileDto**](RegisterFileDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerRemove**
> filesControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FilesDocumentsApi();
final id = id_example; // String | 

try {
    api_instance.filesControllerRemove(id);
} catch (e) {
    print('Exception when calling FilesDocumentsApi->filesControllerRemove: $e\n');
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

