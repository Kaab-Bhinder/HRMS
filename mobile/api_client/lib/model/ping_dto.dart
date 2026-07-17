//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PingDto {
  /// Returns a new [PingDto] instance.
  PingDto({
    required this.sessionId,
    this.points = const [],
  });

  String sessionId;

  List<PingPointDto> points;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PingDto &&
    other.sessionId == sessionId &&
    _deepEquality.equals(other.points, points);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (sessionId.hashCode) +
    (points.hashCode);

  @override
  String toString() => 'PingDto[sessionId=$sessionId, points=$points]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'sessionId'] = this.sessionId;
      json[r'points'] = this.points;
    return json;
  }

  /// Returns a new [PingDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PingDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'sessionId'), 'Required key "PingDto[sessionId]" is missing from JSON.');
        assert(json[r'sessionId'] != null, 'Required key "PingDto[sessionId]" has a null value in JSON.');
        assert(json.containsKey(r'points'), 'Required key "PingDto[points]" is missing from JSON.');
        assert(json[r'points'] != null, 'Required key "PingDto[points]" has a null value in JSON.');
        return true;
      }());

      return PingDto(
        sessionId: mapValueOfType<String>(json, r'sessionId')!,
        points: PingPointDto.listFromJson(json[r'points']),
      );
    }
    return null;
  }

  static List<PingDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PingDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PingDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PingDto> mapFromJson(dynamic json) {
    final map = <String, PingDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PingDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PingDto-objects as value to a dart map
  static Map<String, List<PingDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PingDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PingDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'sessionId',
    'points',
  };
}

