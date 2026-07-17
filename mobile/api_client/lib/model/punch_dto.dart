//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PunchDto {
  /// Returns a new [PunchDto] instance.
  PunchDto({
    required this.type,
    required this.method,
    this.employeeId,
    this.occurredAt,
    this.latitude,
    this.longitude,
    this.accuracyMeters,
    this.locationId,
    this.qrToken,
    this.faceImageKey,
    this.deviceId,
    this.isOffline,
    this.clientCreatedAt,
    this.metadata,
  });

  PunchDtoTypeEnum type;

  PunchDtoMethodEnum method;

  /// Admin punching on behalf; omit for self
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
  String? occurredAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? latitude;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? longitude;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? accuracyMeters;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? locationId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? qrToken;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? faceImageKey;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? deviceId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isOffline;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? clientCreatedAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  Object? metadata;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PunchDto &&
    other.type == type &&
    other.method == method &&
    other.employeeId == employeeId &&
    other.occurredAt == occurredAt &&
    other.latitude == latitude &&
    other.longitude == longitude &&
    other.accuracyMeters == accuracyMeters &&
    other.locationId == locationId &&
    other.qrToken == qrToken &&
    other.faceImageKey == faceImageKey &&
    other.deviceId == deviceId &&
    other.isOffline == isOffline &&
    other.clientCreatedAt == clientCreatedAt &&
    other.metadata == metadata;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (type.hashCode) +
    (method.hashCode) +
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (occurredAt == null ? 0 : occurredAt!.hashCode) +
    (latitude == null ? 0 : latitude!.hashCode) +
    (longitude == null ? 0 : longitude!.hashCode) +
    (accuracyMeters == null ? 0 : accuracyMeters!.hashCode) +
    (locationId == null ? 0 : locationId!.hashCode) +
    (qrToken == null ? 0 : qrToken!.hashCode) +
    (faceImageKey == null ? 0 : faceImageKey!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode) +
    (isOffline == null ? 0 : isOffline!.hashCode) +
    (clientCreatedAt == null ? 0 : clientCreatedAt!.hashCode) +
    (metadata == null ? 0 : metadata!.hashCode);

  @override
  String toString() => 'PunchDto[type=$type, method=$method, employeeId=$employeeId, occurredAt=$occurredAt, latitude=$latitude, longitude=$longitude, accuracyMeters=$accuracyMeters, locationId=$locationId, qrToken=$qrToken, faceImageKey=$faceImageKey, deviceId=$deviceId, isOffline=$isOffline, clientCreatedAt=$clientCreatedAt, metadata=$metadata]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'type'] = this.type;
      json[r'method'] = this.method;
    if (this.employeeId != null) {
      json[r'employeeId'] = this.employeeId;
    } else {
      json[r'employeeId'] = null;
    }
    if (this.occurredAt != null) {
      json[r'occurredAt'] = this.occurredAt;
    } else {
      json[r'occurredAt'] = null;
    }
    if (this.latitude != null) {
      json[r'latitude'] = this.latitude;
    } else {
      json[r'latitude'] = null;
    }
    if (this.longitude != null) {
      json[r'longitude'] = this.longitude;
    } else {
      json[r'longitude'] = null;
    }
    if (this.accuracyMeters != null) {
      json[r'accuracyMeters'] = this.accuracyMeters;
    } else {
      json[r'accuracyMeters'] = null;
    }
    if (this.locationId != null) {
      json[r'locationId'] = this.locationId;
    } else {
      json[r'locationId'] = null;
    }
    if (this.qrToken != null) {
      json[r'qrToken'] = this.qrToken;
    } else {
      json[r'qrToken'] = null;
    }
    if (this.faceImageKey != null) {
      json[r'faceImageKey'] = this.faceImageKey;
    } else {
      json[r'faceImageKey'] = null;
    }
    if (this.deviceId != null) {
      json[r'deviceId'] = this.deviceId;
    } else {
      json[r'deviceId'] = null;
    }
    if (this.isOffline != null) {
      json[r'isOffline'] = this.isOffline;
    } else {
      json[r'isOffline'] = null;
    }
    if (this.clientCreatedAt != null) {
      json[r'clientCreatedAt'] = this.clientCreatedAt;
    } else {
      json[r'clientCreatedAt'] = null;
    }
    if (this.metadata != null) {
      json[r'metadata'] = this.metadata;
    } else {
      json[r'metadata'] = null;
    }
    return json;
  }

  /// Returns a new [PunchDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PunchDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'type'), 'Required key "PunchDto[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "PunchDto[type]" has a null value in JSON.');
        assert(json.containsKey(r'method'), 'Required key "PunchDto[method]" is missing from JSON.');
        assert(json[r'method'] != null, 'Required key "PunchDto[method]" has a null value in JSON.');
        return true;
      }());

      return PunchDto(
        type: PunchDtoTypeEnum.fromJson(json[r'type'])!,
        method: PunchDtoMethodEnum.fromJson(json[r'method'])!,
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        occurredAt: mapValueOfType<String>(json, r'occurredAt'),
        latitude: num.parse('${json[r'latitude']}'),
        longitude: num.parse('${json[r'longitude']}'),
        accuracyMeters: num.parse('${json[r'accuracyMeters']}'),
        locationId: mapValueOfType<String>(json, r'locationId'),
        qrToken: mapValueOfType<String>(json, r'qrToken'),
        faceImageKey: mapValueOfType<String>(json, r'faceImageKey'),
        deviceId: mapValueOfType<String>(json, r'deviceId'),
        isOffline: mapValueOfType<bool>(json, r'isOffline'),
        clientCreatedAt: mapValueOfType<String>(json, r'clientCreatedAt'),
        metadata: mapValueOfType<Object>(json, r'metadata'),
      );
    }
    return null;
  }

  static List<PunchDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PunchDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PunchDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PunchDto> mapFromJson(dynamic json) {
    final map = <String, PunchDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PunchDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PunchDto-objects as value to a dart map
  static Map<String, List<PunchDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PunchDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PunchDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'type',
    'method',
  };
}


class PunchDtoTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const PunchDtoTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const checkIn = PunchDtoTypeEnum._(r'check_in');
  static const checkOut = PunchDtoTypeEnum._(r'check_out');
  static const breakStart = PunchDtoTypeEnum._(r'break_start');
  static const breakEnd = PunchDtoTypeEnum._(r'break_end');

  /// List of all possible values in this [enum][PunchDtoTypeEnum].
  static const values = <PunchDtoTypeEnum>[
    checkIn,
    checkOut,
    breakStart,
    breakEnd,
  ];

  static PunchDtoTypeEnum? fromJson(dynamic value) => PunchDtoTypeEnumTypeTransformer().decode(value);

  static List<PunchDtoTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PunchDtoTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PunchDtoTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [PunchDtoTypeEnum] to String,
/// and [decode] dynamic data back to [PunchDtoTypeEnum].
class PunchDtoTypeEnumTypeTransformer {
  factory PunchDtoTypeEnumTypeTransformer() => _instance ??= const PunchDtoTypeEnumTypeTransformer._();

  const PunchDtoTypeEnumTypeTransformer._();

  String encode(PunchDtoTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a PunchDtoTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  PunchDtoTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'check_in': return PunchDtoTypeEnum.checkIn;
        case r'check_out': return PunchDtoTypeEnum.checkOut;
        case r'break_start': return PunchDtoTypeEnum.breakStart;
        case r'break_end': return PunchDtoTypeEnum.breakEnd;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [PunchDtoTypeEnumTypeTransformer] instance.
  static PunchDtoTypeEnumTypeTransformer? _instance;
}



class PunchDtoMethodEnum {
  /// Instantiate a new enum with the provided [value].
  const PunchDtoMethodEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const manual = PunchDtoMethodEnum._(r'manual');
  static const web = PunchDtoMethodEnum._(r'web');
  static const mobileGps = PunchDtoMethodEnum._(r'mobile_gps');
  static const mobileFace = PunchDtoMethodEnum._(r'mobile_face');
  static const qr = PunchDtoMethodEnum._(r'qr');
  static const biometric = PunchDtoMethodEnum._(r'biometric');
  static const kiosk = PunchDtoMethodEnum._(r'kiosk');

  /// List of all possible values in this [enum][PunchDtoMethodEnum].
  static const values = <PunchDtoMethodEnum>[
    manual,
    web,
    mobileGps,
    mobileFace,
    qr,
    biometric,
    kiosk,
  ];

  static PunchDtoMethodEnum? fromJson(dynamic value) => PunchDtoMethodEnumTypeTransformer().decode(value);

  static List<PunchDtoMethodEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PunchDtoMethodEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PunchDtoMethodEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [PunchDtoMethodEnum] to String,
/// and [decode] dynamic data back to [PunchDtoMethodEnum].
class PunchDtoMethodEnumTypeTransformer {
  factory PunchDtoMethodEnumTypeTransformer() => _instance ??= const PunchDtoMethodEnumTypeTransformer._();

  const PunchDtoMethodEnumTypeTransformer._();

  String encode(PunchDtoMethodEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a PunchDtoMethodEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  PunchDtoMethodEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'manual': return PunchDtoMethodEnum.manual;
        case r'web': return PunchDtoMethodEnum.web;
        case r'mobile_gps': return PunchDtoMethodEnum.mobileGps;
        case r'mobile_face': return PunchDtoMethodEnum.mobileFace;
        case r'qr': return PunchDtoMethodEnum.qr;
        case r'biometric': return PunchDtoMethodEnum.biometric;
        case r'kiosk': return PunchDtoMethodEnum.kiosk;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [PunchDtoMethodEnumTypeTransformer] instance.
  static PunchDtoMethodEnumTypeTransformer? _instance;
}


