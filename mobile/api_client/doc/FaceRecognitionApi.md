# wms_api_client.api.FaceRecognitionApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**faceControllerEnroll**](FaceRecognitionApi.md#facecontrollerenroll) | **POST** /api/v1/face/templates | 
[**faceControllerTemplates**](FaceRecognitionApi.md#facecontrollertemplates) | **GET** /api/v1/face/templates/{employeeId} | 


# **faceControllerEnroll**
> faceControllerEnroll(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FaceRecognitionApi();
final body = Object(); // Object | 

try {
    api_instance.faceControllerEnroll(body);
} catch (e) {
    print('Exception when calling FaceRecognitionApi->faceControllerEnroll: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **Object**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **faceControllerTemplates**
> faceControllerTemplates(employeeId)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = FaceRecognitionApi();
final employeeId = employeeId_example; // String | 

try {
    api_instance.faceControllerTemplates(employeeId);
} catch (e) {
    print('Exception when calling FaceRecognitionApi->faceControllerTemplates: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **employeeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

