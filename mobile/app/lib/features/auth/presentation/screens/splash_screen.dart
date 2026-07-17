import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/brand_mark.dart';
import '../providers/auth_controller.dart';

/// Branded entry over the architectural night vista. Plays a short medallion +
/// progress animation while the session is restored; the router redirects once
/// auth resolves. Uses the dark treatment in both themes — it's a brand moment.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Hold the splash long enough for the entrance + progress bar to complete,
    // so it transitions to login gracefully instead of flashing past.
    Future.delayed(const Duration(milliseconds: 2400), () {
      if (mounted) ref.read(authControllerProvider.notifier).restore();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Splash always uses the dark, light-on-image treatment for a premium feel.
    const c = AppColors.dark;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: c.background,
        body: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(AppAssets.authBackground(Brightness.dark), fit: BoxFit.cover),
            // Legibility scrim + vignette.
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.45),
                    Colors.black.withValues(alpha: 0.12),
                    Colors.black.withValues(alpha: 0.65),
                  ],
                  stops: const [0, 0.45, 1],
                ),
              ),
            ),
            SafeArea(
              child: Column(
                children: [
                  const Spacer(flex: 5),
                  const BrandMark(size: 132, radius: 34)
                      .animate()
                      .scale(begin: const Offset(0.72, 0.72), end: const Offset(1, 1), duration: 620.ms, curve: Curves.easeOutBack)
                      .fadeIn(duration: 420.ms),
                  const SizedBox(height: AppSpacing.xl2),
                  Text(
                    'Banking-grade Security.',
                    style: AppTypography.build(Colors.white, Colors.white70).titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                  ).animate(delay: 260.ms).fadeIn(duration: 520.ms).moveY(begin: 10, end: 0, curve: Curves.easeOutCubic),
                  const Spacer(flex: 6),
                  const _SecureTunnelBar(),
                  const SizedBox(height: AppSpacing.xl3),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A thin blue→gold progress bar that fills once, with an uppercase status line.
class _SecureTunnelBar extends StatelessWidget {
  const _SecureTunnelBar();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: 180,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: Stack(
              children: [
                Container(height: 4, color: Colors.white.withValues(alpha: 0.14)),
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 2200),
                  curve: Curves.easeInOut,
                  builder: (context, t, _) => FractionallySizedBox(
                    widthFactor: t,
                    child: Container(
                      height: 4,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF2E6DB4), Color(0xFFE0AC43)]),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          'ESTABLISHING SECURE TUNNEL…',
          style: AppTypography.overline(Colors.white.withValues(alpha: 0.55)).copyWith(letterSpacing: 2),
        ).animate(delay: 500.ms).fadeIn(duration: 600.ms),
      ],
    );
  }
}
