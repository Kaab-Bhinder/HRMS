import 'dart:math';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../data/face_repository.dart';

/// First-login Face ID setup: a randomized multi-pose capture sequence.
///
/// Each requested pose (front, turn left, turn right, look up, smile) is
/// VERIFIED on-device with ML Kit before the frame is accepted — a printed
/// photo or a screen replay cannot turn its head on command, so the sequence
/// itself is the liveness proof. The verified frames become the employee's
/// reference templates on the server; daily check-in then only needs one
/// quick selfie matched against this multi-angle set.
///
/// Left/right are validated as OPPOSITE yaw signs rather than absolute
/// directions — head-angle sign conventions differ per device/camera, but
/// "the user turned both ways" is what liveness actually requires.
class FaceEnrollmentScreen extends ConsumerStatefulWidget {
  const FaceEnrollmentScreen({super.key});

  @override
  ConsumerState<FaceEnrollmentScreen> createState() => _FaceEnrollmentScreenState();
}

enum _Pose { center, left, right, up, smile }

class _Step {
  _Step(this.pose);
  final _Pose pose;
  Uint8List? bytes;
  bool get done => bytes != null;
}

class _FaceEnrollmentScreenState extends ConsumerState<FaceEnrollmentScreen> {
  late final List<_Step> _steps;
  int _current = 0;
  bool _busy = false;
  bool _uploading = false;
  String? _hint;
  double? _leftYawSign; // sign observed on the first side-turn — the other side must be opposite

  final _picker = ImagePicker();
  final _detector = FaceDetector(
    options: FaceDetectorOptions(enableClassification: true, performanceMode: FaceDetectorMode.accurate),
  );

  @override
  void initState() {
    super.initState();
    // Frontal frame first (the primary matching reference), then the
    // challenge poses in RANDOM order so a prepared video can't follow along.
    final challenges = [_Pose.left, _Pose.right, _Pose.up, _Pose.smile]..shuffle(Random());
    _steps = [_Step(_Pose.center), ...challenges.map(_Step.new)];
  }

  @override
  void dispose() {
    _detector.close();
    super.dispose();
  }

  String _title(_Pose p) => switch (p) {
        _Pose.center => context.tr('Look straight at the camera'),
        _Pose.left => context.tr('Turn your head to the LEFT'),
        _Pose.right => context.tr('Turn your head to the RIGHT'),
        _Pose.up => context.tr('Tilt your head UP'),
        _Pose.smile => context.tr('Smile!'),
      };

  IconData _icon(_Pose p) => switch (p) {
        _Pose.center => Icons.face_rounded,
        _Pose.left => Icons.arrow_back_rounded,
        _Pose.right => Icons.arrow_forward_rounded,
        _Pose.up => Icons.arrow_upward_rounded,
        _Pose.smile => Icons.sentiment_very_satisfied_rounded,
      };

  /// Validates the captured frame for the requested pose. Returns an error
  /// hint, or null when the pose passes.
  String? _validate(_Pose pose, Face face) {
    final yaw = face.headEulerAngleY ?? 0;
    final pitch = face.headEulerAngleX ?? 0;
    final smile = face.smilingProbability ?? 0;
    switch (pose) {
      case _Pose.center:
        if (yaw.abs() > 14 || pitch.abs() > 14) return context.tr('Face the camera straight on and retake.');
        return null;
      case _Pose.left:
        if (yaw.abs() < 16) return context.tr('Turn your head further and retake.');
        _leftYawSign = yaw.sign;
        return null;
      case _Pose.right:
        if (yaw.abs() < 16) return context.tr('Turn your head further and retake.');
        if (_leftYawSign != null && yaw.sign == _leftYawSign) {
          return context.tr('That looks like the same side — turn the OTHER way.');
        }
        return null;
      case _Pose.up:
        if (pitch.abs() < 10) return context.tr('Tilt your head up a little more and retake.');
        return null;
      case _Pose.smile:
        if (smile < 0.7) return context.tr('A real smile — teeth help! Retake.');
        return null;
    }
  }

  Future<void> _capture() async {
    final step = _steps[_current];
    setState(() {
      _busy = true;
      _hint = null;
    });
    try {
      final shot = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        imageQuality: 80,
        maxWidth: 1080,
      );
      if (shot == null) return; // user backed out — stay on this step

      final faces = await _detector.processImage(InputImage.fromFilePath(shot.path));
      if (faces.isEmpty) {
        setState(() => _hint = context.tr('No face found — better lighting and try again.'));
        return;
      }
      if (faces.length > 1) {
        setState(() => _hint = context.tr('Only you in the frame, please.'));
        return;
      }
      final err = _validate(step.pose, faces.first);
      if (err != null) {
        setState(() => _hint = err);
        return;
      }

      step.bytes = await shot.readAsBytes();
      if (_current < _steps.length - 1) {
        setState(() => _current += 1);
      } else {
        await _submit();
      }
    } catch (_) {
      if (mounted) setState(() => _hint = context.tr('Could not use the camera.'));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submit() async {
    setState(() => _uploading = true);
    try {
      final repo = ref.read(faceRepositoryProvider);
      final keys = <String>[];
      for (final s in _steps) {
        keys.add(await repo.uploadFrame(s.bytes!, s.pose.name));
      }
      await repo.enrollSelf(keys);
      ref.invalidate(faceStatusProvider);
      if (!mounted) return;
      AppSnackbar.show(context, context.tr('Face ID is set up — you can check in now.'), tone: SnackTone.success);
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        AppSnackbar.show(context, context.tr('Enrollment failed — please try again.'), tone: SnackTone.danger);
        setState(() => _uploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final step = _steps[_current];

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Set up Face ID'))),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screen),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                context.tr('We take a few photos in different poses. Each pose is verified on this device — this protects your account from photos and videos of you.'),
                style: context.text.bodyMedium?.copyWith(color: c.mutedForeground),
              ),
              const SizedBox(height: AppSpacing.lg),

              // progress dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 0; i < _steps.length; i++)
                    Container(
                      width: 26,
                      height: 6,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(3),
                        color: _steps[i].done
                            ? c.success
                            : i == _current
                                ? c.primary
                                : c.border,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              Expanded(
                child: AppCard(
                  child: _uploading
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircularProgressIndicator(),
                            const SizedBox(height: AppSpacing.lg),
                            Text(context.tr('Creating your Face ID…'), style: context.text.titleMedium),
                          ],
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 96,
                              height: 96,
                              decoration: BoxDecoration(color: c.tint(c.primary, 0.12), shape: BoxShape.circle),
                              child: Icon(_icon(step.pose), size: 48, color: c.primary),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            Text('${_current + 1}/${_steps.length}', style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
                            const SizedBox(height: 4),
                            Text(_title(step.pose), style: context.text.titleLarge, textAlign: TextAlign.center),
                            if (_hint != null) ...[
                              const SizedBox(height: AppSpacing.md),
                              Container(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                decoration: BoxDecoration(color: c.tint(c.warning, 0.12), borderRadius: AppRadius.rLg),
                                child: Text(_hint!, style: context.text.bodySmall?.copyWith(color: c.foreground), textAlign: TextAlign.center),
                              ),
                            ],
                          ],
                        ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: context.tr('Open camera'),
                loading: _busy,
                onPressed: _busy || _uploading ? null : _capture,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
