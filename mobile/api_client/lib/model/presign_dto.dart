//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PresignDto {
  /// Returns a new [PresignDto] instance.
  PresignDto({
    required this.fileName,
    required this.mimeType,
    required this.ownerType,
    required this.ownerId,
  });

  String fileName;

  String mimeType;

  PresignDtoOwnerTypeEnum ownerType;

  String ownerId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PresignDto &&
    other.fileName == fileName &&
    other.mimeType == mimeType &&
    other.ownerType == ownerType &&
    other.ownerId == ownerId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (fileName.hashCode) +
    (mimeType.hashCode) +
    (ownerType.hashCode) +
    (ownerId.hashCode);

  @override
  String toString() => 'PresignDto[fileName=$fileName, mimeType=$mimeType, ownerType=$ownerType, ownerId=$ownerId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'fileName'] = this.fileName;
      json[r'mimeType'] = this.mimeType;
      json[r'ownerType'] = this.ownerType;
      json[r'ownerId'] = this.ownerId;
    return json;
  }

  /// Returns a new [PresignDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PresignDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'fileName'), 'Required key "PresignDto[fileName]" is missing from JSON.');
        assert(json[r'fileName'] != null, 'Required key "PresignDto[fileName]" has a null value in JSON.');
        assert(json.containsKey(r'mimeType'), 'Required key "PresignDto[mimeType]" is missing from JSON.');
        assert(json[r'mimeType'] != null, 'Required key "PresignDto[mimeType]" has a null value in JSON.');
        assert(json.containsKey(r'ownerType'), 'Required key "PresignDto[ownerType]" is missing from JSON.');
        assert(json[r'ownerType'] != null, 'Required key "PresignDto[ownerType]" has a null value in JSON.');
        assert(json.containsKey(r'ownerId'), 'Required key "PresignDto[ownerId]" is missing from JSON.');
        assert(json[r'ownerId'] != null, 'Required key "PresignDto[ownerId]" has a null value in JSON.');
        return true;
      }());

      return PresignDto(
        fileName: mapValueOfType<String>(json, r'fileName')!,
        mimeType: mapValueOfType<String>(json, r'mimeType')!,
        ownerType: PresignDtoOwnerTypeEnum.fromJson(json[r'ownerType'])!,
        ownerId: mapValueOfType<String>(json, r'ownerId')!,
      );
    }
    return null;
  }

  static List<PresignDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PresignDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PresignDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PresignDto> mapFromJson(dynamic json) {
    final map = <String, PresignDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PresignDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PresignDto-objects as value to a dart map
  static Map<String, List<PresignDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PresignDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PresignDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'fileName',
    'mimeType',
    'ownerType',
    'ownerId',
  };
}


class PresignDtoOwnerTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const PresignDtoOwnerTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employee = PresignDtoOwnerTypeEnum._(r'employee');
  static const department = PresignDtoOwnerTypeEnum._(r'department');
  static const task = PresignDtoOwnerTypeEnum._(r'task');
  static const document = PresignDtoOwnerTypeEnum._(r'document');
  static const organization = PresignDtoOwnerTypeEnum._(r'organization');

  /// List of all possible values in this [enum][PresignDtoOwnerTypeEnum].
  static const values = <PresignDtoOwnerTypeEnum>[
    employee,
    department,
    task,
    document,
    organization,
  ];

  static PresignDtoOwnerTypeEnum? fromJson(dynamic value) => PresignDtoOwnerTypeEnumTypeTransformer().decode(value);

  static List<PresignDtoOwnerTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PresignDtoOwnerTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PresignDtoOwnerTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [PresignDtoOwnerTypeEnum] to String,
/// and [decode] dynamic data back to [PresignDtoOwnerTypeEnum].
class PresignDtoOwnerTypeEnumTypeTransformer {
  factory PresignDtoOwnerTypeEnumTypeTransformer() => _instance ??= const PresignDtoOwnerTypeEnumTypeTransformer._();

  const PresignDtoOwnerTypeEnumTypeTransformer._();

  String encode(PresignDtoOwnerTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a PresignDtoOwnerTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  PresignDtoOwnerTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employee': return PresignDtoOwnerTypeEnum.employee;
        case r'department': return PresignDtoOwnerTypeEnum.department;
        case r'task': return PresignDtoOwnerTypeEnum.task;
        case r'document': return PresignDtoOwnerTypeEnum.document;
        case r'organization': return PresignDtoOwnerTypeEnum.organization;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [PresignDtoOwnerTypeEnumTypeTransformer] instance.
  static PresignDtoOwnerTypeEnumTypeTransformer? _instance;
}


