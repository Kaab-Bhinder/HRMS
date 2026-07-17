//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateTaskDto {
  /// Returns a new [CreateTaskDto] instance.
  CreateTaskDto({
    required this.title,
    this.description,
    this.departmentId,
    this.parentTaskId,
    this.status,
    this.priority,
    this.progress,
    this.startDate,
    this.dueDate,
    this.estimatedHours,
    this.actualHours,
    this.customFields = const {},
  });

  String title;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? description;

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
  String? parentTaskId;

  CreateTaskDtoStatusEnum? status;

  CreateTaskDtoPriorityEnum? priority;

  /// Minimum value: 0
  /// Maximum value: 100
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? progress;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? startDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dueDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? estimatedHours;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? actualHours;

  Map<String, Object> customFields;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateTaskDto &&
    other.title == title &&
    other.description == description &&
    other.departmentId == departmentId &&
    other.parentTaskId == parentTaskId &&
    other.status == status &&
    other.priority == priority &&
    other.progress == progress &&
    other.startDate == startDate &&
    other.dueDate == dueDate &&
    other.estimatedHours == estimatedHours &&
    other.actualHours == actualHours &&
    _deepEquality.equals(other.customFields, customFields);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (title.hashCode) +
    (description == null ? 0 : description!.hashCode) +
    (departmentId == null ? 0 : departmentId!.hashCode) +
    (parentTaskId == null ? 0 : parentTaskId!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (priority == null ? 0 : priority!.hashCode) +
    (progress == null ? 0 : progress!.hashCode) +
    (startDate == null ? 0 : startDate!.hashCode) +
    (dueDate == null ? 0 : dueDate!.hashCode) +
    (estimatedHours == null ? 0 : estimatedHours!.hashCode) +
    (actualHours == null ? 0 : actualHours!.hashCode) +
    (customFields.hashCode);

  @override
  String toString() => 'CreateTaskDto[title=$title, description=$description, departmentId=$departmentId, parentTaskId=$parentTaskId, status=$status, priority=$priority, progress=$progress, startDate=$startDate, dueDate=$dueDate, estimatedHours=$estimatedHours, actualHours=$actualHours, customFields=$customFields]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'title'] = this.title;
    if (this.description != null) {
      json[r'description'] = this.description;
    } else {
      json[r'description'] = null;
    }
    if (this.departmentId != null) {
      json[r'departmentId'] = this.departmentId;
    } else {
      json[r'departmentId'] = null;
    }
    if (this.parentTaskId != null) {
      json[r'parentTaskId'] = this.parentTaskId;
    } else {
      json[r'parentTaskId'] = null;
    }
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    if (this.priority != null) {
      json[r'priority'] = this.priority;
    } else {
      json[r'priority'] = null;
    }
    if (this.progress != null) {
      json[r'progress'] = this.progress;
    } else {
      json[r'progress'] = null;
    }
    if (this.startDate != null) {
      json[r'startDate'] = this.startDate;
    } else {
      json[r'startDate'] = null;
    }
    if (this.dueDate != null) {
      json[r'dueDate'] = this.dueDate;
    } else {
      json[r'dueDate'] = null;
    }
    if (this.estimatedHours != null) {
      json[r'estimatedHours'] = this.estimatedHours;
    } else {
      json[r'estimatedHours'] = null;
    }
    if (this.actualHours != null) {
      json[r'actualHours'] = this.actualHours;
    } else {
      json[r'actualHours'] = null;
    }
      json[r'customFields'] = this.customFields;
    return json;
  }

  /// Returns a new [CreateTaskDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateTaskDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'title'), 'Required key "CreateTaskDto[title]" is missing from JSON.');
        assert(json[r'title'] != null, 'Required key "CreateTaskDto[title]" has a null value in JSON.');
        return true;
      }());

      return CreateTaskDto(
        title: mapValueOfType<String>(json, r'title')!,
        description: mapValueOfType<String>(json, r'description'),
        departmentId: mapValueOfType<String>(json, r'departmentId'),
        parentTaskId: mapValueOfType<String>(json, r'parentTaskId'),
        status: CreateTaskDtoStatusEnum.fromJson(json[r'status']),
        priority: CreateTaskDtoPriorityEnum.fromJson(json[r'priority']),
        progress: num.parse('${json[r'progress']}'),
        startDate: mapValueOfType<String>(json, r'startDate'),
        dueDate: mapValueOfType<String>(json, r'dueDate'),
        estimatedHours: num.parse('${json[r'estimatedHours']}'),
        actualHours: num.parse('${json[r'actualHours']}'),
        customFields: mapCastOfType<String, Object>(json, r'customFields') ?? const {},
      );
    }
    return null;
  }

  static List<CreateTaskDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateTaskDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateTaskDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateTaskDto> mapFromJson(dynamic json) {
    final map = <String, CreateTaskDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateTaskDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateTaskDto-objects as value to a dart map
  static Map<String, List<CreateTaskDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateTaskDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateTaskDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'title',
  };
}


class CreateTaskDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateTaskDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const backlog = CreateTaskDtoStatusEnum._(r'backlog');
  static const todo = CreateTaskDtoStatusEnum._(r'todo');
  static const inProgress = CreateTaskDtoStatusEnum._(r'in_progress');
  static const inReview = CreateTaskDtoStatusEnum._(r'in_review');
  static const blocked = CreateTaskDtoStatusEnum._(r'blocked');
  static const done = CreateTaskDtoStatusEnum._(r'done');
  static const cancelled = CreateTaskDtoStatusEnum._(r'cancelled');

  /// List of all possible values in this [enum][CreateTaskDtoStatusEnum].
  static const values = <CreateTaskDtoStatusEnum>[
    backlog,
    todo,
    inProgress,
    inReview,
    blocked,
    done,
    cancelled,
  ];

  static CreateTaskDtoStatusEnum? fromJson(dynamic value) => CreateTaskDtoStatusEnumTypeTransformer().decode(value);

  static List<CreateTaskDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateTaskDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateTaskDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateTaskDtoStatusEnum] to String,
/// and [decode] dynamic data back to [CreateTaskDtoStatusEnum].
class CreateTaskDtoStatusEnumTypeTransformer {
  factory CreateTaskDtoStatusEnumTypeTransformer() => _instance ??= const CreateTaskDtoStatusEnumTypeTransformer._();

  const CreateTaskDtoStatusEnumTypeTransformer._();

  String encode(CreateTaskDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateTaskDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateTaskDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'backlog': return CreateTaskDtoStatusEnum.backlog;
        case r'todo': return CreateTaskDtoStatusEnum.todo;
        case r'in_progress': return CreateTaskDtoStatusEnum.inProgress;
        case r'in_review': return CreateTaskDtoStatusEnum.inReview;
        case r'blocked': return CreateTaskDtoStatusEnum.blocked;
        case r'done': return CreateTaskDtoStatusEnum.done;
        case r'cancelled': return CreateTaskDtoStatusEnum.cancelled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateTaskDtoStatusEnumTypeTransformer] instance.
  static CreateTaskDtoStatusEnumTypeTransformer? _instance;
}



class CreateTaskDtoPriorityEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateTaskDtoPriorityEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const low = CreateTaskDtoPriorityEnum._(r'low');
  static const medium = CreateTaskDtoPriorityEnum._(r'medium');
  static const high = CreateTaskDtoPriorityEnum._(r'high');
  static const urgent = CreateTaskDtoPriorityEnum._(r'urgent');

  /// List of all possible values in this [enum][CreateTaskDtoPriorityEnum].
  static const values = <CreateTaskDtoPriorityEnum>[
    low,
    medium,
    high,
    urgent,
  ];

  static CreateTaskDtoPriorityEnum? fromJson(dynamic value) => CreateTaskDtoPriorityEnumTypeTransformer().decode(value);

  static List<CreateTaskDtoPriorityEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateTaskDtoPriorityEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateTaskDtoPriorityEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateTaskDtoPriorityEnum] to String,
/// and [decode] dynamic data back to [CreateTaskDtoPriorityEnum].
class CreateTaskDtoPriorityEnumTypeTransformer {
  factory CreateTaskDtoPriorityEnumTypeTransformer() => _instance ??= const CreateTaskDtoPriorityEnumTypeTransformer._();

  const CreateTaskDtoPriorityEnumTypeTransformer._();

  String encode(CreateTaskDtoPriorityEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateTaskDtoPriorityEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateTaskDtoPriorityEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'low': return CreateTaskDtoPriorityEnum.low;
        case r'medium': return CreateTaskDtoPriorityEnum.medium;
        case r'high': return CreateTaskDtoPriorityEnum.high;
        case r'urgent': return CreateTaskDtoPriorityEnum.urgent;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateTaskDtoPriorityEnumTypeTransformer] instance.
  static CreateTaskDtoPriorityEnumTypeTransformer? _instance;
}


