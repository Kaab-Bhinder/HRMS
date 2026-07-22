import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/providers.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/json_num.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../data/location_service.dart';
import '../../data/selfie_service.dart';
import '../../domain/entities/geo_point.dart';
import '../providers/attendance_controller.dart';

/// Guided check-in: selfie → location → confirm.
///
/// The one-tap path did all three silently, which meant a camera prompt
/// appearing with no explanation and a GPS read the employee never saw. Since
/// both are recorded against their attendance — and a bad GPS fix gets the day
/// flagged — the steps are explicit, and nothing is committed until the final
/// confirm.
class CheckInSheet extends ConsumerStatefulWidget {
  const CheckInSheet({super.key});

  @override
  ConsumerState<CheckInSheet> createState() => _CheckInSheetState();
}

class _CheckInSheetState extends ConsumerState<CheckInSheet> {
  int _step = 1;
  bool _busy = false;

  String? _faceKey;
  GeoPoint? _fix;
  _OfficeCheck? _office;

  Future<void> _takeSelfie() async {
    setState(() => _busy = true);
    try {
      final Uint8List bytes = await ref.read(selfieServiceProvider).capture();
      final key = await ref.read(todayControllerProvider.notifier).uploadSelfie(bytes);
      if (!mounted) return;
      setState(() {
        _faceKey = key;
        _step = 2;
      });
    } on SelfieCancelled {
      if (mounted) {
        AppSnackbar.show(context, 'A selfie is needed to check in.', tone: SnackTone.neutral);
      }
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) {
        AppSnackbar.show(context, 'Could not use the camera.', tone: SnackTone.danger);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _getLocation() async {
    setState(() => _busy = true);
    try {
      final fix = await ref.read(todayControllerProvider.notifier).currentPosition();
      final office = await _resolveOffice(fix);
      if (!mounted) return;
      setState(() {
        _fix = fix;
        _office = office;
        _step = 3;
      });
    } on LocationException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) {
        AppSnackbar.show(context, 'Could not read your location.', tone: SnackTone.danger);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Compares the fix against the configured office geofence.
  ///
  /// Being outside does NOT block the check-in — the server flags it for HR
  /// review instead — so this is shown as information, never as a barrier.
  Future<_OfficeCheck?> _resolveOffice(GeoPoint fix) async {
    try {
      final s = await ref.read(apiClientProvider).get('/attendance/settings') as Map<String, dynamic>;
      final o = (s['office'] as Map?)?.cast<String, dynamic>();
      final lat = asDoubleOrNull(o?['latitude']);
      final lng = asDoubleOrNull(o?['longitude']);
      final name = o?['name']?.toString() ?? 'Office';
      if (lat == null || lng == null) return _OfficeCheck(name: name, distanceMeters: null, inside: null);
      final radius = asDouble(o?['radiusMeters'], 150);
      final d = _distanceMeters(fix.latitude, fix.longitude, lat, lng);
      return _OfficeCheck(name: name, distanceMeters: d, inside: d <= radius);
    } catch (_) {
      return null;
    }
  }

  /// Haversine great-circle distance in metres.
  static double _distanceMeters(double lat1, double lon1, double lat2, double lon2) {
    const earthRadius = 6371000.0;
    double rad(double d) => d * math.pi / 180;
    final dLat = rad(lat2 - lat1);
    final dLon = rad(lon2 - lon1);
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(rad(lat1)) * math.cos(rad(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2);
    return earthRadius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  }

  Future<void> _confirm() async {
    if (_faceKey == null || _fix == null) return;
    setState(() => _busy = true);
    try {
      await ref
          .read(todayControllerProvider.notifier)
          .commitCheckIn(faceImageKey: _faceKey!, fix: _fix!);
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      Navigator.of(context).pop(true);
      AppSnackbar.show(context, 'Checked in — have a great day!', tone: SnackTone.success);
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) {
        AppSnackbar.show(context, 'Could not record attendance. Try again.', tone: SnackTone.danger);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.xl,
        right: AppSpacing.xl,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).padding.bottom + AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999)),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Check in', style: context.text.titleLarge),
                    Text('Step $_step of 3',
                        style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                  ],
                ),
              ),
              IconButton(
                onPressed: _busy ? null : () => Navigator.of(context).pop(false),
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          _StepArt(step: _step, done: _step == 3),
          const SizedBox(height: AppSpacing.lg),
          ..._stepBody(context),
        ],
      ),
    );
  }

  List<Widget> _stepBody(BuildContext context) {
    final c = context.colors;
    switch (_step) {
      case 1:
        return [
          Text('Take a quick selfie', style: context.text.titleMedium),
          const SizedBox(height: 2),
          Text('A photo is required to confirm it’s you.',
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: AppSpacing.xl),
          AppButton(label: 'Open camera', loading: _busy, onPressed: _busy ? null : _takeSelfie),
          const SizedBox(height: AppSpacing.sm),
          AppButton(
            label: 'Cancel',
            variant: AppButtonVariant.secondary,
            onPressed: _busy ? null : () => Navigator.of(context).pop(false),
          ),
        ];
      case 2:
        return [
          Text('Confirm your location', style: context.text.titleMedium),
          const SizedBox(height: 2),
          Text('Your GPS position is recorded with this attendance entry.',
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: AppSpacing.xl),
          AppButton(
            label: 'Use current location',
            loading: _busy,
            onPressed: _busy ? null : _getLocation,
          ),
          const SizedBox(height: AppSpacing.sm),
          AppButton(
            label: 'Cancel',
            variant: AppButtonVariant.secondary,
            onPressed: _busy ? null : () => Navigator.of(context).pop(false),
          ),
        ];
      default:
        final office = _office;
        final outside = office?.inside == false;
        return [
          Text(outside ? 'You’re outside the office area' : 'Everything looks good',
              style: context.text.titleMedium),
          const SizedBox(height: 2),
          Text(
            outside
                ? 'You can still check in. HR will review this entry.'
                : 'You’re ready to check in.',
            style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
          ),
          if (office != null) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: c.tint(outside ? c.warning : c.success, 0.10),
                borderRadius: AppRadius.rLg,
              ),
              child: Row(
                children: [
                  Icon(Icons.place_rounded,
                      size: 18, color: outside ? c.warning : c.success),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(office.name, style: context.text.titleSmall),
                        Text(
                          office.inside == null
                              ? 'No office area configured'
                              : outside
                                  ? '${office.distanceMeters!.round()} m away — will be flagged'
                                  : 'Inside office area',
                          style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          AppButton(label: 'Confirm check in', loading: _busy, onPressed: _busy ? null : _confirm),
          const SizedBox(height: AppSpacing.sm),
          AppButton(
            label: 'Cancel',
            variant: AppButtonVariant.secondary,
            onPressed: _busy ? null : () => Navigator.of(context).pop(false),
          ),
        ];
    }
  }
}

class _OfficeCheck {
  const _OfficeCheck({required this.name, required this.distanceMeters, required this.inside});
  final String name;
  final double? distanceMeters;

  /// Null when the office has no coordinates configured.
  final bool? inside;
}

/// The illustration panel at the top of each step.
class _StepArt extends StatelessWidget {
  const _StepArt({required this.step, required this.done});
  final int step;
  final bool done;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final tone = done ? c.success : c.primary;
    final icon = switch (step) {
      1 => Icons.person_rounded,
      2 => Icons.location_on_rounded,
      _ => Icons.check_rounded,
    };
    final badge = switch (step) {
      1 => Icons.photo_camera_rounded,
      2 => Icons.my_location_rounded,
      _ => Icons.verified_rounded,
    };

    return Container(
      height: 150,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: AppRadius.rXl,
        gradient: LinearGradient(
          colors: [
            Color.alphaBlend(tone.withValues(alpha: 0.16), c.surface),
            Color.alphaBlend(tone.withValues(alpha: 0.06), c.surface),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: AppSpacing.md,
            top: AppSpacing.md,
            child: Container(
              height: 32,
              width: 32,
              decoration: BoxDecoration(
                color: Color.alphaBlend(tone.withValues(alpha: 0.22), c.surface),
                borderRadius: AppRadius.rMd,
              ),
              child: Icon(badge, size: 17, color: tone),
            ),
          ),
          Center(
            child: Container(
              height: 84,
              width: 84,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Color.alphaBlend(tone.withValues(alpha: 0.20), c.surface),
                border: Border.all(color: tone.withValues(alpha: 0.35), width: 2),
              ),
              child: Icon(icon, size: 38, color: tone),
            ),
          ),
        ],
      ),
    );
  }
}
