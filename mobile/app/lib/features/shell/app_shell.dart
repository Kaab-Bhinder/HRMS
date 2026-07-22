import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_shadows.dart';
import '../attendance/presentation/screens/attendance_records_screen.dart';
import '../attendance/presentation/screens/home_screen.dart';
import '../leave/leave_screen.dart';
import '../profile/presentation/profile_screen.dart';
import '../tasks/presentation/tasks_screen.dart';

/// The authenticated app frame: a bottom-nav shell that keeps each tab alive via
/// an IndexedStack. Every tab is a real feature.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  static const _tabs = <_TabSpec>[
    _TabSpec('Home', Icons.grid_view_rounded, Icons.grid_view_rounded),
    _TabSpec('Attendance', Icons.access_time_rounded, Icons.access_time_filled_rounded),
    _TabSpec('Leave', Icons.event_available_outlined, Icons.event_available_rounded),
    _TabSpec('Tasks', Icons.checklist_outlined, Icons.checklist_rounded),
    _TabSpec('Profile', Icons.person_outline_rounded, Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: context.isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: c.background,
        // The nav floats over the content, so the page's ambient wash runs to
        // the bottom edge instead of stopping at a hard rule.
        extendBody: true,
        body: IndexedStack(
          index: _index,
          children: const [
            HomeScreen(),
            AttendanceRecordsScreen(embedded: true),
            LeaveScreen(),
            TasksScreen(),
            ProfileScreen(),
          ],
        ),
        bottomNavigationBar: _BottomNav(
          tabs: _tabs,
          index: _index,
          onTap: (i) {
            if (i != _index) {
              HapticFeedback.selectionClick();
              setState(() => _index = i);
            }
          },
        ),
      ),
    );
  }
}

class _TabSpec {
  const _TabSpec(this.label, this.icon, this.activeIcon);
  final String label;
  final IconData icon;
  final IconData activeIcon;
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({required this.tabs, required this.index, required this.onTap});
  final List<_TabSpec> tabs;
  final int index;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
        child: Container(
          height: 66,
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(AppRadius.xl2),
            border: Border.all(color: c.border),
            boxShadow: AppShadows.raised(c.shadow, dark: context.isDark),
          ),
          child: Row(
            children: [
              for (var i = 0; i < tabs.length; i++)
                Expanded(child: _NavItem(spec: tabs[i], selected: i == index, onTap: () => onTap(i))),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.spec, required this.selected, required this.onTap});
  final _TabSpec spec;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 6),
            decoration: BoxDecoration(
              // Solid fill when active: at five tabs a faint tint is too weak to
              // find at a glance.
              gradient: selected
                  ? LinearGradient(
                      colors: c.primaryGradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              boxShadow: selected ? AppShadows.glow(c.primary, opacity: 0.30, blur: 12, y: 4) : null,
            ),
            child: Icon(
              selected ? spec.activeIcon : spec.icon,
              size: 21,
              color: selected ? c.primaryForeground : c.mutedForeground,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            context.tr(spec.label),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: context.text.labelSmall?.copyWith(
              color: selected ? c.foreground : c.mutedForeground,
              letterSpacing: 0.1,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
