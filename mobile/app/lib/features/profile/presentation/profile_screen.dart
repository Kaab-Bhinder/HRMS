import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/hero_surface.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/theme_controller.dart';
import '../../../core/i18n/app_i18n.dart';
import '../../../core/widgets/skeleton.dart';
import '../../../core/widgets/status_pill.dart';
import '../../access/access_providers.dart';
import '../../auth/domain/repositories/auth_repository.dart';
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
            _Row(
              icon: Icons.badge_outlined,
              label: 'Personal information',
              onTap: () => showModalBottomSheet<void>(
                context: context,
                backgroundColor: Colors.transparent,
                isScrollControlled: true,
                builder: (_) => const _PersonalInfoSheet(),
              ),
            ),
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
            _Row(
              icon: Icons.devices_outlined,
              label: 'Active sessions',
              onTap: () => showModalBottomSheet<void>(
                context: context,
                backgroundColor: Colors.transparent,
                isScrollControlled: true,
                builder: (_) => const _SessionsSheet(),
              ),
            ),
          ]),
          const SizedBox(height: AppSpacing.xl),

          _SectionLabel('PREFERENCES'),
          _Group(children: [
            _Row(icon: Icons.notifications_none_rounded, label: 'Notifications', onTap: () => soon('Notification settings')),
            const _AppearanceRow(),
            const _LanguageRow(),
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
            Text(context.tr('Change password'), style: context.text.titleLarge),
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

/// Appearance toggle. Theme is a per-device preference, so this is local state
/// persisted on the phone — it never touches the API.
class _AppearanceRow extends ConsumerWidget {
  const _AppearanceRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final mode = ref.watch(themeControllerProvider);
    final systemIsDark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
    final isDark = mode == ThemeMode.dark || (mode == ThemeMode.system && systemIsDark);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      child: Row(
        children: [
          Container(
            height: 34,
            width: 34,
            decoration: BoxDecoration(color: c.muted, borderRadius: AppRadius.rMd),
            child: Icon(isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                size: 18, color: c.foreground),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr('Appearance'), style: context.text.titleSmall),
                Text(
                  mode == ThemeMode.system ? 'Following your device' : (isDark ? 'Dark' : 'Light'),
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                ),
              ],
            ),
          ),
          Switch(
            value: isDark,
            onChanged: (_) =>
                ref.read(themeControllerProvider.notifier).toggle(systemIsDark: systemIsDark),
          ),
        ],
      ),
    );
  }
}

/// Read-only identity. An employee cannot edit these — HR maintains the record
/// — and the Employee role has no `employees:read`, so this shows exactly what
/// the account and scope endpoints already return rather than inventing fields.
class _PersonalInfoSheet extends ConsumerWidget {
  const _PersonalInfoSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final user = ref.watch(authControllerProvider).user;
    final scope = ref.watch(meScopeProvider).valueOrNull;

    return _Sheet(
      title: 'Personal information',
      subtitle: 'Maintained by HR. Contact them to change anything here.',
      child: Column(
        children: [
          _InfoRow(label: 'Full name', value: user?.fullName ?? '—'),
          _InfoRow(label: 'Work email', value: user?.email ?? '—'),
          _InfoRow(label: 'Department', value: scope?.departmentName ?? '—'),
          _InfoRow(label: 'Reports to', value: scope?.departmentHeadName ?? '—'),
          _InfoRow(
            label: 'Role',
            value: (user?.roles ?? const []).isEmpty
                ? '—'
                : user!.roles.map(_titleCase).join(', '),
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(color: c.tint(c.info, 0.10), borderRadius: AppRadius.rLg),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded, size: 16, color: c.info),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text('Ask HR to update your details.',
                      style: context.text.bodySmall?.copyWith(color: c.foreground)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _titleCase(String slug) => slug
      .replaceAll(RegExp('[-_]'), ' ')
      .split(' ')
      .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          ),
          Expanded(child: Text(value, style: context.text.titleSmall)),
        ],
      ),
    );
  }
}

/// Devices signed in to this account, with the ability to sign the others out.
class _SessionsSheet extends ConsumerStatefulWidget {
  const _SessionsSheet();

  @override
  ConsumerState<_SessionsSheet> createState() => _SessionsSheetState();
}

class _SessionsSheetState extends ConsumerState<_SessionsSheet> {
  late Future<List<AuthSession>> _future;
  String? _busy;

  @override
  void initState() {
    super.initState();
    _future = ref.read(authRepositoryProvider).sessions();
  }

