import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/hero_surface.dart';
import '../../../core/widgets/app_snackbar.dart';
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
            _Row(icon: Icons.lock_outline_rounded, label: 'Change password', onTap: () => soon('Change password')),
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
