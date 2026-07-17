# wms_api_client.model.CreateEmployeeDto

## Load the model package
```dart
import 'package:wms_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**firstName** | **String** |  | 
**lastName** | **String** |  | 
**employeeCode** | **String** |  | [optional] 
**workEmail** | **String** |  | [optional] 
**personalEmail** | **String** |  | [optional] 
**phone** | **String** |  | [optional] 
**gender** | **String** |  | [optional] 
**dateOfBirth** | **String** |  | [optional] 
**departmentId** | **String** |  | [optional] 
**designationId** | **String** |  | [optional] 
**locationId** | **String** |  | [optional] 
**managerId** | **String** |  | [optional] 
**employmentType** | **String** |  | [optional] 
**status** | **String** |  | [optional] 
**dateOfJoining** | **String** |  | [optional] 
**customFields** | **Map<String, Object>** |  | [optional] [default to const {}]
**createAccount** | **bool** | Create a linked login account (default true). | [optional] [default to true]
**accountRoleId** | **String** | Role for the login account. Defaults to the \"Employee\" role. | [optional] 
**accountPasswordStrategy** | **String** | \"generate\" returns a one-time password; \"invite\" creates the account as invited. | [optional] [default to 'generate']

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


