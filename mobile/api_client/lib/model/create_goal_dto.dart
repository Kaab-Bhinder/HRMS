//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateGoalDto {
  /// Returns a new [CreateGoalDto] instance.
  CreateGoalDto({
    required this.title,
    this.employeeId,
    this.departmentId,
    this.metric,
    this.targetValue,
    this.currentValue,
    this.weight,
    this.status,
    this.dueDate,
  });

  String title;

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

  CreateGoalDtoStatusEnum? status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dueDate;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateGoalDto &&
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
    (title.hashCode) +
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (departmentId == null ? 0 : departmentId!.hashCode) +
    (metric == null ? 0 : metric!.hashCode) +
    (targetValue == null ? 0 : targetValue!.hashCode) +
    (currentValue == null ? 0 : currentValue!.hashCode) +
    (weight == null ? 0 : weight!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (dueDate == null ? 0 : dueDate!.hashCode);

  @override
  String toString() => 'CreateGoalDto[title=$title, employeeId=$employeeId, departmentId=$departmentId, metric=$metric, targetValue=$targetValue, currentValue=$currentValue, weight=$weight, status=$status, dueDate=$dueDate]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'title'] = this.title;
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

  /// Returns a new [CreateGoalDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateGoalDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'title'), 'Required key "CreateGoalDto[title]" is missing from JSON.');
        assert(json[r'title'] != null, 'Required key "CreateGoalDto[title]" has a null value in JSON.');
        return true;
      }());

      return CreateGoalDto(
        title: mapValueOfType<String>(json, r'title')!,
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        departmentId: mapValueOfType<String>(json, r'departmentId'),
        metric: mapValueOfType<String>(json, r'metric'),
        targetValue: num.parse('${json[r'targetValue']}'),
        currentValue: num.parse('${json[r'currentValue']}'),
        weight: num.parse('${json[r'weight']}'),
        status: CreateGoalDtoStatusEnum.fromJson(json[r'status']),
        dueDate: mapValueOfType<String>(json, r'dueDate'),
      );
    }
    return null;
  }

  static List<CreateGoalDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateGoalDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateGoalDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateGoalDto> mapFromJson(dynamic json) {
    final map = <String, CreateGoalDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateGoalDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateGoalDto-objects as value to a dart map
  static Map<String, List<CreateGoalDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateGoalDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateGoalDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'title',
  };
}


class CreateGoalDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateGoalDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const notStarted = CreateGoalDtoStatusEnum._(r'not_started');
  static const onTrack = CreateGoalDtoStatusEnum._(r'on_track');
  static const atRisk = CreateGoalDtoStatusEnum._(r'at_risk');
  static const offTrack = CreateGoalDtoStatusEnum._(r'off_track');
  static const completed = CreateGoalDtoStatusEnum._(r'completed');
  static const cancelled = CreateGoalDtoStatusEnum._(r'cancelled');

  /// List of all possible values in this [enum][CreateGoalDtoStatusEnum].
  static const values = <CreateGoalDtoStatusEnum>[
    notStarted,
    onTrack,
    atRisk,
    offTrack,
    completed,
    cancelled,
  ];

  static CreateGoalDtoStatusEnum? fromJson(dynamic value) => CreateGoalDtoStatusEnumTypeTransformer().decode(value);

  static List<CreateGoalDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateGoalDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateGoalDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateGoalDtoStatusEnum] to String,
/// and [decode] dynamic data back to [CreateGoalDtoStatusEnum].
class CreateGoalDtoStatusEnumTypeTransformer {
  factory CreateGoalDtoStatusEnumTypeTransformer() => _instance ??= const CreateGoalDtoStatusEnumTypeTransformer._();

  const CreateGoalDtoStatusEnumTypeTransformer._();

  String encode(CreateGoalDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateGoalDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateGoalDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'not_started': return CreateGoalDtoStatusEnum.notStarted;
        case r'on_track': return CreateGoalDtoStatusEnum.onTrack;
        case r'at_risk': return CreateGoalDtoStatusEnum.atRisk;
        case r'off_track': return CreateGoalDtoStatusEnum.offTrack;
        case r'completed': return CreateGoalDtoStatusEnum.completed;
        case r'cancelled': return CreateGoalDtoStatusEnum.cancelled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateGoalDtoStatusEnumTypeTransformer] instance.
  static CreateGoalDtoStatusEnumTypeTransformer? _instance;
}