  void _reload() => setState(() => _future = ref.read(authRepositoryProvider).sessions());

  Future<void> _revoke(AuthSession s) async {
    setState(() => _busy = s.id);
    try {
      await ref.read(authRepositoryProvider).revokeSession(s.id);
      if (!mounted) return;
      AppSnackbar.show(context, 'Signed out ${s.device}.', tone: SnackTone.success);
      _reload();
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  Future<void> _revokeOthers() async {
    setState(() => _busy = 'all');
    try {
      await ref.read(authRepositoryProvider).revokeOtherSessions();
      if (!mounted) return;
      AppSnackbar.show(context, 'Other devices were signed out.', tone: SnackTone.success);
      _reload();
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return _Sheet(
      title: 'Active sessions',
      subtitle: 'Devices signed in to your account.',
      child: FutureBuilder<List<AuthSession>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.xl),
              child: Skeleton(height: 64),
            );
          }
          if (snap.hasError) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
              child: Text('Couldn’t load your sessions.',
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            );
          }
          final rows = snap.data ?? const <AuthSession>[];
          final others = rows.where((r) => !r.isCurrent).length;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final s in rows) ...[
                Row(
                  children: [
                    Container(
                      height: 34,
                      width: 34,
                      decoration: BoxDecoration(
                        color: s.isCurrent ? c.tint(c.success, 0.14) : c.muted,
                        borderRadius: AppRadius.rMd,
                      ),
                      child: Icon(Icons.phone_iphone_rounded,
                          size: 18, color: s.isCurrent ? c.success : c.mutedForeground),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(s.device,
                                    style: context.text.titleSmall,
                                    maxLines: 1, overflow: TextOverflow.ellipsis),
                              ),
                              if (s.isCurrent) ...[
                                const SizedBox(width: 6),
                                StatusPill('This device', tone: PillTone.success, dot: false),
                              ],
                            ],
                          ),
                          Text(
                            [
                              if ((s.ipAddress ?? '').isNotEmpty) s.ipAddress!,
                              if (s.lastActiveAt != null)
                                'active ${DateFormat('d MMM, h:mm a').format(s.lastActiveAt!)}',
                            ].join(' · '),
                            style: context.text.labelSmall?.copyWith(color: c.mutedForeground),
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (!s.isCurrent)
                      TextButton(
                        onPressed: _busy != null ? null : () => _revoke(s),
                        child: Text(context.tr('Sign out'),
                            style: context.text.labelMedium?.copyWith(color: c.danger)),
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
              ],
              if (others > 0) ...[
                const SizedBox(height: AppSpacing.sm),
                AppButton(
                  label: 'Sign out all other devices',
                  variant: AppButtonVariant.secondary,
                  loading: _busy == 'all',
                  onPressed: _busy != null ? null : _revokeOthers,
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

/// Shared bottom-sheet frame: grabber, title, subtitle, content.
class _Sheet extends StatelessWidget {
  const _Sheet({required this.title, required this.child, this.subtitle});
  final String title;
  final String? subtitle;
  final Widget child;

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
        bottom: MediaQuery.of(context).padding.bottom + AppSpacing.xl,
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
            Text(title, style: context.text.titleLarge),
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(subtitle!, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            ],
            const SizedBox(height: AppSpacing.lg),
            child,
          ],
        ),
      ),
    );
  }
}


/// Language toggle — English ↔ Bahasa Indonesia, matching the web dashboard.
/// Per-device, persisted; switching redraws the whole app immediately.
class _LanguageRow extends ConsumerWidget {
  const _LanguageRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final lang = ref.watch(localeControllerProvider);
    final isId = lang == AppLang.id;
    return InkWell(
      onTap: () => ref.read(localeControllerProvider.notifier).toggle(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Row(
          children: [
            Container(
              height: 34,
              width: 34,
              decoration: BoxDecoration(color: c.muted, borderRadius: AppRadius.rMd),
              child: Icon(Icons.translate_rounded, size: 18, color: c.foreground),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(child: Text(context.tr('Language'), style: context.text.titleSmall)),
            // Segmented EN / ID pill.
            Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(color: c.muted, borderRadius: BorderRadius.circular(AppRadius.pill)),
              child: Row(
                children: [
                  _seg(context, 'EN', !isId),
                  _seg(context, 'ID', isId),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _seg(BuildContext context, String label, bool active) {
    final c = context.colors;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: active ? c.surface : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(label,
          style: context.text.labelMedium?.copyWith(
              color: active ? c.foreground : c.mutedForeground)),
    );
  }
}
