import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/hero_surface.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/widgets/pressable.dart';
import '../../auth/presentation/providers/auth_controller.dart';

/// Account tab: identity header + grouped settings rows. Sign-out is live;
/// the other rows are placeholders until their flows are built.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    void soon(String what) => AppSnackbar.show(context, '$what is coming soon.');

    return AmbientBackground(
      child: SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.lg, AppSpacing.screen, 108),
        children: [
          Text('Profile', style: context.text.headlineMedium),
          const SizedBox(height: AppSpacing.lg),

          // Identity, on the screen's one hero surface. The avatar reverses
          // to a light disc here because the primary gradient it used before is
          // the same family as the hero itself and would vanish into it.
          HeroSurface(
            child: Row(
              children: [
                Container(
                  height: 62,
                  width: 62,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.18),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.28), width: 1.5),
                  ),
                  child: Center(
                    child: Text(user?.initials ?? '?',
                        style: context.text.titleLarge
                            ?.copyWith(color: HeroSurface.onHero, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'Signed in',
                          style: context.text.titleLarge?.copyWith(color: HeroSurface.onHero),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Text(user?.email ?? '',
                          style: context.text.bodySmall?.copyWith(color: HeroSurface.onHeroMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      if ((user?.roles ?? const []).isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.md),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [for (final r in user!.roles) HeroChip(label: _title(r))],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          _SectionLabel('ACCOUNT'),
          _Group(children: [
            _Row(icon: Icons.badge_outlined, label: 'Personal information', onTap: () => soon('Personal information')),
            _Row(
              icon: Icons.lock_outline_rounded,
              label: 'Change password',
              onTap: () => showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const _ChangePasswordSheet(),
              ),
            ),
            _Row(icon: Icons.devices_outlined, label: 'Active sessions', onTap: () => soon('Active sessions')),
          ]),
          const SizedBox(height: AppSpacing.xl),

          _SectionLabel('PREFERENCES'),
          _Group(children: [
            _Row(icon: Icons.notifications_none_rounded, label: 'Notifications', onTap: () => soon('Notification settings')),
            _Row(icon: Icons.brightness_6_outlined, label: 'Appearance', value: 'System', onTap: () => soon('Appearance')),
            _Row(icon: Icons.translate_rounded, label: 'Language', value: 'English', onTap: () => soon('Language')),
          ]),
          const SizedBox(height: AppSpacing.xl),

          _SectionLabel('ABOUT'),
          _Group(children: [
            _Row(icon: Icons.help_outline_rounded, label: 'Help & support', onTap: () => soon('Help & support')),
            _Row(icon: Icons.shield_outlined, label: 'Privacy', onTap: () => soon('Privacy')),
            _Row(icon: Icons.info_outline_rounded, label: 'App version', value: '0.1.0', onTap: null),
          ]),
          const SizedBox(height: AppSpacing.xl),

          _Group(children: [
            _Row(
              icon: Icons.logout_rounded,
              label: 'Sign out',
              danger: true,
              onTap: () => ref.read(authControllerProvider.notifier).logout(),
            ),
          ]),
        ],
      ),
      ),
    );
  }

  String _title(String slug) => slug
      .replaceAll(RegExp('[-_]'), ' ')
      .split(' ')
      .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.sm),
        child: Text(text, style: AppTypography.overline(context.colors.mutedForeground)),
      );
}

class _Group extends StatelessWidget {
  const _Group({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) Divider(height: 1, thickness: 1, color: c.border, indent: 54),
            children[i],
          ],
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label, this.value, this.onTap, this.danger = false});
  final IconData icon;
  final String label;
  final String? value;
  final VoidCallback? onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final color = danger ? c.danger : c.foreground;
    return Pressable(
      onTap: onTap,
      scale: 0.99,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 15),
        child: Row(
          children: [
            Icon(icon, size: 20, color: danger ? c.danger : c.mutedForeground),
            const SizedBox(width: AppSpacing.md),
            Expanded(child: Text(label, style: context.text.titleSmall?.copyWith(color: color))),
            if (value != null) Text(value!, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            if (onTap != null && !danger) ...[
              const SizedBox(width: 4),
              Icon(Icons.chevron_right_rounded, size: 20, color: c.mutedForeground),
            ],
          ],
        ),
      ),
    );
  }
}

/// Change your own password.
///
/// The current password is required by the API — holding a valid session is not
/// proof of ownership. Changing it revokes every other session (including this
/// account on other devices) but keeps this one, so the user is not signed out
/// of the app they just used to secure the account.
class _ChangePasswordSheet extends ConsumerStatefulWidget {
  const _ChangePasswordSheet();

  @override
  ConsumerState<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends ConsumerState<_ChangePasswordSheet> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _busy = false;
  bool _show = false;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final cur = _current.text, next = _next.text;
    if (cur.isEmpty || next.isEmpty) {
      AppSnackbar.show(context, 'Fill in both password fields.', tone: SnackTone.neutral);
      return;
    }
    if (next.length < 8) {
      AppSnackbar.show(context, 'Use at least 8 characters.', tone: SnackTone.danger);
      return;
    }
    if (next != _confirm.text) {
      AppSnackbar.show(context, 'The new passwords do not match.', tone: SnackTone.danger);
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(authRepositoryProvider).changePassword(currentPassword: cur, newPassword: next);
      if (!mounted) return;
      Navigator.of(context).pop();
      AppSnackbar.show(context, 'Password changed. Other devices were signed out.', tone: SnackTone.success);
    } on ApiException catch (e) {
      // Surfaces "Your current password is incorrect" rather than a false success.
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not change your password.', tone: SnackTone.danger);
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
        left: AppSpacing.xl, right: AppSpacing.xl, top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + MediaQuery.of(context).padding.bottom + AppSpacing.xl,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4,
                decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999))),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text('Change password', style: context.text.titleLarge),
            const SizedBox(height: 2),
            Text('You will stay signed in on this device.',
                style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            const SizedBox(height: AppSpacing.lg),
            TextField(
              controller: _current,
              obscureText: !_show,
              decoration: const InputDecoration(labelText: 'Current password'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _next,
              obscureText: !_show,
              decoration: InputDecoration(
                labelText: 'New password',
                helperText: 'At least 8 characters',
                suffixIcon: IconButton(
                  icon: Icon(_show ? Icons.visibility_off_rounded : Icons.visibility_rounded, size: 20),
                  onPressed: () => setState(() => _show = !_show),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _confirm,
              obscureText: !_show,
              decoration: const InputDecoration(labelText: 'Confirm new password'),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(label: 'Update password', loading: _busy, onPressed: _busy ? null : _save),
          ],
        ),
      ),
    );
  }
}
