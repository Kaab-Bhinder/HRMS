import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/progress_ring.dart';
import '../../../../core/widgets/skeleton.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../../../access/access_providers.dart';
import '../../../payroll/presentation/screens/payslip_screen.dart';
import '../../data/location_service.dart';
import '../../data/selfie_service.dart';
import '../../domain/entities/today_status.dart';
import '../providers/attendance_controller.dart';
import '../widgets/punch_button.dart';
import 'attendance_records_screen.dart';

const _shiftTargetMinutes = 8 * 60; // assumed 8h day until shift data is wired

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _punching = false;
  bool _breaking = false;

  Future<void> _punch() async {
    setState(() => _punching = true);
    try {
      final checkedIn = await ref.read(todayControllerProvider.notifier).togglePunch();
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      AppSnackbar.show(context, checkedIn ? 'Checked in — have a great day!' : 'Checked out. See you tomorrow!', tone: SnackTone.success);
    } on SelfieCancelled {
      if (mounted) AppSnackbar.show(context, 'A selfie is needed to check in.', tone: SnackTone.neutral);
    } on LocationException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not record attendance. Try again.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _punching = false);
    }
  }

  Future<void> _break() async {
    setState(() => _breaking = true);
    try {
      final started = await ref.read(todayControllerProvider.notifier).toggleBreak();
      if (!mounted) return;
      HapticFeedback.lightImpact();
      AppSnackbar.show(context, started ? 'Break started — enjoy!' : 'Welcome back — break ended.', tone: SnackTone.success);
    } on LocationException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not update your break. Try again.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _breaking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    final todayAsync = ref.watch(todayControllerProvider);
    final checkedIn = todayAsync.valueOrNull?.isCheckedIn ?? false;
    final scope = ref.watch(meScopeProvider).valueOrNull;
    final isHead = scope?.isDeptHead ?? false;
    final roleLabel = isHead && scope?.primaryDepartment != null
        ? 'Head of ${scope!.primaryDepartment}'
        : _roleLabel(user?.roles);

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: context.colors.primary,
        backgroundColor: context.colors.surface,
        onRefresh: () async {
          ref.invalidate(teamSummaryProvider);
          await ref.read(todayControllerProvider.notifier).refresh();
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.md, AppSpacing.screen, AppSpacing.xl3),
          children: [
            _Header(name: user?.firstName ?? 'there', initials: user?.initials ?? '?', role: roleLabel, online: checkedIn)
                .animate().fadeIn(duration: 320.ms),
            const SizedBox(height: AppSpacing.xl),
            todayAsync.when(
              loading: () => const _HeroSkeleton(),
              error: (e, _) => AppCard(child: ErrorStateView(message: e is ApiException ? e.message : 'Couldn’t load today’s attendance.', onRetry: () => ref.read(todayControllerProvider.notifier).refresh())),
              data: (status) => _HeroCard(status: status, busy: _punching, breaking: _breaking, onPunch: _punch, onBreak: _break)
                  .animate().fadeIn(duration: 420.ms).moveY(begin: 14, end: 0, curve: Curves.easeOutCubic),
            ),
            if (isHead) ...[
              const SizedBox(height: AppSpacing.xl2),
              Text('Your team', style: context.text.titleLarge).animate(delay: 100.ms).fadeIn(),
              const SizedBox(height: AppSpacing.md),
              const _TeamSection(),
            ],
            const SizedBox(height: AppSpacing.xl2),
            Text('Quick actions', style: context.text.titleLarge).animate(delay: 120.ms).fadeIn(),
            const SizedBox(height: AppSpacing.md),
            const _QuickActions(),
            const SizedBox(height: AppSpacing.xl2),
            Text('Upcoming', style: context.text.titleLarge).animate(delay: 180.ms).fadeIn(),
            const SizedBox(height: AppSpacing.md),
            const _UpcomingCard(),
          ],
        ),
      ),
    );
  }

  String _roleLabel(List<String>? roles) {
    if (roles == null || roles.isEmpty) return 'Team member';
    final r = roles.first.replaceAll(RegExp('[-_]'), ' ');
    return r.split(' ').map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}').join(' ');
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.name, required this.initials, required this.role, required this.online});
  final String name;
  final String initials;
  final String role;
  final bool online;

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      children: [
        Stack(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(colors: c.primaryGradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                boxShadow: [BoxShadow(color: c.primary.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 4))],
              ),
              child: Center(child: Text(initials, style: context.text.titleMedium?.copyWith(color: c.primaryForeground, fontWeight: FontWeight.w700))),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                height: 13,
                width: 13,
                decoration: BoxDecoration(
                  color: online ? c.success : c.mutedForeground,
                  shape: BoxShape.circle,
                  border: Border.all(color: c.background, width: 2),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$_greeting,', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              Text(name, style: context.text.titleLarge, maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
        _IconBtn(icon: Icons.notifications_none_rounded, onTap: () => AppSnackbar.show(context, 'Notifications are coming soon.')),
      ],
    );
  }
}

