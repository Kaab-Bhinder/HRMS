//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateTaskStatusDto {
  /// Returns a new [UpdateTaskStatusDto] instance.
  UpdateTaskStatusDto({
    required this.status,
    this.progress,
  });

  UpdateTaskStatusDtoStatusEnum status;

  /// Minimum value: 0
  /// Maximum value: 100
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? progress;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateTaskStatusDto &&
    other.status == status &&
    other.progress == progress;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (progress == null ? 0 : progress!.hashCode);

  @override
  String toString() => 'UpdateTaskStatusDto[status=$status, progress=$progress]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
    if (this.progress != null) {
      json[r'progress'] = this.progress;
    } else {
      json[r'progress'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateTaskStatusDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateTaskStatusDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "UpdateTaskStatusDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "UpdateTaskStatusDto[status]" has a null value in JSON.');
        return true;
      }());

      return UpdateTaskStatusDto(
        status: UpdateTaskStatusDtoStatusEnum.fromJson(json[r'status'])!,
        progress: num.parse('${json[r'progress']}'),
      );
    }
    return null;
  }

  static List<UpdateTaskStatusDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateTaskStatusDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateTaskStatusDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateTaskStatusDto> mapFromJson(dynamic json) {
    final map = <String, UpdateTaskStatusDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateTaskStatusDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateTaskStatusDto-objects as value to a dart map
  static Map<String, List<UpdateTaskStatusDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateTaskStatusDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateTaskStatusDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
  };
}


class UpdateTaskStatusDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateTaskStatusDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const backlog = UpdateTaskStatusDtoStatusEnum._(r'backlog');
  static const todo = UpdateTaskStatusDtoStatusEnum._(r'todo');
  static const inProgress = UpdateTaskStatusDtoStatusEnum._(r'in_progress');
  static const inReview = UpdateTaskStatusDtoStatusEnum._(r'in_review');
  static const blocked = UpdateTaskStatusDtoStatusEnum._(r'blocked');
  static const done = UpdateTaskStatusDtoStatusEnum._(r'done');
  static const cancelled = UpdateTaskStatusDtoStatusEnum._(r'cancelled');

  /// List of all possible values in this [enum][UpdateTaskStatusDtoStatusEnum].
  static const values = <UpdateTaskStatusDtoStatusEnum>[
    backlog,
    todo,
    inProgress,
    inReview,
    blocked,
    done,
    cancelled,
  ];

  static UpdateTaskStatusDtoStatusEnum? fromJson(dynamic value) => UpdateTaskStatusDtoStatusEnumTypeTransformer().decode(value);

  static List<UpdateTaskStatusDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateTaskStatusDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateTaskStatusDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateTaskStatusDtoStatusEnum] to String,
/// and [decode] dynamic data back to [UpdateTaskStatusDtoStatusEnum].
class UpdateTaskStatusDtoStatusEnumTypeTransformer {
  factory UpdateTaskStatusDtoStatusEnumTypeTransformer() => _instance ??= const UpdateTaskStatusDtoStatusEnumTypeTransformer._();

  const UpdateTaskStatusDtoStatusEnumTypeTransformer._();

  String encode(UpdateTaskStatusDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateTaskStatusDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateTaskStatusDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'backlog': return UpdateTaskStatusDtoStatusEnum.backlog;
        case r'todo': return UpdateTaskStatusDtoStatusEnum.todo;
        case r'in_progress': return UpdateTaskStatusDtoStatusEnum.inProgress;
        case r'in_review': return UpdateTaskStatusDtoStatusEnum.inReview;
        case r'blocked': return UpdateTaskStatusDtoStatusEnum.blocked;
        case r'done': return UpdateTaskStatusDtoStatusEnum.done;
        case r'cancelled': return UpdateTaskStatusDtoStatusEnum.cancelled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateTaskStatusDtoStatusEnumTypeTransformer] instance.
  static UpdateTaskStatusDtoStatusEnumTypeTransformer? _instance;
}


