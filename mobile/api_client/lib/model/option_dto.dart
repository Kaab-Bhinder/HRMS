//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class OptionDto {
  /// Returns a new [OptionDto] instance.
  OptionDto({
    required this.value,
    required this.label,
  });

  String value;

  String label;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OptionDto &&
    other.value == value &&
    other.label == label;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (value.hashCode) +
    (label.hashCode);

  @override
  String toString() => 'OptionDto[value=$value, label=$label]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'value'] = this.value;
      json[r'label'] = this.label;
    return json;
  }

  /// Returns a new [OptionDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OptionDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'value'), 'Required key "OptionDto[value]" is missing from JSON.');
        assert(json[r'value'] != null, 'Required key "OptionDto[value]" has a null value in JSON.');
        assert(json.containsKey(r'label'), 'Required key "OptionDto[label]" is missing from JSON.');
        assert(json[r'label'] != null, 'Required key "OptionDto[label]" has a null value in JSON.');
        return true;
      }());

      return OptionDto(
        value: mapValueOfType<String>(json, r'value')!,
        label: mapValueOfType<String>(json, r'label')!,
      );
    }
    return null;
  }

  static List<OptionDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OptionDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OptionDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OptionDto> mapFromJson(dynamic json) {
    final map = <String, OptionDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OptionDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OptionDto-objects as value to a dart map
  static Map<String, List<OptionDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OptionDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OptionDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'value',
    'label',
  };
}

