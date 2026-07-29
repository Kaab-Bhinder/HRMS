/// Server verdict on a check-in selfie: did the face match the enrolled
/// templates, and by how much. Surfaced to the employee right after the punch
/// so a below-threshold match is visible, not a silent flag they never see.
class FaceMatchResult {
  const FaceMatchResult({required this.matched, required this.confidence, required this.livenessPassed});

  final bool matched;
  final int confidence; // 0-100 similarity against the enrolled face
  final bool livenessPassed;

  static FaceMatchResult? fromJson(Object? json) {
    if (json is! Map) return null;
    return FaceMatchResult(
      matched: json['matched'] == true,
      confidence: (json['confidence'] as num?)?.round() ?? 0,
      livenessPassed: json['livenessPassed'] != false,
    );
  }
}
