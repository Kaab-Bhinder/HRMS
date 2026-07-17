# wms_api_client.api.PerformanceApi

## Load the API package
```dart
import 'package:wms_api_client/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**performanceControllerCreateCycle**](PerformanceApi.md#performancecontrollercreatecycle) | **POST** /api/v1/performance/cycles | 
[**performanceControllerCreateGoal**](PerformanceApi.md#performancecontrollercreategoal) | **POST** /api/v1/performance/goals | 
[**performanceControllerCreateReview**](PerformanceApi.md#performancecontrollercreatereview) | **POST** /api/v1/performance/reviews | 
[**performanceControllerGetReview**](PerformanceApi.md#performancecontrollergetreview) | **GET** /api/v1/performance/reviews/{id} | 
[**performanceControllerListCycles**](PerformanceApi.md#performancecontrollerlistcycles) | **GET** /api/v1/performance/cycles | List review cycles
[**performanceControllerListGoals**](PerformanceApi.md#performancecontrollerlistgoals) | **GET** /api/v1/performance/goals | List goals (filterable by status and employee)
[**performanceControllerListReviews**](PerformanceApi.md#performancecontrollerlistreviews) | **GET** /api/v1/performance/reviews | List performance reviews (paginated, filterable, searchable by employee name)
[**performanceControllerRemoveGoal**](PerformanceApi.md#performancecontrollerremovegoal) | **DELETE** /api/v1/performance/goals/{id} | 
[**performanceControllerRemoveReview**](PerformanceApi.md#performancecontrollerremovereview) | **DELETE** /api/v1/performance/reviews/{id} | 
[**performanceControllerUpdateCycle**](PerformanceApi.md#performancecontrollerupdatecycle) | **PATCH** /api/v1/performance/cycles/{id} | 
[**performanceControllerUpdateGoal**](PerformanceApi.md#performancecontrollerupdategoal) | **PATCH** /api/v1/performance/goals/{id} | 
[**performanceControllerUpdateReview**](PerformanceApi.md#performancecontrollerupdatereview) | **PATCH** /api/v1/performance/reviews/{id} | 


# **performanceControllerCreateCycle**
> performanceControllerCreateCycle(createCycleDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final createCycleDto = CreateCycleDto(); // CreateCycleDto | 

try {
    api_instance.performanceControllerCreateCycle(createCycleDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerCreateCycle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createCycleDto** | [**CreateCycleDto**](CreateCycleDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerCreateGoal**
> performanceControllerCreateGoal(createGoalDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final createGoalDto = CreateGoalDto(); // CreateGoalDto | 

try {
    api_instance.performanceControllerCreateGoal(createGoalDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerCreateGoal: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createGoalDto** | [**CreateGoalDto**](CreateGoalDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerCreateReview**
> performanceControllerCreateReview(createReviewDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final createReviewDto = CreateReviewDto(); // CreateReviewDto | 

try {
    api_instance.performanceControllerCreateReview(createReviewDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerCreateReview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createReviewDto** | [**CreateReviewDto**](CreateReviewDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerGetReview**
> performanceControllerGetReview(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 

try {
    api_instance.performanceControllerGetReview(id);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerGetReview: $e\n');
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

# **performanceControllerListCycles**
> performanceControllerListCycles()

List review cycles

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();

try {
    api_instance.performanceControllerListCycles();
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerListCycles: $e\n');
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

# **performanceControllerListGoals**
> performanceControllerListGoals(status, employeeId)

List goals (filterable by status and employee)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final status = status_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.performanceControllerListGoals(status, employeeId);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerListGoals: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerListReviews**
> performanceControllerListReviews(search, sort, order, status, cycleId, employeeId)

List performance reviews (paginated, filterable, searchable by employee name)

### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final search = search_example; // String | 
final sort = sort_example; // String | 
final order = order_example; // String | 
final status = status_example; // String | 
final cycleId = cycleId_example; // String | 
final employeeId = employeeId_example; // String | 

try {
    api_instance.performanceControllerListReviews(search, sort, order, status, cycleId, employeeId);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerListReviews: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **String**|  | [optional] 
 **sort** | **String**|  | [optional] 
 **order** | **String**|  | [optional] [default to 'desc']
 **status** | **String**|  | [optional] 
 **cycleId** | **String**|  | [optional] 
 **employeeId** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerRemoveGoal**
> performanceControllerRemoveGoal(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 

try {
    api_instance.performanceControllerRemoveGoal(id);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerRemoveGoal: $e\n');
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

# **performanceControllerRemoveReview**
> performanceControllerRemoveReview(id)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 

try {
    api_instance.performanceControllerRemoveReview(id);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerRemoveReview: $e\n');
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

# **performanceControllerUpdateCycle**
> performanceControllerUpdateCycle(id, updateCycleDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 
final updateCycleDto = UpdateCycleDto(); // UpdateCycleDto | 

try {
    api_instance.performanceControllerUpdateCycle(id, updateCycleDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerUpdateCycle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateCycleDto** | [**UpdateCycleDto**](UpdateCycleDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerUpdateGoal**
> performanceControllerUpdateGoal(id, updateGoalDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 
final updateGoalDto = UpdateGoalDto(); // UpdateGoalDto | 

try {
    api_instance.performanceControllerUpdateGoal(id, updateGoalDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerUpdateGoal: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateGoalDto** | [**UpdateGoalDto**](UpdateGoalDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **performanceControllerUpdateReview**
> performanceControllerUpdateReview(id, updateReviewDto)



### Example
```dart
import 'package:wms_api_client/api.dart';
// TODO Configure HTTP Bearer authorization: bearer
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('bearer').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PerformanceApi();
final id = id_example; // String | 
final updateReviewDto = UpdateReviewDto(); // UpdateReviewDto | 

try {
    api_instance.performanceControllerUpdateReview(id, updateReviewDto);
} catch (e) {
    print('Exception when calling PerformanceApi->performanceControllerUpdateReview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateReviewDto** | [**UpdateReviewDto**](UpdateReviewDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

