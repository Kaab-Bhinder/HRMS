import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/ambient_background.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_states.dart';
import '../../../../core/widgets/hero_surface.dart';
import '../../../../core/widgets/skeleton.dart';
import '../../../../core/widgets/soft_tile.dart';
import '../../../../core/widgets/week_bars.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../../../access/access_providers.dart';
import '../../../leave/leave_providers.dart';
import '../../../payroll/presentation/screens/payslip_screen.dart';
import '../../../face/data/face_repository.dart';
import '../../../face/presentation/face_enrollment_screen.dart';
import '../providers/records_provider.dart';
import '../../data/location_service.dart';
import '../../data/selfie_service.dart';
import '../../domain/entities/today_status.dart';
import '../providers/attendance_controller.dart';
import '../providers/shift_provider.dart';
import '../widgets/punch_button.dart';
import '../widgets/check_in_sheet.dart';
import '../../../notifications/notifications_screen.dart';
import 'attendance_records_screen.dart';
import '../../../../core/i18n/app_i18n.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _punching = false;
  bool _breaking = false;
  static bool _enrollPrompted = false; // once per app session

  @override
  void initState() {
    super.initState();
    // First-login Face ID gate — the mobile twin of the web's setup wizard:
    // no reference face on file → enrollment opens before anything else.
    // Backing out is allowed (browsing is fine), but check-in stays locked
    // until enrollment succeeds.
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (_enrollPrompted || !mounted) return;
      try {
        final status = await ref.read(faceStatusProvider.future);
        if (!status.enrolled && mounted && !_enrollPrompted) {
          _enrollPrompted = true;
          await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const FaceEnrollmentScreen()),
          );
        }
      } catch (_) {
        // Offline or old server — the check-in gate still enforces enrollment.
      }
    });
  }

  Future<void> _punch() async {
    // Checking IN is the guided three-step flow: a selfie and a GPS fix are both
    // recorded against the entry, so the employee sees and confirms each before
    // anything is committed. Checking OUT needs neither, so it stays one tap.
    final checkedInNow = ref.read(todayControllerProvider).valueOrNull?.isCheckedIn ?? false;
    if (!checkedInNow) {
      await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        isDismissible: false,
        builder: (_) => const CheckInSheet(),
      );
      return;
    }

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

    return AmbientBackground(
      child: SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: context.colors.primary,
        backgroundColor: context.colors.surface,
        onRefresh: () async {
          ref.invalidate(teamSummaryProvider);
          ref.invalidate(myLeaveBalancesProvider);
          ref.invalidate(mySlipProvider);
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
              data: (status) => _HeroCard(
                status: status,
                target: ref.watch(shiftTargetProvider).valueOrNull ?? ShiftTarget.fallback,
                busy: _punching, breaking: _breaking, onPunch: _punch, onBreak: _break,
              )
                  .animate().fadeIn(duration: 420.ms).moveY(begin: 14, end: 0, curve: Curves.easeOutCubic),
            ),
            if (isHead) ...[
              const SizedBox(height: AppSpacing.xl2),
              Text(context.tr('Your team'), style: context.text.titleLarge).animate(delay: 100.ms).fadeIn(),
              const SizedBox(height: AppSpacing.md),
              const _TeamSection(),
            ],
            // Employees see who leads their department (their approver for
            // leave and the person who assigns their tasks).
            if (scope != null && scope.hasDepartmentHead) ...[
              const SizedBox(height: AppSpacing.xl2),
              Text(context.tr('Your department'), style: context.text.titleLarge).animate(delay: 100.ms).fadeIn(),
              const SizedBox(height: AppSpacing.md),
              _DeptHeadCard(
                department: scope.departmentName,
                head: scope.departmentHeadName!,
                email: scope.departmentHeadEmail,
              ).animate(delay: 140.ms).fadeIn(),
            ],
            const SizedBox(height: AppSpacing.xl2),
            const _WeekChartCard(),
            const SizedBox(height: AppSpacing.xl2),
            Text(context.tr('Quick actions'), style: context.text.titleLarge).animate(delay: 140.ms).fadeIn(),
            const SizedBox(height: AppSpacing.md),
            const _QuickActions(),
            const SizedBox(height: AppSpacing.xl2),
            Text('Upcoming', style: context.text.titleLarge).animate(delay: 180.ms).fadeIn(),
            const SizedBox(height: AppSpacing.md),
            const _UpcomingCard(),
          ],
        ),
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
              Text(DateFormat('EEEE, d MMMM').format(DateTime.now()),
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              const SizedBox(height: 1),
              Text('${context.tr(_greeting)}, $name',
                  style: context.text.headlineSmall, maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
        const _NotificationBell(),
      ],
    );
  }
}

