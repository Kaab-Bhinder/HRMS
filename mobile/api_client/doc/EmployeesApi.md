# wms_api_client.api.EmployeesApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**employeesControllerBulkImport**](EmployeesApi.md#employeescontrollerbulkimport) | **POST** /api/v1/employees/import | Bulk import employees (per-row validation, partial success)
[**employeesControllerCreate**](EmployeesApi.md#employeescontrollercreate) | **POST** /api/v1/employees | 
[**employeesControllerGet**](EmployeesApi.md#employeescontrollerget) | **GET** /api/v1/employees/{id} | 
[**employeesControllerHistory**](EmployeesApi.md#employeescontrollerhistory) | **GET** /api/v1/employees/{id}/history | 
[**employeesControllerList**](EmployeesApi.md#employeescontrollerlist) | **GET** /api/v1/employees | List employees (paginated, filterable, searchable incl. custom fields)
[**employeesControllerRemove**](EmployeesApi.md#employeescontrollerremove) | **DELETE** /api/v1/employees/{id} | 
[**employeesControllerRestore**](EmployeesApi.md#employeescontrollerrestore) | **POST** /api/v1/employees/{id}/restore | 
[**employeesControllerUpdate**](EmployeesApi.md#employeescontrollerupdate) | **PATCH** /api/v1/employees/{id} | 


# **employeesControllerBulkImport**
> employeesControllerBulkImport(bulkImportDto)

Bulk import employees (per-row validation, partial success)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final bulkImportDto = BulkImportDto(); // BulkImportDto | 

try {
    api_instance.employeesControllerBulkImport(bulkImportDto);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerBulkImport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **bulkImportDto** | [**BulkImportDto**](BulkImportDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeesControllerCreate**
> employeesControllerCreate(createEmployeeDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final createEmployeeDto = CreateEmployeeDto(); // CreateEmployeeDto | 

try {
    api_instance.employeesControllerCreate(createEmployeeDto);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createEmployeeDto** | [**CreateEmployeeDto**](CreateEmployeeDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeesControllerGet**
> employeesControllerGet(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final id = id_example; // String | 

try {
    api_instance.employeesControllerGet(id);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerGet: $e\n');
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

# **employeesControllerHistory**
> employeesControllerHistory(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final id = id_example; // String | 

try {
    api_instance.employeesControllerHistory(id);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerHistory: $e\n');
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

# **employeesControllerList**
> employeesControllerList(search, sort, order, status, departmentId, designationId, employmentType, cfKey, cfValue)

List employees (paginated, filterable, searchable incl. custom fields)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final status = status_example; // String | 
final departmentId = departmentId_example; // String | 
final designationId = designationId_example; // String | 
final employmentType = employmentType_example; // String | 
final cfKey = cfKey_example; // String | 
final cfValue = cfValue_example; // String | 

try {
    api_instance.employeesControllerList(search, sort, order, status, departmentId, designationId, employmentType, cfKey, cfValue);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **status** | **String**|  | [optional] 
 **departmentId** | **String**|  | [optional] 
 **designationId** | **String**|  | [optional] 
 **employmentType** | **String**|  | [optional] 
 **cfKey** | **String**|  | [optional] 
 **cfValue** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeesControllerRemove**
> employeesControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final id = id_example; // String | 

try {
    api_instance.employeesControllerRemove(id);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerRemove: $e\n');
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

# **employeesControllerRestore**
> employeesControllerRestore(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final id = id_example; // String | 

try {
    api_instance.employeesControllerRestore(id);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerRestore: $e\n');
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

# **employeesControllerUpdate**
> employeesControllerUpdate(id, updateEmployeeDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = EmployeesApi();
final id = id_example; // String | 
final updateEmployeeDto = UpdateEmployeeDto(); // UpdateEmployeeDto | 

try {
    api_instance.employeesControllerUpdate(id, updateEmployeeDto);
} catch (e) {
    print('Exception when calling EmployeesApi->employeesControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateEmployeeDto** | [**UpdateEmployeeDto**](UpdateEmployeeDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

