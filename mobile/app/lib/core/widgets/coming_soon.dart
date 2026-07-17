import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';

/// Placeholder tab shown for features that aren't built yet — kept intentionally
/// elegant (soft icon medallion + copy) so unfinished areas still feel premium.
class ComingSoon extends StatelessWidget {
  const ComingSoon({super.key, required this.title, required this.icon, required this.message});
  final String title;
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.lg, AppSpacing.screen, 0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(title, style: context.text.headlineMedium),
            ),
          ),
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl2),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      height: 76,
                      width: 76,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [c.primary.withValues(alpha: 0.16), c.accent.withValues(alpha: 0.12)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Icon(icon, size: 34, color: c.primary),
                    ).animate().scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1), duration: 420.ms, curve: Curves.easeOutBack),
                    const SizedBox(height: AppSpacing.xl),
                    Text('Coming soon', style: context.text.titleLarge),
                    const SizedBox(height: AppSpacing.sm),
                    Text(message, textAlign: TextAlign.center, style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
