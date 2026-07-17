//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RegisterFileDto {
  /// Returns a new [RegisterFileDto] instance.
  RegisterFileDto({
    required this.ownerType,
    required this.ownerId,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.storageKey,
    this.category,
    this.checksumSha256,
  });

  RegisterFileDtoOwnerTypeEnum ownerType;

  String ownerId;

  String fileName;

  String mimeType;

  num sizeBytes;

  String storageKey;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? category;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? checksumSha256;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RegisterFileDto &&
    other.ownerType == ownerType &&
    other.ownerId == ownerId &&
    other.fileName == fileName &&
    other.mimeType == mimeType &&
    other.sizeBytes == sizeBytes &&
    other.storageKey == storageKey &&
    other.category == category &&
    other.checksumSha256 == checksumSha256;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ownerType.hashCode) +
    (ownerId.hashCode) +
    (fileName.hashCode) +
    (mimeType.hashCode) +
    (sizeBytes.hashCode) +
    (storageKey.hashCode) +
    (category == null ? 0 : category!.hashCode) +
    (checksumSha256 == null ? 0 : checksumSha256!.hashCode);

  @override
  String toString() => 'RegisterFileDto[ownerType=$ownerType, ownerId=$ownerId, fileName=$fileName, mimeType=$mimeType, sizeBytes=$sizeBytes, storageKey=$storageKey, category=$category, checksumSha256=$checksumSha256]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'ownerType'] = this.ownerType;
      json[r'ownerId'] = this.ownerId;
      json[r'fileName'] = this.fileName;
      json[r'mimeType'] = this.mimeType;
      json[r'sizeBytes'] = this.sizeBytes;
      json[r'storageKey'] = this.storageKey;
    if (this.category != null) {
      json[r'category'] = this.category;
    } else {
      json[r'category'] = null;
    }
    if (this.checksumSha256 != null) {
      json[r'checksumSha256'] = this.checksumSha256;
    } else {
      json[r'checksumSha256'] = null;
    }
    return json;
  }

  /// Returns a new [RegisterFileDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RegisterFileDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'ownerType'), 'Required key "RegisterFileDto[ownerType]" is missing from JSON.');
        assert(json[r'ownerType'] != null, 'Required key "RegisterFileDto[ownerType]" has a null value in JSON.');
        assert(json.containsKey(r'ownerId'), 'Required key "RegisterFileDto[ownerId]" is missing from JSON.');
        assert(json[r'ownerId'] != null, 'Required key "RegisterFileDto[ownerId]" has a null value in JSON.');
        assert(json.containsKey(r'fileName'), 'Required key "RegisterFileDto[fileName]" is missing from JSON.');
        assert(json[r'fileName'] != null, 'Required key "RegisterFileDto[fileName]" has a null value in JSON.');
        assert(json.containsKey(r'mimeType'), 'Required key "RegisterFileDto[mimeType]" is missing from JSON.');
        assert(json[r'mimeType'] != null, 'Required key "RegisterFileDto[mimeType]" has a null value in JSON.');
        assert(json.containsKey(r'sizeBytes'), 'Required key "RegisterFileDto[sizeBytes]" is missing from JSON.');
        assert(json[r'sizeBytes'] != null, 'Required key "RegisterFileDto[sizeBytes]" has a null value in JSON.');
        assert(json.containsKey(r'storageKey'), 'Required key "RegisterFileDto[storageKey]" is missing from JSON.');
        assert(json[r'storageKey'] != null, 'Required key "RegisterFileDto[storageKey]" has a null value in JSON.');
        return true;
      }());

      return RegisterFileDto(
        ownerType: RegisterFileDtoOwnerTypeEnum.fromJson(json[r'ownerType'])!,
        ownerId: mapValueOfType<String>(json, r'ownerId')!,
        fileName: mapValueOfType<String>(json, r'fileName')!,
        mimeType: mapValueOfType<String>(json, r'mimeType')!,
        sizeBytes: num.parse('${json[r'sizeBytes']}'),
        storageKey: mapValueOfType<String>(json, r'storageKey')!,
        category: mapValueOfType<String>(json, r'category'),
        checksumSha256: mapValueOfType<String>(json, r'checksumSha256'),
      );
    }
    return null;
  }

  static List<RegisterFileDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterFileDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterFileDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RegisterFileDto> mapFromJson(dynamic json) {
    final map = <String, RegisterFileDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RegisterFileDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RegisterFileDto-objects as value to a dart map
  static Map<String, List<RegisterFileDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RegisterFileDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RegisterFileDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'ownerType',
    'ownerId',
    'fileName',
    'mimeType',
    'sizeBytes',
    'storageKey',
  };
}


class RegisterFileDtoOwnerTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const RegisterFileDtoOwnerTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employee = RegisterFileDtoOwnerTypeEnum._(r'employee');
  static const department = RegisterFileDtoOwnerTypeEnum._(r'department');
  static const task = RegisterFileDtoOwnerTypeEnum._(r'task');
  static const document = RegisterFileDtoOwnerTypeEnum._(r'document');
  static const organization = RegisterFileDtoOwnerTypeEnum._(r'organization');

  /// List of all possible values in this [enum][RegisterFileDtoOwnerTypeEnum].
  static const values = <RegisterFileDtoOwnerTypeEnum>[
    employee,
    department,
    task,
    document,
    organization,
  ];

  static RegisterFileDtoOwnerTypeEnum? fromJson(dynamic value) => RegisterFileDtoOwnerTypeEnumTypeTransformer().decode(value);

  static List<RegisterFileDtoOwnerTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterFileDtoOwnerTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterFileDtoOwnerTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RegisterFileDtoOwnerTypeEnum] to String,
/// and [decode] dynamic data back to [RegisterFileDtoOwnerTypeEnum].
class RegisterFileDtoOwnerTypeEnumTypeTransformer {
  factory RegisterFileDtoOwnerTypeEnumTypeTransformer() => _instance ??= const RegisterFileDtoOwnerTypeEnumTypeTransformer._();

  const RegisterFileDtoOwnerTypeEnumTypeTransformer._();

  String encode(RegisterFileDtoOwnerTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a RegisterFileDtoOwnerTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RegisterFileDtoOwnerTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employee': return RegisterFileDtoOwnerTypeEnum.employee;
        case r'department': return RegisterFileDtoOwnerTypeEnum.department;
        case r'task': return RegisterFileDtoOwnerTypeEnum.task;
        case r'document': return RegisterFileDtoOwnerTypeEnum.document;
        case r'organization': return RegisterFileDtoOwnerTypeEnum.organization;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [RegisterFileDtoOwnerTypeEnumTypeTransformer] instance.
  static RegisterFileDtoOwnerTypeEnumTypeTransformer? _instance;
}


