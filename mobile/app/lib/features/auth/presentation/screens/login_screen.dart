import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_shadows.dart';
import '../../../../core/widgets/ambient_background.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../providers/auth_controller.dart';
import '../../../../core/i18n/app_i18n.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _emailError;
  String? _passwordError;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  bool _validate() {
    setState(() {
      _emailError = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(_email.text.trim()) ? null : 'Enter a valid email address';
      _passwordError = _password.text.isEmpty ? 'Enter your password' : null;
    });
    return _emailError == null && _passwordError == null;
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authControllerProvider.notifier).login(email: _email.text.trim(), password: _password.text);
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Unable to sign in. Please try again.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _soon(String what) => AppSnackbar.show(context, '$what is coming soon.');

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final dark = context.isDark;
    return Scaffold(
      resizeToAvoidBottomInset: true,
      // Solid theme surfaces instead of a translucent card over a photo: text
      // now sits on the same foreground/surface tokens every other screen uses,
      // so contrast is guaranteed in both light and dark rather than fighting a
      // busy background image.
      body: AmbientBackground(
        child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.xl3, AppSpacing.screen, AppSpacing.xl),
              child: Column(
                children: [
                  _GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Center(child: _BankMedallion(color: c.primary)),
                        const SizedBox(height: AppSpacing.xl),
                        Text(context.tr('Welcome back'), textAlign: TextAlign.center, style: context.text.displaySmall?.copyWith(color: c.primary, fontWeight: FontWeight.w800)),
                        const SizedBox(height: AppSpacing.sm),
                        Text(context.tr('Enter your credentials to access Prima'),
                            textAlign: TextAlign.center, style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
                        const SizedBox(height: AppSpacing.xl2),
                        _Label(context.tr('Email address').toUpperCase()),
                        const SizedBox(height: AppSpacing.sm),
                        _GlassField(
                          controller: _email,
                          hint: 'name@company.com',
                          icon: Icons.mail_outline_rounded,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          enabled: !_loading,
                          error: _emailError,
                          onChanged: () { if (_emailError != null) setState(() => _emailError = null); },
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        Row(
                          children: [
                            _Label(context.tr('Password').toUpperCase()),
                            const Spacer(),
                            GestureDetector(
                              onTap: () => _soon('Password reset'),
                              child: Text('Forgot password?', style: context.text.labelMedium?.copyWith(color: c.primary)),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        _GlassField(
                          controller: _password,
                          hint: '••••••••',
                          icon: Icons.lock_outline_rounded,
                          obscure: _obscure,
                          textInputAction: TextInputAction.done,
                          enabled: !_loading,
                          error: _passwordError,
                          onSubmitted: _submit,
                          onChanged: () { if (_passwordError != null) setState(() => _passwordError = null); },
                          suffix: IconButton(
                            onPressed: () => setState(() => _obscure = !_obscure),
                            icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: c.mutedForeground),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl2),
                        AppButton(label: context.tr('Sign in'), icon: Icons.arrow_forward_rounded, loading: _loading, onPressed: _submit),
                      ],
                    ),
                  ).animate().fadeIn(duration: 500.ms).moveY(begin: 16, end: 0, curve: Curves.easeOutCubic),
                  const SizedBox(height: AppSpacing.xl2),
                  _Footer(dark: dark).animate(delay: 200.ms).fadeIn(duration: 500.ms),
                ],
              ),
            ),
        ),
      ),
    );
  }
}

/// Solid surface card — legible in both themes because it uses the same
/// surface/border tokens as the rest of the app rather than translucency.
class _GlassCard extends StatelessWidget {
  const _GlassCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: AppSpacing.xl2),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(AppRadius.xl2),
        border: Border.all(color: c.border),
        boxShadow: AppShadows.raised(c.shadow, dark: context.isDark),
      ),
      child: child,
    );
  }
}

class _BankMedallion extends StatelessWidget {
  const _BankMedallion({required this.color});
  final Color color;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 68,
      width: 68,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.18),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Icon(Icons.account_balance_rounded, color: color, size: 30),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;
  @override
  Widget build(BuildContext context) =>
      Text(text, style: context.text.labelSmall?.copyWith(color: context.colors.mutedForeground, letterSpacing: 1.1));
}

/// Translucent input that reads well over the glass card.
class _GlassField extends StatelessWidget {
  const _GlassField({
    required this.controller,
    required this.hint,
    required this.icon,
    this.obscure = false,
    this.keyboardType,
    this.textInputAction,
    this.enabled = true,
    this.error,
    this.suffix,
    this.onChanged,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool obscure;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool enabled;
  final String? error;
  final Widget? suffix;
  final VoidCallback? onChanged;
  final VoidCallback? onSubmitted;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final fill = c.muted;
    final border = error != null ? c.danger : c.border;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscure,
          enabled: enabled,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          onChanged: (_) => onChanged?.call(),
          onSubmitted: (_) => onSubmitted?.call(),
          style: context.text.bodyLarge,
          cursorColor: c.primary,
          decoration: InputDecoration(
            filled: true,
            fillColor: fill,
            hintText: hint,
            prefixIcon: Icon(icon, size: 20, color: c.mutedForeground),
            suffixIcon: suffix,
            enabledBorder: OutlineInputBorder(borderRadius: AppRadius.rMd, borderSide: BorderSide(color: border)),
            focusedBorder: OutlineInputBorder(borderRadius: AppRadius.rMd, borderSide: BorderSide(color: error != null ? c.danger : c.primary, width: 1.6)),
            disabledBorder: OutlineInputBorder(borderRadius: AppRadius.rMd, borderSide: BorderSide(color: border)),
          ),
        ),
        if (error != null)
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xs, left: 2),
            child: Text(error!, style: context.text.bodySmall?.copyWith(color: c.danger)),
          ),
      ],
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.dark});
  final bool dark;
  @override
  Widget build(BuildContext context) {
    final onImg = context.colors.mutedForeground;
    final style = context.text.bodySmall?.copyWith(color: onImg);
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.verified_user_outlined, size: 14, color: onImg),
            const SizedBox(width: 6),
            Text('SECURED WITH END-TO-END ENCRYPTION', style: context.text.labelSmall?.copyWith(color: onImg, letterSpacing: 0.6)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Text('Security Policy   ·   Privacy Center', style: style),
        const SizedBox(height: AppSpacing.xs),
        Text('© 2026 Prima · Protected by 256-bit AES', style: style),
      ],
    );
  }
}
