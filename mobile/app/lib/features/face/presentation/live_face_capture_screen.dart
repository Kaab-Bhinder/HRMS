import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';

/// The face poses the live capture can request, in challenge form.
enum FacePose { center, left, right, up, smile }

/// Full-screen LIVE capture: one continuous in-app camera preview that watches
/// the face in real time (ML Kit on the camera stream) and auto-captures a
/// frame the moment each requested pose is held — the user never presses a
/// shutter. Pops with the captured JPEG frames (one per pose, in order) or
/// null if the user backs out.
///
/// This is the active-liveness gate: poses are requested in an order the
/// caller controls (enrollment randomizes them), and a printed photo or a
/// replayed video cannot follow spoken-order head turns. Left/right are
/// validated as OPPOSITE yaw signs rather than absolute directions — sign
/// conventions differ per camera, but "turned both ways" is what liveness
/// actually requires.
class LiveFaceCaptureScreen extends StatefulWidget {
  const LiveFaceCaptureScreen({super.key, required this.poses, this.title});

  final List<FacePose> poses;
  final String? title;

  @override
  State<LiveFaceCaptureScreen> createState() => _LiveFaceCaptureScreenState();
}

class _LiveFaceCaptureScreenState extends State<LiveFaceCaptureScreen> {
  CameraController? _camera;
  late final FaceDetector _detector;
  final List<Uint8List> _frames = [];
  int _current = 0;
  bool _processing = false; // one ML Kit pass at a time
  bool _capturing = false; // takePicture in flight
  bool _justCaptured = false; // showing the green "captured" confirmation
  int _holdCount = 0; // consecutive good detections before we snap
  double? _sideYawSign; // sign of the side-turn already captured
  double _lastYaw = 0; // most recent measured yaw, used when locking the side
  String? _hint;
  String? _fatal;
  Timer? _stallTimer;
  bool _showManual = false; // escape hatch when detection struggles

  // A pose must be HELD, not brushed past: enough consecutive good frames to
  // read as deliberate (~1s at typical stream rates). Capturing on the first
  // matching frame made the whole session finish in milliseconds, which felt
  // broken and gave the user no chance to see what was happening.
  static const _holdNeeded = 8;
  static const _confirmPause = Duration(milliseconds: 700); // "captured ✓" beat

  @override
  void initState() {
    super.initState();
    _detector = FaceDetector(
      options: FaceDetectorOptions(
        enableClassification: true, // smile probability
        performanceMode: FaceDetectorMode.fast,
        minFaceSize: 0.2,
      ),
    );
    _init();
  }

