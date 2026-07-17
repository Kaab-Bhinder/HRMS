//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateGoalDto {
  /// Returns a new [UpdateGoalDto] instance.
  UpdateGoalDto({
    this.title,
    this.employeeId,
    this.departmentId,
    this.metric,
    this.targetValue,
    this.currentValue,
    this.weight,
    this.status,
    this.dueDate,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? title;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? employeeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? departmentId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? metric;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? targetValue;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? currentValue;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? weight;

  UpdateGoalDtoStatusEnum? status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dueDate;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateGoalDto &&
    other.title == title &&
    other.employeeId == employeeId &&
    other.departmentId == departmentId &&
    other.metric == metric &&
    other.targetValue == targetValue &&
    other.currentValue == currentValue &&
    other.weight == weight &&
    other.status == status &&
    other.dueDate == dueDate;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (title == null ? 0 : title!.hashCode) +
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (departmentId == null ? 0 : departmentId!.hashCode) +
    (metric == null ? 0 : metric!.hashCode) +
    (targetValue == null ? 0 : targetValue!.hashCode) +
    (currentValue == null ? 0 : currentValue!.hashCode) +
    (weight == null ? 0 : weight!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (dueDate == null ? 0 : dueDate!.hashCode);

  @override
  String toString() => 'UpdateGoalDto[title=$title, employeeId=$employeeId, departmentId=$departmentId, metric=$metric, targetValue=$targetValue, currentValue=$currentValue, weight=$weight, status=$status, dueDate=$dueDate]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.title != null) {
      json[r'title'] = this.title;
    } else {
      json[r'title'] = null;
    }
    if (this.employeeId != null) {
      json[r'employeeId'] = this.employeeId;
    } else {
      json[r'employeeId'] = null;
    }
    if (this.departmentId != null) {
      json[r'departmentId'] = this.departmentId;
    } else {
      json[r'departmentId'] = null;
    }
    if (this.metric != null) {
      json[r'metric'] = this.metric;
    } else {
      json[r'metric'] = null;
    }
    if (this.targetValue != null) {
      json[r'targetValue'] = this.targetValue;
    } else {
      json[r'targetValue'] = null;
    }
    if (this.currentValue != null) {
      json[r'currentValue'] = this.currentValue;
    } else {
      json[r'currentValue'] = null;
    }
    if (this.weight != null) {
      json[r'weight'] = this.weight;
    } else {
      json[r'weight'] = null;
    }
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    if (this.dueDate != null) {
      json[r'dueDate'] = this.dueDate;
    } else {
      json[r'dueDate'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateGoalDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateGoalDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateGoalDto(
        title: mapValueOfType<String>(json, r'title'),
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        departmentId: mapValueOfType<String>(json, r'departmentId'),
        metric: mapValueOfType<String>(json, r'metric'),
        targetValue: num.parse('${json[r'targetValue']}'),
        currentValue: num.parse('${json[r'currentValue']}'),
        weight: num.parse('${json[r'weight']}'),
        status: UpdateGoalDtoStatusEnum.fromJson(json[r'status']),
        dueDate: mapValueOfType<String>(json, r'dueDate'),
      );
    }
    return null;
  }

  static List<UpdateGoalDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateGoalDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateGoalDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateGoalDto> mapFromJson(dynamic json) {
    final map = <String, UpdateGoalDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateGoalDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateGoalDto-objects as value to a dart map
  static Map<String, List<UpdateGoalDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateGoalDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateGoalDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateGoalDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateGoalDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const notStarted = UpdateGoalDtoStatusEnum._(r'not_started');
  static const onTrack = UpdateGoalDtoStatusEnum._(r'on_track');
  static const atRisk = UpdateGoalDtoStatusEnum._(r'at_risk');
  static const offTrack = UpdateGoalDtoStatusEnum._(r'off_track');
  static const completed = UpdateGoalDtoStatusEnum._(r'completed');
  static const cancelled = UpdateGoalDtoStatusEnum._(r'cancelled');

  /// List of all possible values in this [enum][UpdateGoalDtoStatusEnum].
  static const values = <UpdateGoalDtoStatusEnum>[
    notStarted,
    onTrack,
    atRisk,
    offTrack,
    completed,
    cancelled,
  ];

  static UpdateGoalDtoStatusEnum? fromJson(dynamic value) => UpdateGoalDtoStatusEnumTypeTransformer().decode(value);

  static List<UpdateGoalDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateGoalDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateGoalDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateGoalDtoStatusEnum] to String,
/// and [decode] dynamic data back to [UpdateGoalDtoStatusEnum].
class UpdateGoalDtoStatusEnumTypeTransformer {
  factory UpdateGoalDtoStatusEnumTypeTransformer() => _instance ??= const UpdateGoalDtoStatusEnumTypeTransformer._();

  const UpdateGoalDtoStatusEnumTypeTransformer._();

  String encode(UpdateGoalDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateGoalDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateGoalDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'not_started': return UpdateGoalDtoStatusEnum.notStarted;
        case r'on_track': return UpdateGoalDtoStatusEnum.onTrack;
        case r'at_risk': return UpdateGoalDtoStatusEnum.atRisk;
        case r'off_track': return UpdateGoalDtoStatusEnum.offTrack;
        case r'completed': return UpdateGoalDtoStatusEnum.completed;
        case r'cancelled': return UpdateGoalDtoStatusEnum.cancelled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateGoalDtoStatusEnumTypeTransformer] instance.
  static UpdateGoalDtoStatusEnumTypeTransformer? _instance;
}


