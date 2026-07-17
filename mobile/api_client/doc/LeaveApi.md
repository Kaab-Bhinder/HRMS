# wms_api_client.api.LeaveApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**leaveControllerApprove**](LeaveApi.md#leavecontrollerapprove) | **POST** /api/v1/leave/requests/{id}/approve | 
[**leaveControllerBalances**](LeaveApi.md#leavecontrollerbalances) | **GET** /api/v1/leave/balances/{employeeId} | Leave balances for an employee (current year)
[**leaveControllerCancel**](LeaveApi.md#leavecontrollercancel) | **POST** /api/v1/leave/requests/{id}/cancel | 
[**leaveControllerCreateRequest**](LeaveApi.md#leavecontrollercreaterequest) | **POST** /api/v1/leave/requests | 
[**leaveControllerCreateType**](LeaveApi.md#leavecontrollercreatetype) | **POST** /api/v1/leave/types | 
[**leaveControllerListRequests**](LeaveApi.md#leavecontrollerlistrequests) | **GET** /api/v1/leave/requests | List leave requests (paginated, filterable, searchable)
[**leaveControllerListTypes**](LeaveApi.md#leavecontrollerlisttypes) | **GET** /api/v1/leave/types | List leave types
[**leaveControllerReject**](LeaveApi.md#leavecontrollerreject) | **POST** /api/v1/leave/requests/{id}/reject | 
[**leaveControllerRemoveType**](LeaveApi.md#leavecontrollerremovetype) | **DELETE** /api/v1/leave/types/{id} | 
[**leaveControllerUpdateType**](LeaveApi.md#leavecontrollerupdatetype) | **PATCH** /api/v1/leave/types/{id} | 


# **leaveControllerApprove**
> leaveControllerApprove(id, decisionDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final id = id_example; // String | 
final decisionDto = DecisionDto(); // DecisionDto | 

try {
    api_instance.leaveControllerApprove(id, decisionDto);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerApprove: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decisionDto** | [**DecisionDto**](DecisionDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveControllerBalances**
> leaveControllerBalances(employeeId)

Leave balances for an employee (current year)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final employeeId = employeeId_example; // String | 

try {
    api_instance.leaveControllerBalances(employeeId);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerBalances: $e\n');
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

# **leaveControllerCancel**
> leaveControllerCancel(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final id = id_example; // String | 

try {
    api_instance.leaveControllerCancel(id);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerCancel: $e\n');
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

# **leaveControllerCreateRequest**
> leaveControllerCreateRequest(createLeaveRequestDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final createLeaveRequestDto = CreateLeaveRequestDto(); // CreateLeaveRequestDto | 

try {
    api_instance.leaveControllerCreateRequest(createLeaveRequestDto);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerCreateRequest: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createLeaveRequestDto** | [**CreateLeaveRequestDto**](CreateLeaveRequestDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveControllerCreateType**
> leaveControllerCreateType(createLeaveTypeDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final createLeaveTypeDto = CreateLeaveTypeDto(); // CreateLeaveTypeDto | 

try {
    api_instance.leaveControllerCreateType(createLeaveTypeDto);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerCreateType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createLeaveTypeDto** | [**CreateLeaveTypeDto**](CreateLeaveTypeDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveControllerListRequests**
> leaveControllerListRequests(search, sort, order, status, leaveTypeId, employeeId, departmentId)

List leave requests (paginated, filterable, searchable)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final status = status_example; // String | 
final leaveTypeId = leaveTypeId_example; // String | 
final employeeId = employeeId_example; // String | 
final departmentId = departmentId_example; // String | 

try {
    api_instance.leaveControllerListRequests(search, sort, order, status, leaveTypeId, employeeId, departmentId);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerListRequests: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **status** | **String**|  | [optional] 
 **leaveTypeId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 
 **departmentId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveControllerListTypes**
> leaveControllerListTypes()

List leave types

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();

try {
    api_instance.leaveControllerListTypes();
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerListTypes: $e\n');
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

# **leaveControllerReject**
> leaveControllerReject(id, decisionDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final id = id_example; // String | 
final decisionDto = DecisionDto(); // DecisionDto | 

try {
    api_instance.leaveControllerReject(id, decisionDto);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerReject: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decisionDto** | [**DecisionDto**](DecisionDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveControllerRemoveType**
> leaveControllerRemoveType(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final id = id_example; // String | 

try {
    api_instance.leaveControllerRemoveType(id);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerRemoveType: $e\n');
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

# **leaveControllerUpdateType**
> leaveControllerUpdateType(id, updateLeaveTypeDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = LeaveApi();
final id = id_example; // String | 
final updateLeaveTypeDto = UpdateLeaveTypeDto(); // UpdateLeaveTypeDto | 

try {
    api_instance.leaveControllerUpdateType(id, updateLeaveTypeDto);
} catch (e) {
    print('Exception when calling LeaveApi->leaveControllerUpdateType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateLeaveTypeDto** | [**UpdateLeaveTypeDto**](UpdateLeaveTypeDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

