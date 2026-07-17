//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateSavedReportDto {
  /// Returns a new [UpdateSavedReportDto] instance.
  UpdateSavedReportDto({
    this.name,
    this.module,
    this.definition = const {},
    this.scheduleCron,
    this.recipients = const [],
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  UpdateSavedReportDtoModuleEnum? module;

  Map<String, Object> definition;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? scheduleCron;

  List<String> recipients;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateSavedReportDto &&
    other.name == name &&
    other.module == module &&
    _deepEquality.equals(other.definition, definition) &&
    other.scheduleCron == scheduleCron &&
    _deepEquality.equals(other.recipients, recipients);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (module == null ? 0 : module!.hashCode) +
    (definition.hashCode) +
    (scheduleCron == null ? 0 : scheduleCron!.hashCode) +
    (recipients.hashCode);

  @override
  String toString() => 'UpdateSavedReportDto[name=$name, module=$module, definition=$definition, scheduleCron=$scheduleCron, recipients=$recipients]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.module != null) {
      json[r'module'] = this.module;
    } else {
      json[r'module'] = null;
    }
      json[r'definition'] = this.definition;
    if (this.scheduleCron != null) {
      json[r'scheduleCron'] = this.scheduleCron;
    } else {
      json[r'scheduleCron'] = null;
    }
      json[r'recipients'] = this.recipients;
    return json;
  }

  /// Returns a new [UpdateSavedReportDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateSavedReportDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateSavedReportDto(
        name: mapValueOfType<String>(json, r'name'),
        module: UpdateSavedReportDtoModuleEnum.fromJson(json[r'module']),
        definition: mapCastOfType<String, Object>(json, r'definition') ?? const {},
        scheduleCron: mapValueOfType<String>(json, r'scheduleCron'),
        recipients: json[r'recipients'] is Iterable
            ? (json[r'recipients'] as Iterable).cast<String>().toList(growable: false)
            : const [],
      );
    }
    return null;
  }

  static List<UpdateSavedReportDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateSavedReportDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateSavedReportDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateSavedReportDto> mapFromJson(dynamic json) {
    final map = <String, UpdateSavedReportDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateSavedReportDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateSavedReportDto-objects as value to a dart map
  static Map<String, List<UpdateSavedReportDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateSavedReportDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateSavedReportDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateSavedReportDtoModuleEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateSavedReportDtoModuleEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employees = UpdateSavedReportDtoModuleEnum._(r'employees');
  static const attendance = UpdateSavedReportDtoModuleEnum._(r'attendance');
  static const leave = UpdateSavedReportDtoModuleEnum._(r'leave');

  /// List of all possible values in this [enum][UpdateSavedReportDtoModuleEnum].
  static const values = <UpdateSavedReportDtoModuleEnum>[
    employees,
    attendance,
    leave,
  ];

  static UpdateSavedReportDtoModuleEnum? fromJson(dynamic value) => UpdateSavedReportDtoModuleEnumTypeTransformer().decode(value);

  static List<UpdateSavedReportDtoModuleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateSavedReportDtoModuleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateSavedReportDtoModuleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateSavedReportDtoModuleEnum] to String,
/// and [decode] dynamic data back to [UpdateSavedReportDtoModuleEnum].
class UpdateSavedReportDtoModuleEnumTypeTransformer {
  factory UpdateSavedReportDtoModuleEnumTypeTransformer() => _instance ??= const UpdateSavedReportDtoModuleEnumTypeTransformer._();

  const UpdateSavedReportDtoModuleEnumTypeTransformer._();

  String encode(UpdateSavedReportDtoModuleEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateSavedReportDtoModuleEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateSavedReportDtoModuleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employees': return UpdateSavedReportDtoModuleEnum.employees;
        case r'attendance': return UpdateSavedReportDtoModuleEnum.attendance;
        case r'leave': return UpdateSavedReportDtoModuleEnum.leave;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateSavedReportDtoModuleEnumTypeTransformer] instance.
  static UpdateSavedReportDtoModuleEnumTypeTransformer? _instance;
}


