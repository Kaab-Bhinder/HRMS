# wms_api_client.api.ReportsApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**reportsControllerCreate**](ReportsApi.md#reportscontrollercreate) | **POST** /api/v1/reports | 
[**reportsControllerExport**](ReportsApi.md#reportscontrollerexport) | **GET** /api/v1/reports/export | Run and download a report (module + format + filters)
[**reportsControllerList**](ReportsApi.md#reportscontrollerlist) | **GET** /api/v1/reports | List saved reports (paginated, filter by ?module=)
[**reportsControllerRemove**](ReportsApi.md#reportscontrollerremove) | **DELETE** /api/v1/reports/{id} | 
[**reportsControllerUpdate**](ReportsApi.md#reportscontrollerupdate) | **PATCH** /api/v1/reports/{id} | 


# **reportsControllerCreate**
> reportsControllerCreate(createSavedReportDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ReportsApi();
final createSavedReportDto = CreateSavedReportDto(); // CreateSavedReportDto | 

try {
    api_instance.reportsControllerCreate(createSavedReportDto);
} catch (e) {
    print('Exception when calling ReportsApi->reportsControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createSavedReportDto** | [**CreateSavedReportDto**](CreateSavedReportDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reportsControllerExport**
> reportsControllerExport(module, format, search, status, departmentId, employeeId, leaveTypeId, from, to)

Run and download a report (module + format + filters)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ReportsApi();
final module = module_example; // String | 
final format = format_example; // String | 
final search = search_example; // String | 
final status = status_example; // String | 
final departmentId = departmentId_example; // String | 
final employeeId = employeeId_example; // String | 
final leaveTypeId = leaveTypeId_example; // String | 
final from = from_example; // String | 
final to = to_example; // String | 

try {
    api_instance.reportsControllerExport(module, format, search, status, departmentId, employeeId, leaveTypeId, from, to);
} catch (e) {
    print('Exception when calling ReportsApi->reportsControllerExport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **module** | **String**|  | 
 **format** | **String**|  | [optional] [default to 'csv']
 **search** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **departmentId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 
 **leaveTypeId** | **String**|  | [optional] 
 **from** | **String**|  | [optional] 
 **to** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reportsControllerList**
> reportsControllerList(search, sort, order, module)

List saved reports (paginated, filter by ?module=)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ReportsApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final module = module_example; // String | 

try {
    api_instance.reportsControllerList(search, sort, order, module);
} catch (e) {
    print('Exception when calling ReportsApi->reportsControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **module** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reportsControllerRemove**
> reportsControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ReportsApi();
final id = id_example; // String | 

try {
    api_instance.reportsControllerRemove(id);
} catch (e) {
    print('Exception when calling ReportsApi->reportsControllerRemove: $e\n');
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

# **reportsControllerUpdate**
> reportsControllerUpdate(id, updateSavedReportDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ReportsApi();
final id = id_example; // String | 
final updateSavedReportDto = UpdateSavedReportDto(); // UpdateSavedReportDto | 

try {
    api_instance.reportsControllerUpdate(id, updateSavedReportDto);
} catch (e) {
    print('Exception when calling ReportsApi->reportsControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateSavedReportDto** | [**UpdateSavedReportDto**](UpdateSavedReportDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

