# wms_api_client.api.AnalyticsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analyticsControllerAttendance**](AnalyticsApi.md#analyticscontrollerattendance) | **GET** /api/v1/analytics/attendance | Attendance status breakdown for a date range
[**analyticsControllerDepartments**](AnalyticsApi.md#analyticscontrollerdepartments) | **GET** /api/v1/analytics/departments | Per-department headcount and present percentage
[**analyticsControllerOverview**](AnalyticsApi.md#analyticscontrolleroverview) | **GET** /api/v1/analytics/overview | Dashboard overview (KPIs + charts, aggregates only, filterable)


# **analyticsControllerAttendance**
> analyticsControllerAttendance(from, to, departmentId, locationId, employeeId)

Attendance status breakdown for a date range

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AnalyticsApi();
final from = from_example; // String | ISO date (inclusive lower bound)
final to = to_example; // String | ISO date (inclusive upper bound)
final departmentId = departmentId_example; // String | 
final locationId = locationId_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.analyticsControllerAttendance(from, to, departmentId, locationId, employeeId);
} catch (e) {
    print('Exception when calling AnalyticsApi->analyticsControllerAttendance: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **from** | **String**| ISO date (inclusive lower bound) | [optional] 
 **to** | **String**| ISO date (inclusive upper bound) | [optional] 
 **departmentId** | **String**|  | [optional] 
 **locationId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsControllerDepartments**
> analyticsControllerDepartments(from, to, departmentId, locationId, employeeId)

Per-department headcount and present percentage

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AnalyticsApi();
final from = from_example; // String | ISO date (inclusive lower bound)
final to = to_example; // String | ISO date (inclusive upper bound)
final departmentId = departmentId_example; // String | 
final locationId = locationId_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.analyticsControllerDepartments(from, to, departmentId, locationId, employeeId);
} catch (e) {
    print('Exception when calling AnalyticsApi->analyticsControllerDepartments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **from** | **String**| ISO date (inclusive lower bound) | [optional] 
 **to** | **String**| ISO date (inclusive upper bound) | [optional] 
 **departmentId** | **String**|  | [optional] 
 **locationId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsControllerOverview**
> analyticsControllerOverview(from, to, departmentId, locationId, employeeId)

Dashboard overview (KPIs + charts, aggregates only, filterable)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AnalyticsApi();
final from = from_example; // String | ISO date (inclusive lower bound)
final to = to_example; // String | ISO date (inclusive upper bound)
final departmentId = departmentId_example; // String | 
final locationId = locationId_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.analyticsControllerOverview(from, to, departmentId, locationId, employeeId);
} catch (e) {
    print('Exception when calling AnalyticsApi->analyticsControllerOverview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **from** | **String**| ISO date (inclusive lower bound) | [optional] 
 **to** | **String**| ISO date (inclusive upper bound) | [optional] 
 **departmentId** | **String**|  | [optional] 
 **locationId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

