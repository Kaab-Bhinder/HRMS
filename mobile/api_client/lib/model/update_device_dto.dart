//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateDeviceDto {
  /// Returns a new [UpdateDeviceDto] instance.
  UpdateDeviceDto({
    this.name,
    this.vendor,
    this.model,
    this.serialNumber,
    this.connectionType,
    this.host,
    this.port,
    this.locationId,
    this.config = const {},
    this.credentials = const {},
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? vendor;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? model;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? serialNumber;

  UpdateDeviceDtoConnectionTypeEnum? connectionType;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? host;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? port;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? locationId;

  Map<String, Object> config;

  Map<String, Object> credentials;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateDeviceDto &&
    other.name == name &&
    other.vendor == vendor &&
    other.model == model &&
    other.serialNumber == serialNumber &&
    other.connectionType == connectionType &&
    other.host == host &&
    other.port == port &&
    other.locationId == locationId &&
    _deepEquality.equals(other.config, config) &&
    _deepEquality.equals(other.credentials, credentials);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (vendor == null ? 0 : vendor!.hashCode) +
    (model == null ? 0 : model!.hashCode) +
    (serialNumber == null ? 0 : serialNumber!.hashCode) +
    (connectionType == null ? 0 : connectionType!.hashCode) +
    (host == null ? 0 : host!.hashCode) +
    (port == null ? 0 : port!.hashCode) +
    (locationId == null ? 0 : locationId!.hashCode) +
    (config.hashCode) +
    (credentials.hashCode);

  @override
  String toString() => 'UpdateDeviceDto[name=$name, vendor=$vendor, model=$model, serialNumber=$serialNumber, connectionType=$connectionType, host=$host, port=$port, locationId=$locationId, config=$config, credentials=$credentials]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.vendor != null) {
      json[r'vendor'] = this.vendor;
    } else {
      json[r'vendor'] = null;
    }
    if (this.model != null) {
      json[r'model'] = this.model;
    } else {
      json[r'model'] = null;
    }
    if (this.serialNumber != null) {
      json[r'serialNumber'] = this.serialNumber;
    } else {
      json[r'serialNumber'] = null;
    }
    if (this.connectionType != null) {
      json[r'connectionType'] = this.connectionType;
    } else {
      json[r'connectionType'] = null;
    }
    if (this.host != null) {
      json[r'host'] = this.host;
    } else {
      json[r'host'] = null;
    }
    if (this.port != null) {
      json[r'port'] = this.port;
    } else {
      json[r'port'] = null;
    }
    if (this.locationId != null) {
      json[r'locationId'] = this.locationId;
    } else {
      json[r'locationId'] = null;
    }
      json[r'config'] = this.config;
      json[r'credentials'] = this.credentials;
    return json;
  }

  /// Returns a new [UpdateDeviceDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateDeviceDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateDeviceDto(
        name: mapValueOfType<String>(json, r'name'),
        vendor: mapValueOfType<String>(json, r'vendor'),
        model: mapValueOfType<String>(json, r'model'),
        serialNumber: mapValueOfType<String>(json, r'serialNumber'),
        connectionType: UpdateDeviceDtoConnectionTypeEnum.fromJson(json[r'connectionType']),
        host: mapValueOfType<String>(json, r'host'),
        port: num.parse('${json[r'port']}'),
        locationId: mapValueOfType<String>(json, r'locationId'),
        config: mapCastOfType<String, Object>(json, r'config') ?? const {},
        credentials: mapCastOfType<String, Object>(json, r'credentials') ?? const {},
      );
    }
    return null;
  }

  static List<UpdateDeviceDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateDeviceDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateDeviceDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateDeviceDto> mapFromJson(dynamic json) {
    final map = <String, UpdateDeviceDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateDeviceDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateDeviceDto-objects as value to a dart map
  static Map<String, List<UpdateDeviceDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateDeviceDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateDeviceDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateDeviceDtoConnectionTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateDeviceDtoConnectionTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const push = UpdateDeviceDtoConnectionTypeEnum._(r'push');
  static const pull = UpdateDeviceDtoConnectionTypeEnum._(r'pull');
  static const api = UpdateDeviceDtoConnectionTypeEnum._(r'api');
  static const sdk = UpdateDeviceDtoConnectionTypeEnum._(r'sdk');
  static const file = UpdateDeviceDtoConnectionTypeEnum._(r'file');

  /// List of all possible values in this [enum][UpdateDeviceDtoConnectionTypeEnum].
  static const values = <UpdateDeviceDtoConnectionTypeEnum>[
    push,
    pull,
    api,
    sdk,
    file,
  ];

  static UpdateDeviceDtoConnectionTypeEnum? fromJson(dynamic value) => UpdateDeviceDtoConnectionTypeEnumTypeTransformer().decode(value);

  static List<UpdateDeviceDtoConnectionTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateDeviceDtoConnectionTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateDeviceDtoConnectionTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateDeviceDtoConnectionTypeEnum] to String,
/// and [decode] dynamic data back to [UpdateDeviceDtoConnectionTypeEnum].
class UpdateDeviceDtoConnectionTypeEnumTypeTransformer {
  factory UpdateDeviceDtoConnectionTypeEnumTypeTransformer() => _instance ??= const UpdateDeviceDtoConnectionTypeEnumTypeTransformer._();

  const UpdateDeviceDtoConnectionTypeEnumTypeTransformer._();

  String encode(UpdateDeviceDtoConnectionTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateDeviceDtoConnectionTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateDeviceDtoConnectionTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'push': return UpdateDeviceDtoConnectionTypeEnum.push;
        case r'pull': return UpdateDeviceDtoConnectionTypeEnum.pull;
        case r'api': return UpdateDeviceDtoConnectionTypeEnum.api;
        case r'sdk': return UpdateDeviceDtoConnectionTypeEnum.sdk;
        case r'file': return UpdateDeviceDtoConnectionTypeEnum.file;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateDeviceDtoConnectionTypeEnumTypeTransformer] instance.
  static UpdateDeviceDtoConnectionTypeEnumTypeTransformer? _instance;
}


