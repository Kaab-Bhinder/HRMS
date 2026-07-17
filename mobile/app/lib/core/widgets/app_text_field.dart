import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_spacing.dart';
import '../theme/app_motion.dart';

/// Labelled text field with a focus-reactive prefix icon and inline error.
/// Wraps the themed [TextField] so every form input looks identical.
class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.prefixIcon,
    this.obscure = false,
    this.keyboardType,
    this.textInputAction,
    this.error,
    this.enabled = true,
    this.autofillHints,
    this.onSubmitted,
    this.onChanged,
  });

  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final IconData? prefixIcon;
  final bool obscure;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final String? error;
  final bool enabled;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onSubmitted;
  final ValueChanged<String>? onChanged;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late final FocusNode _focus = FocusNode()..addListener(() => setState(() {}));
  late bool _obscured = widget.obscure;

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final focused = _focus.hasFocus;
    final hasError = widget.error != null;
    final accent = hasError ? c.danger : (focused ? c.primary : c.mutedForeground);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: context.text.titleSmall),
          const SizedBox(height: AppSpacing.sm),
        ],
        TextField(
          controller: widget.controller,
          focusNode: _focus,
          obscureText: _obscured,
          enabled: widget.enabled,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          autofillHints: widget.autofillHints,
          onSubmitted: widget.onSubmitted,
          onChanged: widget.onChanged,
          style: context.text.bodyLarge,
          cursorColor: c.primary,
          cursorRadius: const Radius.circular(2),
          decoration: InputDecoration(
            hintText: widget.hint,
            prefixIcon: widget.prefixIcon == null
                ? null
                : AnimatedContainer(
                    duration: AppMotion.fast,
                    child: Icon(widget.prefixIcon, size: 20, color: accent),
                  ),
            suffixIcon: widget.obscure
                ? IconButton(
                    onPressed: () => setState(() => _obscured = !_obscured),
                    icon: Icon(_obscured ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20),
                    color: c.mutedForeground,
                    splashRadius: 20,
                  )
                : null,
          ),
        ),
        AnimatedSize(
          duration: AppMotion.fast,
          curve: AppMotion.standard,
          alignment: Alignment.topLeft,
          child: hasError
              ? Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xs, left: 2),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline_rounded, size: 14, color: c.danger),
                      const SizedBox(width: 4),
                      Expanded(child: Text(widget.error!, style: context.text.bodySmall?.copyWith(color: c.danger))),
                    ],
                  ),
                )
              : const SizedBox(width: double.infinity),
        ),
      ],
    );
  }
}
