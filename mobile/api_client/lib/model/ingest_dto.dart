//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class IngestDto {
  /// Returns a new [IngestDto] instance.
  IngestDto({
    this.logs = const [],
  });

  List<List<String>> logs;

  @override
  bool operator ==(Object other) => identical(this, other) || other is IngestDto &&
    _deepEquality.equals(other.logs, logs);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (logs.hashCode);

  @override
  String toString() => 'IngestDto[logs=$logs]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'logs'] = this.logs;
    return json;
  }

  /// Returns a new [IngestDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static IngestDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'logs'), 'Required key "IngestDto[logs]" is missing from JSON.');
        assert(json[r'logs'] != null, 'Required key "IngestDto[logs]" has a null value in JSON.');
        return true;
      }());

      return IngestDto(
        logs: json[r'logs'] is List
          ? (json[r'logs'] as List).map((e) =>
              e == null ? const <String>[] : (e as List).map((value) => value as String).toList(growable: false)
            ).toList()
          :  const [],
      );
    }
    return null;
  }

  static List<IngestDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <IngestDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = IngestDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, IngestDto> mapFromJson(dynamic json) {
    final map = <String, IngestDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = IngestDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of IngestDto-objects as value to a dart map
  static Map<String, List<IngestDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<IngestDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = IngestDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'logs',
  };
}

