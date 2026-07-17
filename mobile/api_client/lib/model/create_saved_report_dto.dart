//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateSavedReportDto {
  /// Returns a new [CreateSavedReportDto] instance.
  CreateSavedReportDto({
    required this.name,
    required this.module,
    this.definition = const {},
    this.scheduleCron,
    this.recipients = const [],
  });

  String name;

  CreateSavedReportDtoModuleEnum module;

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
  bool operator ==(Object other) => identical(this, other) || other is CreateSavedReportDto &&
    other.name == name &&
    other.module == module &&
    _deepEquality.equals(other.definition, definition) &&
    other.scheduleCron == scheduleCron &&
    _deepEquality.equals(other.recipients, recipients);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name.hashCode) +
    (module.hashCode) +
    (definition.hashCode) +
    (scheduleCron == null ? 0 : scheduleCron!.hashCode) +
    (recipients.hashCode);

  @override
  String toString() => 'CreateSavedReportDto[name=$name, module=$module, definition=$definition, scheduleCron=$scheduleCron, recipients=$recipients]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'name'] = this.name;
      json[r'module'] = this.module;
      json[r'definition'] = this.definition;
    if (this.scheduleCron != null) {
      json[r'scheduleCron'] = this.scheduleCron;
    } else {
      json[r'scheduleCron'] = null;
    }
      json[r'recipients'] = this.recipients;
    return json;
  }

  /// Returns a new [CreateSavedReportDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateSavedReportDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'name'), 'Required key "CreateSavedReportDto[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "CreateSavedReportDto[name]" has a null value in JSON.');
        assert(json.containsKey(r'module'), 'Required key "CreateSavedReportDto[module]" is missing from JSON.');
        assert(json[r'module'] != null, 'Required key "CreateSavedReportDto[module]" has a null value in JSON.');
        assert(json.containsKey(r'definition'), 'Required key "CreateSavedReportDto[definition]" is missing from JSON.');
        assert(json[r'definition'] != null, 'Required key "CreateSavedReportDto[definition]" has a null value in JSON.');
        return true;
      }());

      return CreateSavedReportDto(
        name: mapValueOfType<String>(json, r'name')!,
        module: CreateSavedReportDtoModuleEnum.fromJson(json[r'module'])!,
        definition: mapCastOfType<String, Object>(json, r'definition')!,
        scheduleCron: mapValueOfType<String>(json, r'scheduleCron'),
        recipients: json[r'recipients'] is Iterable
            ? (json[r'recipients'] as Iterable).cast<String>().toList(growable: false)
            : const [],
      );
    }
    return null;
  }

  static List<CreateSavedReportDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateSavedReportDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateSavedReportDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateSavedReportDto> mapFromJson(dynamic json) {
    final map = <String, CreateSavedReportDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateSavedReportDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateSavedReportDto-objects as value to a dart map
  static Map<String, List<CreateSavedReportDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateSavedReportDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateSavedReportDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'name',
    'module',
    'definition',
  };
}


class CreateSavedReportDtoModuleEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateSavedReportDtoModuleEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employees = CreateSavedReportDtoModuleEnum._(r'employees');
  static const attendance = CreateSavedReportDtoModuleEnum._(r'attendance');
  static const leave = CreateSavedReportDtoModuleEnum._(r'leave');

  /// List of all possible values in this [enum][CreateSavedReportDtoModuleEnum].
  static const values = <CreateSavedReportDtoModuleEnum>[
    employees,
    attendance,
    leave,
  ];

  static CreateSavedReportDtoModuleEnum? fromJson(dynamic value) => CreateSavedReportDtoModuleEnumTypeTransformer().decode(value);

  static List<CreateSavedReportDtoModuleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateSavedReportDtoModuleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateSavedReportDtoModuleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateSavedReportDtoModuleEnum] to String,
/// and [decode] dynamic data back to [CreateSavedReportDtoModuleEnum].
class CreateSavedReportDtoModuleEnumTypeTransformer {
  factory CreateSavedReportDtoModuleEnumTypeTransformer() => _instance ??= const CreateSavedReportDtoModuleEnumTypeTransformer._();

  const CreateSavedReportDtoModuleEnumTypeTransformer._();

  String encode(CreateSavedReportDtoModuleEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateSavedReportDtoModuleEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateSavedReportDtoModuleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employees': return CreateSavedReportDtoModuleEnum.employees;
        case r'attendance': return CreateSavedReportDtoModuleEnum.attendance;
        case r'leave': return CreateSavedReportDtoModuleEnum.leave;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateSavedReportDtoModuleEnumTypeTransformer] instance.
  static CreateSavedReportDtoModuleEnumTypeTransformer? _instance;
}


