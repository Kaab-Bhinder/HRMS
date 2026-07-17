//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

library openapi.api;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:collection/collection.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:meta/meta.dart';

part 'api_client.dart';
part 'api_helper.dart';
part 'api_exception.dart';
part 'auth/authentication.dart';
part 'auth/api_key_auth.dart';
part 'auth/oauth.dart';
part 'auth/http_basic_auth.dart';
part 'auth/http_bearer_auth.dart';

part 'api/analytics_api.dart';
part 'api/attendance_api.dart';
part 'api/attendance_config_api.dart';
part 'api/audit_activity_api.dart';
part 'api/auth_api.dart';
part 'api/biometric_devices_api.dart';
part 'api/custom_fields_api.dart';
part 'api/departments_api.dart';
part 'api/designations_api.dart';
part 'api/employees_api.dart';
part 'api/face_recognition_api.dart';
part 'api/files_documents_api.dart';
part 'api/health_api.dart';
part 'api/leave_api.dart';
part 'api/notifications_api.dart';
part 'api/organization_api.dart';
part 'api/performance_api.dart';
part 'api/permissions_api.dart';
part 'api/reports_api.dart';
part 'api/roles_api.dart';
part 'api/settings_api.dart';
part 'api/tasks_api.dart';
part 'api/users_api.dart';

part 'model/assign_task_dto.dart';
part 'model/bulk_import_dto.dart';
part 'model/create_comment_dto.dart';
part 'model/create_custom_field_dto.dart';
part 'model/create_cycle_dto.dart';
part 'model/create_department_dto.dart';
part 'model/create_device_dto.dart';
part 'model/create_employee_dto.dart';
part 'model/create_goal_dto.dart';
part 'model/create_leave_request_dto.dart';
part 'model/create_leave_type_dto.dart';
part 'model/create_location_dto.dart';
part 'model/create_review_dto.dart';
part 'model/create_role_dto.dart';
part 'model/create_saved_report_dto.dart';
part 'model/create_task_dto.dart';
part 'model/create_user_dto.dart';
part 'model/decision_dto.dart';
part 'model/ingest_dto.dart';
part 'model/login_dto.dart';
part 'model/manual_entry_dto.dart';
part 'model/map_user_dto.dart';
part 'model/option_dto.dart';
part 'model/ping_dto.dart';
part 'model/ping_point_dto.dart';
part 'model/presign_dto.dart';
part 'model/punch_dto.dart';
part 'model/refresh_dto.dart';
part 'model/register_file_dto.dart';
part 'model/regularization_dto.dart';
part 'model/reorder_dto.dart';
part 'model/reset_password_dto.dart';
part 'model/update_custom_field_dto.dart';
part 'model/update_cycle_dto.dart';
part 'model/update_department_dto.dart';
part 'model/update_device_dto.dart';
part 'model/update_employee_dto.dart';
part 'model/update_goal_dto.dart';
part 'model/update_leave_type_dto.dart';
part 'model/update_location_dto.dart';
part 'model/update_organization_dto.dart';
part 'model/update_review_dto.dart';
part 'model/update_role_dto.dart';
part 'model/update_saved_report_dto.dart';
part 'model/update_setting_dto.dart';
part 'model/update_task_dto.dart';
part 'model/update_task_status_dto.dart';
part 'model/update_user_dto.dart';
part 'model/upsert_designation_dto.dart';


/// An [ApiClient] instance that uses the default values obtained from
/// the OpenAPI specification file.
var defaultApiClient = ApiClient();

const _delimiters = {'csv': ',', 'ssv': ' ', 'tsv': '\t', 'pipes': '|'};
const _dateEpochMarker = 'epoch';
const _deepEquality = DeepCollectionEquality();
final _dateFormatter = DateFormat('yyyy-MM-dd');
final _regList = RegExp(r'^List<(.*)>$');
final _regSet = RegExp(r'^Set<(.*)>$');
final _regMap = RegExp(r'^Map<String,(.*)>$');

bool _isEpochMarker(String? pattern) => pattern == _dateEpochMarker || pattern == '/$_dateEpochMarker/';
