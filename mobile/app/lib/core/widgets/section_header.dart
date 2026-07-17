import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Row heading used above dashboard sections: a strong title with an optional
/// trailing action (e.g. "See all").
class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.actionLabel, this.onAction});

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: context.text.titleLarge)),
        if (actionLabel != null && onAction != null)
          GestureDetector(
            onTap: onAction,
            behavior: HitTestBehavior.opaque,
            child: Text(actionLabel!, style: context.text.labelMedium?.copyWith(color: context.colors.primary)),
          ),
      ],
    );
  }
}