/// Bell with an unread badge. Reads the same count the Notifications screen
/// does, so opening the screen and marking read updates the badge too.
class _NotificationBell extends ConsumerWidget {
  const _NotificationBell();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final unread = ref.watch(unreadCountProvider).valueOrNull ?? 0;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        _IconBtn(
          icon: Icons.notifications_none_rounded,
          onTap: () async {
            await Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            );
            ref.invalidate(unreadCountProvider);
          },
        ),
        if (unread > 0)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              constraints: const BoxConstraints(minWidth: 18),
              decoration: BoxDecoration(
                color: c.danger,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: c.background, width: 2),
              ),
              child: Text(
                unread > 99 ? '99+' : '$unread',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ),
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
  const _HeroCard({
    required this.status,
    required this.target,
    required this.busy,
    required this.breaking,
    required this.onPunch,
    required this.onBreak,
  });
  final TodayStatus status;
  final ShiftTarget target;
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
    final (chipLabel, chipTone) = _chip;
    final fmt = DateFormat('h:mm a');
    final progress = (status.workedMinutes / target.targetMinutes).clamp(0.0, 1.0);

    // The dot color has to read against the gradient, so these are fixed
    // on-hero values rather than the theme's success/warning tokens.
    final dot = switch (chipTone) {
      PillTone.success => const Color(0xFF5BE0A8),
      PillTone.warning => const Color(0xFFF5C56B),
      PillTone.accent => const Color(0xFF9DC2F0),
      _ => HeroSurface.onHeroMuted,
    };

    return Column(
      children: [
        HeroSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('TODAY', style: AppTypography.overline(HeroSurface.onHeroMuted)),
                  const Spacer(),
                  HeroChip(label: chipLabel, tone: dot),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(_headline,
                  style: context.text.titleMedium?.copyWith(color: HeroSurface.onHeroMuted)),
              const SizedBox(height: 2),
              // The single number this screen exists to show.
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(status.workedLabel,
                      style: AppTypography.numeric(40, FontWeight.w700, HeroSurface.onHero)),
                  const SizedBox(width: AppSpacing.sm),
                  Text('of ${target.label}',
                      style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted)),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  Expanded(child: _HeroProgress(value: progress)),
                  const SizedBox(width: AppSpacing.md),
                  Text('${(progress * 100).round()}%',
                      style: context.text.labelMedium?.copyWith(color: HeroSurface.onHero)),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Divider(height: 1, color: Colors.white.withValues(alpha: 0.14)),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _heroStat(context, 'First in',
                        status.firstInAt == null ? '—' : fmt.format(status.firstInAt!)),
                  ),
                  Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.14)),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: _heroStat(context, 'Last out',
                        status.lastOutAt == null ? '—' : fmt.format(status.lastOutAt!)),
                  ),
                ],
              ),
            ],
          ),
        ),
        // The primary action sits below the hero rather than inside it, so it
        // reads as a control and not as part of the readout.
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(child: PunchButton(isCheckedIn: status.isCheckedIn, busy: busy, onTap: onPunch)),
            if (status.isCheckedIn) ...[
              const SizedBox(width: AppSpacing.md),
              _BreakButton(
                onBreak: status.isOnBreak,
                busy: breaking,
                breakLabel: status.breakLabel,
                onTap: onBreak,
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _heroStat(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: context.text.bodySmall?.copyWith(color: HeroSurface.onHeroMuted)),
        const SizedBox(height: 2),
        Text(value, style: context.text.titleMedium?.copyWith(color: HeroSurface.onHero)),
      ],
    );
  }
}

/// Slim progress track drawn in on-hero whites so it stays legible over the
/// gradient, where the usual muted/primary tokens would disappear.
class _HeroProgress extends StatelessWidget {
  const _HeroProgress({required this.value});
  final double value;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: Stack(
        children: [
          Container(height: 7, color: Colors.white.withValues(alpha: 0.18)),
          LayoutBuilder(
            builder: (context, box) => AnimatedContainer(
              duration: const Duration(milliseconds: 420),
              curve: Curves.easeOutCubic,
              height: 7,
              width: box.maxWidth * value,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.pill),
                gradient: const LinearGradient(
                  colors: [Color(0xFF8FD8FF), Color(0xFF5BE0A8)],
                ),
              ),
            ),
          ),
        ],
      ),
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