  Future<void> _init() async {
    try {
      final cams = await availableCameras();
      final front = cams.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cams.first,
      );
      final controller = CameraController(
        front,
        ResolutionPreset.medium,
        enableAudio: false,
        // NV21 lets the stream feed ML Kit directly on Android — no plane
        // reshuffling; iOS uses BGRA which ML Kit also accepts natively.
        imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
      );
      await controller.initialize();
      if (!mounted) return;
      _camera = controller;
      await controller.startImageStream(_onFrame);
      _armStallTimer();
      setState(() {});
    } catch (_) {
      if (mounted) setState(() => _fatal = context.tr('Could not use the camera.'));
    }
  }

  /// Nobody should ever be trapped in front of a camera that won't fire.
  /// If a pose hasn't been captured in 12s (bad light, an unusual device,
  /// damped head angles), offer a manual shutter for this pose.
  void _armStallTimer() {
    _stallTimer?.cancel();
    _showManual = false;
    _stallTimer = Timer(const Duration(seconds: 12), () {
      if (mounted && !_capturing) setState(() => _showManual = true);
    });
  }

  @override
  void dispose() {
    _stallTimer?.cancel();
    _camera?.dispose();
    _detector.close();
    super.dispose();
  }

  InputImage? _toInputImage(CameraImage image) {
    final camera = _camera;
    if (camera == null) return null;
    final rotation = InputImageRotationValue.fromRawValue(camera.description.sensorOrientation) ?? InputImageRotation.rotation0deg;
    final format = Platform.isAndroid ? InputImageFormat.nv21 : InputImageFormat.bgra8888;
    final plane = image.planes.first;
    return InputImage.fromBytes(
      bytes: plane.bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: plane.bytesPerRow,
      ),
    );
  }

  Future<void> _onFrame(CameraImage image) async {
    if (_processing || _capturing || _fatal != null || _current >= widget.poses.length) return;
    _processing = true;
    try {
      final input = _toInputImage(image);
      if (input == null) return;
      final faces = await _detector.processImage(input);
      if (!mounted) return;

      if (faces.isEmpty) {
        _holdCount = 0;
        _setHint(context.tr('Bring your face into the frame'));
        return;
      }
      if (faces.length > 1) {
        _holdCount = 0;
        _setHint(context.tr('Only you in the frame, please.'));
        return;
      }

      final err = _check(widget.poses[_current], faces.first);
      if (err != null) {
        _holdCount = 0;
        _setHint(err);
        return;
      }

      _holdCount += 1;
      _setHint(context.tr('Hold it…'));
      if (mounted) setState(() {}); // drive the hold progress ring
      if (_holdCount >= _holdNeeded) {
        _holdCount = 0;
        // Fire-and-forget ON PURPOSE: _snap() stops the image stream, and the
        // camera cannot finish stopping until this callback returns. Awaiting
        // it here deadlocks the preview on the first capture — the session
        // freezes and no later pose is ever detected.
        _capturing = true; // gate further frames immediately
        unawaited(_snap());
      }
    } catch (_) {
      // Skip a bad frame; the stream keeps flowing.
    } finally {
      _processing = false;
    }
  }

  /// Pose validation on the live stream. Returns a hint or null when good.
  String? _check(FacePose pose, Face face) {
    final yaw = face.headEulerAngleY ?? 0;
    final pitch = face.headEulerAngleX ?? 0;
    final smile = face.smilingProbability ?? 0;
    _lastYaw = yaw;
    switch (pose) {
      case FacePose.center:
        if (yaw.abs() > 14 || pitch.abs() > 14) return context.tr('Look straight at the camera');
        return null;
      case FacePose.left:
      case FacePose.right:
        // 12° is a clear, comfortable turn. Anything stricter reads as "it
        // doesn't work" on phones whose front camera reports damped angles.
        if (yaw.abs() < 12) return _turnHint(pose);
        // A second side-turn must be the OPPOSITE way from the one already
        // captured. The sign is locked at capture time (see _snap), never on
        // a passing frame — otherwise a wobble mid-turn could lock the wrong
        // side and then reject the real pose forever.
        if (_sideYawSign != null && yaw.sign == _sideYawSign) {
          return context.tr('That looks like the same side — turn the OTHER way.');
        }
        return null;
      case FacePose.up:
        if (pitch.abs() < 8) return context.tr('Tilt your head UP');
        return null;
      case FacePose.smile:
        if (smile < 0.55) return context.tr('Smile!');
        return null;
    }
  }

  String _turnHint(FacePose pose) =>
      pose == FacePose.left ? context.tr('Turn your head to the LEFT') : context.tr('Turn your head to the RIGHT');

  Future<void> _snap() async {
    final camera = _camera;
    if (camera == null) return;
    _capturing = true;
    _stallTimer?.cancel();
    if (mounted && _showManual) setState(() => _showManual = false);
    try {
      // Some devices refuse takePicture while streaming — pause the stream
      // for the shot, then resume for the next pose.
      await camera.stopImageStream();
      final shot = await camera.takePicture();
      final bytes = await shot.readAsBytes();
      _frames.add(bytes);
      // Remember which way this turn went, so a following side-pose must be
      // the other way. Locked here (on a real capture), not on a live frame.
      final done = widget.poses[_current];
      if (done == FacePose.left || done == FacePose.right) _sideYawSign = _lastYaw.sign;

      if (!mounted) return;
      // Visible confirmation so the user sees each pose land.
      setState(() => _justCaptured = true);
      await Future<void>.delayed(_confirmPause);
      if (!mounted) return;

      if (_current + 1 >= widget.poses.length) {
        Navigator.of(context).pop(List<Uint8List>.unmodifiable(_frames));
        return;
      }
      setState(() {
        _current += 1;
        _justCaptured = false;
        _hint = null;
      });
      await camera.startImageStream(_onFrame);
      _armStallTimer();
    } catch (_) {
      if (mounted) {
        setState(() => _hint = context.tr('Could not capture — hold still and try again.'));
        try {
          await camera.startImageStream(_onFrame);
        } catch (_) {
          setState(() => _fatal = context.tr('Could not use the camera.'));
        }
      }
    } finally {
      _capturing = false;
    }
  }

  void _setHint(String h) {
    if (_hint != h && mounted) setState(() => _hint = h);
  }

  String _instruction(FacePose p) => switch (p) {
        FacePose.center => context.tr('Look straight at the camera'),
        FacePose.left => context.tr('Turn your head to the LEFT'),
        FacePose.right => context.tr('Turn your head to the RIGHT'),
        FacePose.up => context.tr('Tilt your head UP'),
        FacePose.smile => context.tr('Smile!'),
      };

  IconData _icon(FacePose p) => switch (p) {
        FacePose.center => Icons.face_rounded,
        FacePose.left => Icons.arrow_back_rounded,
        FacePose.right => Icons.arrow_forward_rounded,
        FacePose.up => Icons.arrow_upward_rounded,
        FacePose.smile => Icons.sentiment_very_satisfied_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final camera = _camera;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.title ?? context.tr('Face check')),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: _fatal != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  child: Text(_fatal!, style: const TextStyle(color: Colors.white), textAlign: TextAlign.center),
                ),
              )
            : camera == null || !camera.value.isInitialized
                ? const Center(child: CircularProgressIndicator())
                : Column(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CameraPreview(camera),
                              // face oval guide — turns green as the pose is held
                              IgnorePointer(
                                child: Center(
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    width: 230,
                                    height: 300,
                                    decoration: BoxDecoration(
                                      border: Border.all(
                                        color: _justCaptured
                                            ? const Color(0xFF22C55E)
                                            : Color.lerp(Colors.white.withValues(alpha: 0.85), const Color(0xFF22C55E),
                                                (_holdCount / _holdNeeded).clamp(0.0, 1.0))!,
                                        width: _justCaptured ? 5 : 3,
                                      ),
                                      borderRadius: const BorderRadius.all(Radius.elliptical(230, 300)),
                                    ),
                                  ),
                                ),
                              ),
                              if (_justCaptured)
                                IgnorePointer(
                                  child: Center(
                                    child: Container(
                                      padding: const EdgeInsets.all(14),
                                      decoration: const BoxDecoration(color: Color(0xFF22C55E), shape: BoxShape.circle),
                                      child: const Icon(Icons.check_rounded, color: Colors.white, size: 40),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          children: [
                            // progress dots
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                for (var i = 0; i < widget.poses.length; i++)
                                  Container(
                                    width: 26,
                                    height: 6,
                                    margin: const EdgeInsets.symmetric(horizontal: 3),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: i < _frames.length
                                          ? c.success
                                          : i == _current
                                              ? c.primary
                                              : Colors.white24,
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Icon(_icon(widget.poses[_current]), size: 34, color: Colors.white),
                            const SizedBox(height: 6),
                            Text(
                              _instruction(widget.poses[_current]),
                              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _hint ?? context.tr('It captures by itself — no button to press.'),
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                              textAlign: TextAlign.center,
                            ),
                            if (_showManual) ...[
                              const SizedBox(height: AppSpacing.md),
                              OutlinedButton.icon(
                                onPressed: _capturing
                                    ? null
                                    : () {
                                        _capturing = true;
                                        unawaited(_snap());
                                      },
                                icon: const Icon(Icons.camera_alt_rounded, size: 18),
                                label: Text(context.tr('Capture manually')),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white54),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }
}

/// Enrollment pose sequence: frontal reference first, then the challenge poses
/// in random order so a prepared video can't follow along.
List<FacePose> enrollmentPoses() {
  final challenges = [FacePose.left, FacePose.right, FacePose.up, FacePose.smile]..shuffle(Random());
  return [FacePose.center, ...challenges];
}

/// Check-in sequence: the frontal frame that gets MATCHED, plus two random
/// challenges so every check-in proves liveness — a photo of the employee
/// can't smile or turn on demand, and the random order defeats a replay.
/// Deliberately shorter than enrollment: this runs every single day.
List<FacePose> checkInPoses() {
  final challenges = [FacePose.left, FacePose.right, FacePose.smile]..shuffle(Random());
  return [FacePose.center, ...challenges.take(2)];
}
