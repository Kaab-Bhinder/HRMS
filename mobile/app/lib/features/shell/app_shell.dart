import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/coming_soon.dart';
import '../attendance/presentation/screens/home_screen.dart';
import '../profile/presentation/profile_screen.dart';
import '../tasks/presentation/tasks_screen.dart';

/// The authenticated app frame: a bottom-nav shell that keeps each tab alive via
/// an IndexedStack. Home is real; the other tabs are polished placeholders until
/// their features land.
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
        body: IndexedStack(
          index: _index,
          children: const [
            HomeScreen(),
            ComingSoon(title: 'Attendance', icon: Icons.access_time_filled_rounded, message: 'Your attendance history, shifts and check-in log will live here.'),
            ComingSoon(title: 'Leave', icon: Icons.event_available_rounded, message: 'Request time off and track your balances and approvals.'),
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
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        border: Border(top: BorderSide(color: c.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 62,
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
    final color = selected ? c.primary : c.mutedForeground;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
            decoration: BoxDecoration(
              color: selected ? c.primary.withValues(alpha: 0.12) : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
            child: Icon(selected ? spec.activeIcon : spec.icon, size: 22, color: color),
          ),
          const SizedBox(height: 3),
          Text(
            spec.label,
            style: context.text.labelSmall?.copyWith(
              color: color,
              letterSpacing: 0.2,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