class _QuickActions extends ConsumerWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    void go(Widget screen) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));

    // Each tile carries a live figure so the grid is a status readout, not just
    // a menu. Values resolve independently — a tile that has no number yet
    // simply shows its caption rather than blocking the whole row.
    final month = ref.watch(mySlipProvider(DateTime(DateTime.now().year, DateTime.now().month)));
    final balances = ref.watch(myLeaveBalancesProvider);

    final annual = balances.valueOrNull
        ?.where((b) => !b.isAdditional)
        .fold<double?>(null, (sum, b) => (sum ?? 0) + (b.remaining ?? 0));

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.42,
      children: [
        SoftTile(
          icon: Icons.access_time_filled_rounded,
          title: 'Attendance',
          tone: AppColors.swatches[0],
          value: month.valueOrNull == null ? null : '${month.valueOrNull!.present} days',
          caption: 'present this month',
          onTap: () => go(const AttendanceRecordsScreen()),
        ),
        SoftTile(
          icon: Icons.event_available_rounded,
          title: 'Leave',
          tone: AppColors.swatches[2],
          value: annual == null ? null : '${_trim(annual)} days',
          caption: 'annual leave left',
          onTap: () => AppSnackbar.show(context, 'Open the Leave tab to apply.'),
        ),
        SoftTile(
          icon: Icons.receipt_long_rounded,
          title: 'Payslip',
          tone: AppColors.swatches[3],
          caption: 'this month so far',
          onTap: () => go(const PayslipScreen()),
        ),
        SoftTile(
          icon: Icons.folder_open_rounded,
          title: 'Documents',
          tone: AppColors.swatches[4],
          caption: 'coming soon',
          onTap: () => AppSnackbar.show(context, 'Documents are coming soon.'),
        ),
      ],
    );
  }

  /// Drop a trailing ".0" so 17.0 reads as 17 but a half-day stays 0.5.
  static String _trim(double v) =>
      v == v.roundToDouble() ? v.toInt().toString() : v.toStringAsFixed(1);
}

/// Hours worked over the last seven calendar days.
///
/// Reuses this month's slip rather than adding an endpoint. A week that spans a
/// month boundary therefore only shows the days inside the current month — the
/// chart is a trend cue, and the Attendance tab is the full record.
/// Hours worked over the last seven days, as bars.
///
/// Reuses this month's slip rather than adding an endpoint, so a week spanning
/// a month boundary shows only the days inside the current month — a trend cue,
/// with the Attendance tab holding the full record.
class _WeekChartCard extends ConsumerWidget {
  const _WeekChartCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final now = DateTime.now();
    final slip = ref.watch(mySlipProvider(DateTime(now.year, now.month)));

    return AppCard(
      radius: AppRadius.rXl,
      child: slip.when(
        loading: () => const Skeleton(height: 176),
        error: (_, _) => SizedBox(
          height: 176,
          child: Center(
            child: Text('Couldn’t load this week.',
                style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          ),
        ),
        data: (s) {
          // `days` arrives newest-first; flip so the week reads left-to-right.
          final recent = s.days.take(7).toList().reversed.toList();
          final today = DateTime(now.year, now.month, now.day);
          final bars = [
            for (final d in recent)
              DayBar(
                label: DateFormat('E').format(d.date).substring(0, 3),
                hours: d.workedMinutes / 60,
                isToday: DateTime(d.date.year, d.date.month, d.date.day) == today,
              ),
          ];
          final total = recent.fold<int>(0, (sum, d) => sum + d.workedMinutes);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(context.tr('This week'), style: context.text.titleLarge),
                  const SizedBox(width: AppSpacing.sm),
                  Text(_hm(total),
                      style: context.text.titleSmall?.copyWith(color: c.mutedForeground)),
                  const Spacer(),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const AttendanceRecordsScreen()),
                    ),
                    child: Row(
                      children: [
                        Text('See all',
                            style: context.text.labelMedium?.copyWith(color: c.primary)),
                        Icon(Icons.chevron_right_rounded, size: 16, color: c.primary),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              WeekBars(days: bars),
            ],
          );
        },
      ),
    );
  }

  static String _hm(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m == 0 ? '${h}h' : '${h}h ${m}m';
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

/// Who leads this employee's department — their task assigner and leave approver.
class _DeptHeadCard extends StatelessWidget {
  const _DeptHeadCard({required this.department, required this.head, this.email});
  final String? department;
  final String head;
  final String? email;

  String get _initials {
    final parts = head.trim().split(RegExp(r'\s+'));
    final a = parts.isNotEmpty && parts[0].isNotEmpty ? parts[0][0] : '';
    final b = parts.length > 1 && parts[1].isNotEmpty ? parts[1][0] : '';
    return (a + b).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AppCard(
      child: Row(
        children: [
          Container(
            height: 46,
            width: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(colors: c.primaryGradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
            ),
            child: Center(
              child: Text(_initials,
                  style: context.text.titleSmall?.copyWith(color: c.primaryForeground, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(head, style: context.text.titleSmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(
                  department == null ? 'Department head' : 'Head of $department',
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if ((email ?? '').isNotEmpty)
                  Text(email!,
                      style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          StatusPill('Your approver', tone: PillTone.accent),
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
