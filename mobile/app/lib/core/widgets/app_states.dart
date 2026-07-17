import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import 'app_button.dart';

/// Friendly empty state — a soft icon medallion, a headline, a hint, and an
/// optional action. Reused everywhere a list or panel has nothing to show.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 64,
              width: 64,
              decoration: BoxDecoration(color: c.primary.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(20)),
              child: Icon(icon, size: 28, color: c.primary),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(title, textAlign: TextAlign.center, style: context.text.titleLarge),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(message!, textAlign: TextAlign.center, style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: AppSpacing.xl),
              AppButton(label: actionLabel!, onPressed: onAction, expand: false),
            ],
          ],
        ),
      ).animate().fadeIn(duration: 300.ms).moveY(begin: 8, end: 0, curve: Curves.easeOutCubic),
    );
  }
}

/// Error state with a retry affordance. Keeps the tone calm, not alarming.
class ErrorStateView extends StatelessWidget {
  const ErrorStateView({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 64,
              width: 64,
              decoration: BoxDecoration(color: c.danger.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(20)),
              child: Icon(Icons.wifi_tethering_error_rounded, size: 28, color: c.danger),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Something went wrong', style: context.text.titleLarge),
            const SizedBox(height: AppSpacing.sm),
            Text(message, textAlign: TextAlign.center, style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.xl),
              AppButton(label: 'Try again', icon: Icons.refresh_rounded, onPressed: onRetry, variant: AppButtonVariant.secondary, expand: false),
            ],
          ],
        ),
      ),
    );
  }
}
