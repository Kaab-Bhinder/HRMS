# wms_api_client.api.AttendanceConfigApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**attendanceConfigControllerCreateHoliday**](AttendanceConfigApi.md#attendanceconfigcontrollercreateholiday) | **POST** /api/v1/holidays | 
[**attendanceConfigControllerCreatePolicy**](AttendanceConfigApi.md#attendanceconfigcontrollercreatepolicy) | **POST** /api/v1/attendance-policies | 
[**attendanceConfigControllerCreateShift**](AttendanceConfigApi.md#attendanceconfigcontrollercreateshift) | **POST** /api/v1/shifts | 
[**attendanceConfigControllerHolidays**](AttendanceConfigApi.md#attendanceconfigcontrollerholidays) | **GET** /api/v1/holidays | 
[**attendanceConfigControllerPolicies**](AttendanceConfigApi.md#attendanceconfigcontrollerpolicies) | **GET** /api/v1/attendance-policies | 
[**attendanceConfigControllerRemoveHoliday**](AttendanceConfigApi.md#attendanceconfigcontrollerremoveholiday) | **DELETE** /api/v1/holidays/{id} | 
[**attendanceConfigControllerRemoveShift**](AttendanceConfigApi.md#attendanceconfigcontrollerremoveshift) | **DELETE** /api/v1/shifts/{id} | 
[**attendanceConfigControllerShifts**](AttendanceConfigApi.md#attendanceconfigcontrollershifts) | **GET** /api/v1/shifts | 
[**attendanceConfigControllerUpdatePolicy**](AttendanceConfigApi.md#attendanceconfigcontrollerupdatepolicy) | **PATCH** /api/v1/attendance-policies/{id} | 
[**attendanceConfigControllerUpdateShift**](AttendanceConfigApi.md#attendanceconfigcontrollerupdateshift) | **PATCH** /api/v1/shifts/{id} | 


# **attendanceConfigControllerCreateHoliday**
> attendanceConfigControllerCreateHoliday(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final body = Object(); // Object | 

try {
    api_instance.attendanceConfigControllerCreateHoliday(body);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerCreateHoliday: $e\n');
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

# **attendanceConfigControllerCreatePolicy**
> attendanceConfigControllerCreatePolicy(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final body = Object(); // Object | 

try {
    api_instance.attendanceConfigControllerCreatePolicy(body);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerCreatePolicy: $e\n');
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

# **attendanceConfigControllerCreateShift**
> attendanceConfigControllerCreateShift(body)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final body = Object(); // Object | 

try {
    api_instance.attendanceConfigControllerCreateShift(body);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerCreateShift: $e\n');
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

# **attendanceConfigControllerHolidays**
> attendanceConfigControllerHolidays()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();

try {
    api_instance.attendanceConfigControllerHolidays();
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerHolidays: $e\n');
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

# **attendanceConfigControllerPolicies**
> attendanceConfigControllerPolicies()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();

try {
    api_instance.attendanceConfigControllerPolicies();
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerPolicies: $e\n');
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

# **attendanceConfigControllerRemoveHoliday**
> attendanceConfigControllerRemoveHoliday(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final id = id_example; // String | 

try {
    api_instance.attendanceConfigControllerRemoveHoliday(id);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerRemoveHoliday: $e\n');
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

# **attendanceConfigControllerRemoveShift**
> attendanceConfigControllerRemoveShift(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final id = id_example; // String | 

try {
    api_instance.attendanceConfigControllerRemoveShift(id);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerRemoveShift: $e\n');
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

# **attendanceConfigControllerShifts**
> attendanceConfigControllerShifts()



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();

try {
    api_instance.attendanceConfigControllerShifts();
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerShifts: $e\n');
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

# **attendanceConfigControllerUpdatePolicy**
> attendanceConfigControllerUpdatePolicy(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final id = id_example; // String | 

try {
    api_instance.attendanceConfigControllerUpdatePolicy(id);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerUpdatePolicy: $e\n');
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

# **attendanceConfigControllerUpdateShift**
> attendanceConfigControllerUpdateShift(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AttendanceConfigApi();
final id = id_example; // String | 

try {
    api_instance.attendanceConfigControllerUpdateShift(id);
} catch (e) {
    print('Exception when calling AttendanceConfigApi->attendanceConfigControllerUpdateShift: $e\n');
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

