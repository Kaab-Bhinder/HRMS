# wms_api_client.api.AuthApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerListSessions**](AuthApi.md#authcontrollerlistsessions) | **GET** /api/v1/auth/sessions | List the current user’s active sessions (devices)
[**authControllerLogin**](AuthApi.md#authcontrollerlogin) | **POST** /api/v1/auth/login | Authenticate and receive an access token (+ refresh cookie)
[**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/v1/auth/logout | 
[**authControllerMe**](AuthApi.md#authcontrollerme) | **GET** /api/v1/auth/me | Current authenticated user with roles and permissions
[**authControllerRefresh**](AuthApi.md#authcontrollerrefresh) | **POST** /api/v1/auth/refresh | Rotate tokens using the refresh cookie (web) or body token (mobile)
[**authControllerRevokeOtherSessions**](AuthApi.md#authcontrollerrevokeothersessions) | **DELETE** /api/v1/auth/sessions/others | Sign out of every other session, keeping the current one
[**authControllerRevokeSession**](AuthApi.md#authcontrollerrevokesession) | **DELETE** /api/v1/auth/sessions/{id} | Revoke a specific session by id


# **authControllerListSessions**
> authControllerListSessions()

List the current user’s active sessions (devices)

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerListSessions();
} catch (e) {
    print('Exception when calling AuthApi->authControllerListSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogin**
> authControllerLogin(loginDto)

Authenticate and receive an access token (+ refresh cookie)

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();
final loginDto = LoginDto(); // LoginDto | 

try {
    api_instance.authControllerLogin(loginDto);
} catch (e) {
    print('Exception when calling AuthApi->authControllerLogin: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginDto** | [**LoginDto**](LoginDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> authControllerLogout(refreshDto)



### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();
final refreshDto = RefreshDto(); // RefreshDto | 

try {
    api_instance.authControllerLogout(refreshDto);
} catch (e) {
    print('Exception when calling AuthApi->authControllerLogout: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshDto** | [**RefreshDto**](RefreshDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerMe**
> authControllerMe()

Current authenticated user with roles and permissions

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerMe();
} catch (e) {
    print('Exception when calling AuthApi->authControllerMe: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRefresh**
> authControllerRefresh(refreshDto)

Rotate tokens using the refresh cookie (web) or body token (mobile)

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();
final refreshDto = RefreshDto(); // RefreshDto | 

try {
    api_instance.authControllerRefresh(refreshDto);
} catch (e) {
    print('Exception when calling AuthApi->authControllerRefresh: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshDto** | [**RefreshDto**](RefreshDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRevokeOtherSessions**
> authControllerRevokeOtherSessions()

Sign out of every other session, keeping the current one

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerRevokeOtherSessions();
} catch (e) {
    print('Exception when calling AuthApi->authControllerRevokeOtherSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRevokeSession**
> authControllerRevokeSession(id)

Revoke a specific session by id

### Example
```dart
import 'package:wms_api_client/api.dart';

final api_instance = AuthApi();
final id = id_example; // String | 

try {
    api_instance.authControllerRevokeSession(id);
} catch (e) {
    print('Exception when calling AuthApi->authControllerRevokeSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

