import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../data/face_repository.dart';
import 'live_face_capture_screen.dart';

/// First-login Face ID setup — the mobile twin of the web's first-run wizard.
///
/// One explanation screen, then a single LIVE camera session: the preview
/// stays open while the app watches the face and auto-captures each pose
/// (front + turn left/right/up/smile in random order) — the user never
/// presses a shutter. The verified frames become the employee's reference
/// templates on the server; check-in is locked until this exists.
class FaceEnrollmentScreen extends ConsumerStatefulWidget {
  const FaceEnrollmentScreen({super.key});

  @override
  ConsumerState<FaceEnrollmentScreen> createState() => _FaceEnrollmentScreenState();
}

class _FaceEnrollmentScreenState extends ConsumerState<FaceEnrollmentScreen> {
  bool _uploading = false;

  Future<void> _start() async {
    final frames = await Navigator.of(context).push<List<Uint8List>>(
      MaterialPageRoute(
        builder: (_) => LiveFaceCaptureScreen(
          poses: enrollmentPoses(),
          title: context.tr('Set up Face ID'),
        ),
      ),
    );
    if (frames == null || frames.isEmpty || !mounted) return;

    setState(() => _uploading = true);
    try {
      final repo = ref.read(faceRepositoryProvider);
      final keys = <String>[];
      for (var i = 0; i < frames.length; i++) {
        keys.add(await repo.uploadFrame(frames[i], 'pose$i'));
      }
      await repo.enrollSelf(keys);
      ref.invalidate(faceStatusProvider);
      if (!mounted) return;
      AppSnackbar.show(context, context.tr('Face ID is set up — you can check in now.'), tone: SnackTone.success);
      Navigator.of(context).pop(true);
    } catch (_) {
      if (mounted) {
        AppSnackbar.show(context, context.tr('Enrollment failed — please try again.'), tone: SnackTone.danger);
        setState(() => _uploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Set up Face ID'))),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screen),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
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
                              child: Icon(Icons.face_retouching_natural_rounded, size: 48, color: c.primary),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            Text(context.tr('Set up Face ID'), style: context.text.titleLarge, textAlign: TextAlign.center),
                            const SizedBox(height: AppSpacing.sm),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                              child: Text(
                                context.tr('Keep your face in the oval and follow the prompts — it captures by itself. This protects your account from photos and videos of you.'),
                                style: context.text.bodyMedium?.copyWith(color: c.mutedForeground),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: context.tr('Start'),
                loading: _uploading,
                onPressed: _uploading ? null : _start,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
