# wms_api_client.api.AuditActivityApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**auditControllerActivity**](AuditActivityApi.md#auditcontrolleractivity) | **GET** /api/v1/audit/activity | 
[**auditControllerLogs**](AuditActivityApi.md#auditcontrollerlogs) | **GET** /api/v1/audit/logs | 


# **auditControllerActivity**
> auditControllerActivity(limit)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuditActivityApi();
final limit = limit_example; // String | 

try {
    api_instance.auditControllerActivity(limit);
} catch (e) {
    print('Exception when calling AuditActivityApi->auditControllerActivity: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auditControllerLogs**
> auditControllerLogs(page, limit, search, action, entityType, actorUserId, from, to)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuditActivityApi();
final page = page_example; // String | 
final limit = limit_example; // String | 
final search = search_example; // String | 
final action = action_example; // String | 
final entityType = entityType_example; // String | 
final actorUserId = actorUserId_example; // String | 
final from = from_example; // String | 
final to = to_example; // String | 

try {
    api_instance.auditControllerLogs(page, limit, search, action, entityType, actorUserId, from, to);
} catch (e) {
    print('Exception when calling AuditActivityApi->auditControllerLogs: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **String**|  | 
 **limit** | **String**|  | 
 **search** | **String**|  | 
 **action** | **String**|  | 
 **entityType** | **String**|  | 
 **actorUserId** | **String**|  | 
 **from** | **String**|  | 
 **to** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

