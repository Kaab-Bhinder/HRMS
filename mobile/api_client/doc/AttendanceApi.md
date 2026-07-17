# wms_api_client.api.AttendanceApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**attendanceControllerActiveSession**](AttendanceApi.md#attendancecontrolleractivesession) | **GET** /api/v1/attendance/tracking/active | Your current active tracking session (if any)
[**attendanceControllerApprove**](AttendanceApi.md#attendancecontrollerapprove) | **POST** /api/v1/attendance/regularizations/{id}/approve | 
[**attendanceControllerList**](AttendanceApi.md#attendancecontrollerlist) | **GET** /api/v1/attendance | 
[**attendanceControllerListRegularizations**](AttendanceApi.md#attendancecontrollerlistregularizations) | **GET** /api/v1/attendance/regularizations | 
[**attendanceControllerLive**](AttendanceApi.md#attendancecontrollerlive) | **GET** /api/v1/attendance/live | Live map: active sessions with latest positions (admin)
[**attendanceControllerManual**](AttendanceApi.md#attendancecontrollermanual) | **POST** /api/v1/attendance/manual | Admin manual attendance entry
[**attendanceControllerPing**](AttendanceApi.md#attendancecontrollerping) | **POST** /api/v1/attendance/tracking/ping | Stream batched location pings for your active session
[**attendanceControllerPunch**](AttendanceApi.md#attendancecontrollerpunch) | **POST** /api/v1/attendance/punch | Punch attendance via any method (manual/web/gps/face/qr)
[**attendanceControllerRegularize**](AttendanceApi.md#attendancecontrollerregularize) | **POST** /api/v1/attendance/regularizations | Request a missed-punch correction (routes to approval engine)
[**attendanceControllerReject**](AttendanceApi.md#attendancecontrollerreject) | **POST** /api/v1/attendance/regularizations/{id}/reject | 
[**attendanceControllerRoute**](AttendanceApi.md#attendancecontrollerroute) | **GET** /api/v1/attendance/sessions/{id}/route | Full ordered route for a session (playback, admin)
[**attendanceControllerSummary**](AttendanceApi.md#attendancecontrollersummary) | **GET** /api/v1/attendance/summary | 


# **attendanceControllerActiveSession**
> attendanceControllerActiveSession()

Your current active tracking session (if any)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();

try {
    api_instance.attendanceControllerActiveSession();
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerActiveSession: $e\n');
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

# **attendanceControllerApprove**
> attendanceControllerApprove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final id = id_example; // String | 

try {
    api_instance.attendanceControllerApprove(id);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerApprove: $e\n');
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

# **attendanceControllerList**
> attendanceControllerList(search, sort, order, date, employeeId, departmentId, status, flagged)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final date = date_example; // String | 
final employeeId = employeeId_example; // String | 
final departmentId = departmentId_example; // String | 
final status = status_example; // String | 
final flagged = true; // bool | 

try {
    api_instance.attendanceControllerList(search, sort, order, date, employeeId, departmentId, status, flagged);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **date** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 
 **departmentId** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **flagged** | **bool**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerListRegularizations**
> attendanceControllerListRegularizations(status)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final status = status_example; // String | 

try {
    api_instance.attendanceControllerListRegularizations(status);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerListRegularizations: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerLive**
> attendanceControllerLive()

Live map: active sessions with latest positions (admin)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();

try {
    api_instance.attendanceControllerLive();
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerLive: $e\n');
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

# **attendanceControllerManual**
> attendanceControllerManual(manualEntryDto)

Admin manual attendance entry

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final manualEntryDto = ManualEntryDto(); // ManualEntryDto | 

try {
    api_instance.attendanceControllerManual(manualEntryDto);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerManual: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **manualEntryDto** | [**ManualEntryDto**](ManualEntryDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerPing**
> attendanceControllerPing(pingDto)

Stream batched location pings for your active session

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final pingDto = PingDto(); // PingDto | 

try {
    api_instance.attendanceControllerPing(pingDto);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerPing: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **pingDto** | [**PingDto**](PingDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerPunch**
> attendanceControllerPunch(punchDto)

Punch attendance via any method (manual/web/gps/face/qr)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final punchDto = PunchDto(); // PunchDto | 

try {
    api_instance.attendanceControllerPunch(punchDto);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerPunch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **punchDto** | [**PunchDto**](PunchDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerRegularize**
> attendanceControllerRegularize(regularizationDto)

Request a missed-punch correction (routes to approval engine)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final regularizationDto = RegularizationDto(); // RegularizationDto | 

try {
    api_instance.attendanceControllerRegularize(regularizationDto);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerRegularize: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **regularizationDto** | [**RegularizationDto**](RegularizationDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceControllerReject**
> attendanceControllerReject(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final id = id_example; // String | 

try {
    api_instance.attendanceControllerReject(id);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerReject: $e\n');
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

# **attendanceControllerRoute**
> attendanceControllerRoute(id)

Full ordered route for a session (playback, admin)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final id = id_example; // String | 

try {
    api_instance.attendanceControllerRoute(id);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerRoute: $e\n');
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

# **attendanceControllerSummary**
> attendanceControllerSummary(date)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceApi();
final date = date_example; // String | 

try {
    api_instance.attendanceControllerSummary(date);
} catch (e) {
    print('Exception when calling AttendanceApi->attendanceControllerSummary: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **date** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

