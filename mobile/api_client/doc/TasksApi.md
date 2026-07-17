# wms_api_client.api.TasksApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tasksControllerActivity**](TasksApi.md#taskscontrolleractivity) | **GET** /api/v1/tasks/{id}/activity | 
[**tasksControllerAddComment**](TasksApi.md#taskscontrolleraddcomment) | **POST** /api/v1/tasks/{id}/comments | 
[**tasksControllerAssign**](TasksApi.md#taskscontrollerassign) | **POST** /api/v1/tasks/{id}/assign | 
[**tasksControllerBoard**](TasksApi.md#taskscontrollerboard) | **GET** /api/v1/tasks/board | All non-deleted tasks (frontend groups by status)
[**tasksControllerCreate**](TasksApi.md#taskscontrollercreate) | **POST** /api/v1/tasks | 
[**tasksControllerGet**](TasksApi.md#taskscontrollerget) | **GET** /api/v1/tasks/{id} | 
[**tasksControllerList**](TasksApi.md#taskscontrollerlist) | **GET** /api/v1/tasks | List tasks (paginated, filterable, searchable)
[**tasksControllerListComments**](TasksApi.md#taskscontrollerlistcomments) | **GET** /api/v1/tasks/{id}/comments | 
[**tasksControllerRemove**](TasksApi.md#taskscontrollerremove) | **DELETE** /api/v1/tasks/{id} | 
[**tasksControllerStats**](TasksApi.md#taskscontrollerstats) | **GET** /api/v1/tasks/stats | Task counts per status + total
[**tasksControllerUnassign**](TasksApi.md#taskscontrollerunassign) | **DELETE** /api/v1/tasks/{id}/assign/{employeeId} | 
[**tasksControllerUpdate**](TasksApi.md#taskscontrollerupdate) | **PATCH** /api/v1/tasks/{id} | 
[**tasksControllerUpdateStatus**](TasksApi.md#taskscontrollerupdatestatus) | **PATCH** /api/v1/tasks/{id}/status | Update task status (assignee mark-complete for mobile; admins update any)


# **tasksControllerActivity**
> tasksControllerActivity(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 

try {
    api_instance.tasksControllerActivity(id);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerActivity: $e\n');
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

# **tasksControllerAddComment**
> tasksControllerAddComment(id, createCommentDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 
final createCommentDto = CreateCommentDto(); // CreateCommentDto | 

try {
    api_instance.tasksControllerAddComment(id, createCommentDto);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerAddComment: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **createCommentDto** | [**CreateCommentDto**](CreateCommentDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerAssign**
> tasksControllerAssign(id, assignTaskDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 
final assignTaskDto = AssignTaskDto(); // AssignTaskDto | 

try {
    api_instance.tasksControllerAssign(id, assignTaskDto);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerAssign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **assignTaskDto** | [**AssignTaskDto**](AssignTaskDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerBoard**
> tasksControllerBoard()

All non-deleted tasks (frontend groups by status)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();

try {
    api_instance.tasksControllerBoard();
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerBoard: $e\n');
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

# **tasksControllerCreate**
> tasksControllerCreate(createTaskDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final createTaskDto = CreateTaskDto(); // CreateTaskDto | 

try {
    api_instance.tasksControllerCreate(createTaskDto);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createTaskDto** | [**CreateTaskDto**](CreateTaskDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerGet**
> tasksControllerGet(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 

try {
    api_instance.tasksControllerGet(id);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerGet: $e\n');
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

# **tasksControllerList**
> tasksControllerList(search, sort, order, status, priority, departmentId, assigneeId)

List tasks (paginated, filterable, searchable)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final status = status_example; // String | 
final priority = priority_example; // String | 
final departmentId = departmentId_example; // String | 
final assigneeId = assigneeId_example; // String | 

try {
    api_instance.tasksControllerList(search, sort, order, status, priority, departmentId, assigneeId);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **status** | **String**|  | [optional] 
 **priority** | **String**|  | [optional] 
 **departmentId** | **String**|  | [optional] 
 **assigneeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerListComments**
> tasksControllerListComments(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 

try {
    api_instance.tasksControllerListComments(id);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerListComments: $e\n');
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

# **tasksControllerRemove**
> tasksControllerRemove(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 

try {
    api_instance.tasksControllerRemove(id);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerRemove: $e\n');
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

# **tasksControllerStats**
> tasksControllerStats()

Task counts per status + total

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();

try {
    api_instance.tasksControllerStats();
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerStats: $e\n');
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

# **tasksControllerUnassign**
> tasksControllerUnassign(id, employeeId)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.tasksControllerUnassign(id, employeeId);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerUnassign: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **employeeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerUpdate**
> tasksControllerUpdate(id, updateTaskDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 
final updateTaskDto = UpdateTaskDto(); // UpdateTaskDto | 

try {
    api_instance.tasksControllerUpdate(id, updateTaskDto);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateTaskDto** | [**UpdateTaskDto**](UpdateTaskDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksControllerUpdateStatus**
> tasksControllerUpdateStatus(id, updateTaskStatusDto)

Update task status (assignee mark-complete for mobile; admins update any)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = TasksApi();
final id = id_example; // String | 
final updateTaskStatusDto = UpdateTaskStatusDto(); // UpdateTaskStatusDto | 

try {
    api_instance.tasksControllerUpdateStatus(id, updateTaskStatusDto);
} catch (e) {
    print('Exception when calling TasksApi->tasksControllerUpdateStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateTaskStatusDto** | [**UpdateTaskStatusDto**](UpdateTaskStatusDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

