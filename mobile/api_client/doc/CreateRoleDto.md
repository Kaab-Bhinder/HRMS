# wms_api_client.model.CreateRoleDto

## Load the model package
```dart
import 'package:wms_api_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** |  | 
**description** | **String** |  | [optional] 
**permissions** | **List<String>** | Permission keys, e.g. [\"employees:read\"] | [optional] [default to const []]
**canAccessWeb** | **bool** | Can users with this role sign in to the web admin app | [optional] 
**canAccessMobile** | **bool** | Can users with this role sign in to the mobile app | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


