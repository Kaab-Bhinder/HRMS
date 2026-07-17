# wms_api_client.api.NotificationsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notificationsControllerChannels**](NotificationsApi.md#notificationscontrollerchannels) | **GET** /api/v1/notifications/channels | 
[**notificationsControllerDispatch**](NotificationsApi.md#notificationscontrollerdispatch) | **POST** /api/v1/notifications/dispatch | 
[**notificationsControllerList**](NotificationsApi.md#notificationscontrollerlist) | **GET** /api/v1/notifications | 
[**notificationsControllerPrefs**](NotificationsApi.md#notificationscontrollerprefs) | **GET** /api/v1/notifications/preferences | 
[**notificationsControllerRead**](NotificationsApi.md#notificationscontrollerread) | **PATCH** /api/v1/notifications/{id}/read | 
[**notificationsControllerReadAll**](NotificationsApi.md#notificationscontrollerreadall) | **PATCH** /api/v1/notifications/read-all | 
[**notificationsControllerSetPref**](NotificationsApi.md#notificationscontrollersetpref) | **PATCH** /api/v1/notifications/preferences | 
[**notificationsControllerTemplates**](NotificationsApi.md#notificationscontrollertemplates) | **GET** /api/v1/notifications/templates | 
[**notificationsControllerUnread**](NotificationsApi.md#notificationscontrollerunread) | **GET** /api/v1/notifications/unread-count | 
[**notificationsControllerUpsertTemplate**](NotificationsApi.md#notificationscontrollerupserttemplate) | **POST** /api/v1/notifications/templates | 


# **notificationsControllerChannels**
> notificationsControllerChannels()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();

try {
    api_instance.notificationsControllerChannels();
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerChannels: $e\n');
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

# **notificationsControllerDispatch**
> notificationsControllerDispatch(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();
final body = Object(); // Object | 

try {
    api_instance.notificationsControllerDispatch(body);
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerDispatch: $e\n');
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

# **notificationsControllerList**
> notificationsControllerList(unreadOnly, page, limit)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();
final unreadOnly = unreadOnly_example; // String | 
final page = page_example; // String | 
final limit = limit_example; // String | 

try {
    api_instance.notificationsControllerList(unreadOnly, page, limit);
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **unreadOnly** | **String**|  | 
 **page** | **String**|  | 
 **limit** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsControllerPrefs**
> notificationsControllerPrefs()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();

try {
    api_instance.notificationsControllerPrefs();
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerPrefs: $e\n');
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

# **notificationsControllerRead**
> notificationsControllerRead(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();
final id = id_example; // String | 

try {
    api_instance.notificationsControllerRead(id);
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerRead: $e\n');
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

# **notificationsControllerReadAll**
> notificationsControllerReadAll()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();

try {
    api_instance.notificationsControllerReadAll();
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerReadAll: $e\n');
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

# **notificationsControllerSetPref**
> notificationsControllerSetPref(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();
final body = Object(); // Object | 

try {
    api_instance.notificationsControllerSetPref(body);
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerSetPref: $e\n');
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

# **notificationsControllerTemplates**
> notificationsControllerTemplates()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();

try {
    api_instance.notificationsControllerTemplates();
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerTemplates: $e\n');
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

# **notificationsControllerUnread**
> notificationsControllerUnread()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();

try {
    api_instance.notificationsControllerUnread();
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerUnread: $e\n');
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

# **notificationsControllerUpsertTemplate**
> notificationsControllerUpsertTemplate(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = NotificationsApi();
final body = Object(); // Object | 

try {
    api_instance.notificationsControllerUpsertTemplate(body);
} catch (e) {
    print('Exception when calling NotificationsApi->notificationsControllerUpsertTemplate: $e\n');
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