class _IconBtn extends StatelessWidget {
  const _IconBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        height: 44,
        width: 44,
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: c.border),
        ),
        child: Icon(icon, size: 22, color: c.foreground),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.status, required this.busy, required this.breaking, required this.onPunch, required this.onBreak});
  final TodayStatus status;
  final bool busy;
  final bool breaking;
  final VoidCallback onPunch;
  final VoidCallback onBreak;

  (String, PillTone) get _chip {
    if (status.isOnBreak) return ('On break', PillTone.warning);
    if (status.isCheckedIn) return ('Checked in', PillTone.success);
    if (status.hasCheckedInToday) return ('Checked out', PillTone.accent);
    return ('Not checked in', PillTone.neutral);
  }

  String get _headline {
    if (status.isOnBreak) return 'On a break';
    if (status.isCheckedIn) return 'You’re checked in';
    if (status.hasCheckedInToday) return 'Day complete';
    return 'Ready to start';
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final (chipLabel, chipTone) = _chip;
    final fmt = DateFormat('h:mm a');
    final progress = (status.workedMinutes / _shiftTargetMinutes).clamp(0.0, 1.0);

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('TODAY', style: AppTypography.overline(c.mutedForeground)),
              const Spacer(),
              StatusPill(chipLabel, tone: chipTone),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_headline, style: context.text.headlineSmall),
                    const SizedBox(height: 4),
                    Text(DateFormat('EEEE, d MMM').format(DateTime.now()), style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                    const SizedBox(height: AppSpacing.md),
                    _miniStat(context, Icons.login_rounded, 'In', status.firstInAt == null ? '—' : fmt.format(status.firstInAt!), c.success),
                    const SizedBox(height: AppSpacing.sm),
                    _miniStat(context, Icons.logout_rounded, 'Out', status.lastOutAt == null ? '—' : fmt.format(status.lastOutAt!), c.accent),
                  ],
                ),
              ),
              ProgressRing(
                value: progress,
                size: 116,
                stroke: 11,
                center: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(status.workedLabel, style: AppTypography.numeric(22, FontWeight.w700, c.foreground)),
                    Text('of 8h', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
          PunchButton(isCheckedIn: status.isCheckedIn, busy: busy, onTap: onPunch),
          if (status.isCheckedIn) ...[
            const SizedBox(height: AppSpacing.md),
            _BreakButton(onBreak: status.isOnBreak, busy: breaking, breakLabel: status.breakLabel, onTap: onBreak),
          ],
        ],
      ),
    );
  }

  Widget _miniStat(BuildContext context, IconData icon, String label, String value, Color tone) {
    return Row(
      children: [
        Icon(icon, size: 15, color: tone),
        const SizedBox(width: 6),
        Text('$label  ', style: context.text.bodySmall?.copyWith(color: context.colors.mutedForeground)),
        Text(value, style: context.text.titleSmall),
      ],
    );
  }
}

