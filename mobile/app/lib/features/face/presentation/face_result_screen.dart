import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../attendance/domain/entities/face_match_result.dart';

/// The biometric verdict, shown to the employee after a face check-in:
/// their attendance photo beside their enrolled base photo, with the match
/// and liveness outcomes spelled out.
///
/// A percentage in a snackbar is not reviewable — seeing the two faces is what
/// lets someone understand a failure ("that's my brother", "the light was
/// terrible") and decide to retake. A failed match does NOT undo the check-in:
/// it is recorded and flagged, and this screen says so.
class FaceResultScreen extends ConsumerWidget {
  const FaceResultScreen({
    super.key,
    required this.selfie,
    required this.result,
    required this.capturedAt,
    this.employeeName,
    this.locationNote,
    this.onRetake,
  });

  final Uint8List selfie;
  final FaceMatchResult result;
  final DateTime capturedAt;
  final String? employeeName;
  final String? locationNote;
  final VoidCallback? onRetake;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final matched = result.matched;

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Check-in result'))),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.screen),
          children: [
            if (employeeName != null)
              Text(employeeName!, style: context.text.titleLarge, textAlign: TextAlign.center),
            Text(
              _stamp(capturedAt),
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),

            // The two faces, side by side — the whole point of this screen.
            Row(
              children: [
                Expanded(
                  child: _Photo(
                    label: context.tr('Attendance Photo'),
                    image: Image.memory(
                      selfie,
                      fit: BoxFit.cover,
                      errorBuilder: (context, e, st) => Center(
                        child: Icon(Icons.broken_image_rounded, size: 34, color: c.mutedForeground),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: _Photo(label: context.tr('Base Photo'), image: _BasePhoto(ref: ref))),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            _Verdict(
              icon: matched ? Icons.verified_user_rounded : Icons.gpp_maybe_rounded,
              label: context.tr('Match Check'),
              value: '${matched ? context.tr('Passed') : context.tr('Failed')} (${result.confidence}% ${context.tr('Match')})',
              tone: matched ? c.success : c.danger,
            ),
            const SizedBox(height: AppSpacing.sm),
            _Verdict(
              icon: Icons.emoji_people_rounded,
              label: context.tr('Liveness Check'),
              value: result.livenessPassed ? context.tr('Passed') : context.tr('Failed'),
              tone: result.livenessPassed ? c.success : c.danger,
            ),
            if (locationNote != null) ...[
              const SizedBox(height: AppSpacing.sm),
              _Verdict(icon: Icons.place_rounded, label: context.tr('Location'), value: locationNote!, tone: c.mutedForeground),
            ],

            const SizedBox(height: AppSpacing.lg),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: c.tint(matched ? c.success : c.danger, 0.10),
                borderRadius: AppRadius.rLg,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(matched ? Icons.check_circle_rounded : Icons.error_rounded,
                      size: 18, color: matched ? c.success : c.danger),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      matched
                          ? context.tr('You are checked in. Have a great day!')
                          : context.tr('Your check-in was recorded and sent to HR for review. Nothing is deducted automatically.'),
                      style: context.text.bodySmall?.copyWith(color: c.foreground),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            if (!matched && onRetake != null) ...[
              AppButton(label: context.tr('Retake photo'), onPressed: onRetake),
              const SizedBox(height: AppSpacing.sm),
            ],
            AppButton(label: context.tr('Done'), onPressed: () => Navigator.of(context).pop()),
          ],
        ),
      ),
    );
  }

  static String _stamp(DateTime d) {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${d.day}/${two(d.month)}/${d.year}, ${two(d.hour)}:${two(d.minute)}';
  }
}

class _Photo extends StatelessWidget {
  const _Photo({required this.label, required this.image});
  final String label;
  final Widget image;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      children: [
        ClipRRect(
          borderRadius: AppRadius.rLg,
          child: AspectRatio(aspectRatio: 3 / 4, child: Container(color: c.surfaceAlt, child: image)),
        ),
        const SizedBox(height: 6),
        Text(label, style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
      ],
    );
  }
}

/// The enrolled reference photo, streamed from the API (authenticated).
class _BasePhoto extends StatelessWidget {
  const _BasePhoto({required this.ref});
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List>(
      future: ref.read(apiClientProvider).getBytes('/face/my-base-photo'),
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator(strokeWidth: 2));
        }
        if (snap.hasError || snap.data == null || snap.data!.isEmpty) {
          // No reference photo on file (e.g. enrolled before base photos were
          // stored). Say so instead of leaving an empty grey box.
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.person_rounded, size: 34, color: context.colors.mutedForeground),
                  const SizedBox(height: 4),
                  Text(
                    context.tr('No base photo'),
                    style: context.text.labelSmall?.copyWith(color: context.colors.mutedForeground),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        }
        // Guard against a non-image body slipping through on any platform.
        return Image.memory(
          snap.data!,
          fit: BoxFit.cover,
          errorBuilder: (context, e, st) => Center(
            child: Icon(Icons.broken_image_rounded, size: 34, color: context.colors.mutedForeground),
          ),
        );
      },
    );
  }
}

class _Verdict extends StatelessWidget {
  const _Verdict({required this.icon, required this.label, required this.value, required this.tone});
  final IconData icon;
  final String label;
  final String value;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      children: [
        Icon(icon, size: 18, color: tone),
        const SizedBox(width: AppSpacing.sm),
        Text('$label : ', style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
        Expanded(child: Text(value, style: context.text.bodyMedium?.copyWith(color: tone, fontWeight: FontWeight.w600))),
      ],
    );
  }
}