/// Secondary control to start/end a break — outlined so it never competes with
/// the primary check-in/out button. Shows accumulated break time.
class _BreakButton extends StatelessWidget {
  const _BreakButton({required this.onBreak, required this.busy, required this.breakLabel, required this.onTap});
  final bool onBreak;
  final bool busy;
  final String breakLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final tone = onBreak ? c.warning : c.mutedForeground;
    return InkWell(
      onTap: busy ? null : onTap,
      borderRadius: AppRadius.rLg,
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          borderRadius: AppRadius.rLg,
          border: Border.all(color: onBreak ? c.warning : c.border),
          color: onBreak ? c.warning.withValues(alpha: 0.08) : null,
        ),
        child: Center(
          child: busy
              ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2.2, valueColor: AlwaysStoppedAnimation(tone)))
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(onBreak ? Icons.play_arrow_rounded : Icons.coffee_rounded, size: 20, color: tone),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      onBreak ? 'End break' : 'Start break',
                      style: context.text.titleSmall?.copyWith(color: onBreak ? c.warning : c.foreground, fontWeight: FontWeight.w600),
                    ),
                    if (breakLabel != '0m') ...[
                      const SizedBox(width: AppSpacing.sm),
                      Text('· $breakLabel', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    void go(Widget screen) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
    final items = <(IconData, String, Color, VoidCallback)>[
      (Icons.access_time_filled_rounded, 'Attendance', c.primary, () => go(const AttendanceRecordsScreen())),
      (Icons.receipt_long_rounded, 'Payslip', c.success, () => go(const PayslipScreen())),
      (Icons.event_available_rounded, 'Leave', c.info, () => AppSnackbar.show(context, 'Leave is coming soon.')),
      (Icons.folder_open_rounded, 'Documents', c.mutedForeground, () => AppSnackbar.show(context, 'Documents are coming soon.')),
    ];
    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, i) {
          final (icon, label, tone, onTap) = items[i];
          return AppCard(
            onTap: onTap,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.md),
            child: SizedBox(
              width: 66,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: BoxDecoration(color: tone.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                    child: Icon(icon, size: 20, color: tone),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(label, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: context.text.labelSmall?.copyWith(color: c.foreground, letterSpacing: 0)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard();
  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AppCard(
      child: Row(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(color: c.primary.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.event_note_rounded, color: c.primary, size: 22),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Nothing scheduled', style: context.text.titleSmall),
                const SizedBox(height: 2),
                Text('Holidays, approved leave and meetings will show up here.', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Department-head team snapshot — three role-scoped counts.
class _TeamSection extends ConsumerWidget {
  const _TeamSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final summary = ref.watch(teamSummaryProvider);
    return summary.when(
      loading: () => const Row(
        children: [
          Expanded(child: AppCard(child: Skeleton(height: 52))),
          SizedBox(width: AppSpacing.md),
          Expanded(child: AppCard(child: Skeleton(height: 52))),
          SizedBox(width: AppSpacing.md),
          Expanded(child: AppCard(child: Skeleton(height: 52))),
        ],
      ),
      error: (_, _) => AppCard(child: Text('Couldn’t load your team.', style: context.text.bodySmall?.copyWith(color: c.mutedForeground))),
      data: (s) => Row(
        children: [
          _TeamStat(icon: Icons.groups_rounded, label: 'Members', value: s.members, tone: c.primary),
          const SizedBox(width: AppSpacing.md),
          _TeamStat(icon: Icons.pending_actions_rounded, label: 'Approvals', value: s.pendingApprovals, tone: c.warning),
          const SizedBox(width: AppSpacing.md),
          _TeamStat(icon: Icons.trending_up_rounded, label: 'Active tasks', value: s.openTasks, tone: c.accent),
        ],
      ),
    );
  }
}

class _TeamStat extends StatelessWidget {
  const _TeamStat({required this.icon, required this.label, required this.value, required this.tone});
  final IconData icon;
  final String label;
  final int value;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: AppCard(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.md),
        child: Column(
          children: [
            Container(
              height: 34,
              width: 34,
              decoration: BoxDecoration(color: tone.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, size: 18, color: tone),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text('$value', style: AppTypography.numeric(22, FontWeight.w700, context.colors.foreground)),
            Text(label, textAlign: TextAlign.center, style: context.text.bodySmall?.copyWith(color: context.colors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}

class _HeroSkeleton extends StatelessWidget {
  const _HeroSkeleton();
  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Skeleton(width: 70, height: 12),
          SizedBox(height: AppSpacing.lg),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Skeleton(width: 150, height: 22),
              SizedBox(height: AppSpacing.sm),
              Skeleton(width: 110, height: 12),
            ])),
            Skeleton(width: 116, height: 116, radius: 58),
          ]),
          SizedBox(height: AppSpacing.xl),
          Skeleton(height: 66, radius: AppRadius.xl),
        ],
      ),
    );
  }
}
