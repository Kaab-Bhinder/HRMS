// Smoke test: the design-system BrandMark renders without throwing.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wms_mobile/core/theme/app_theme.dart';
import 'package:wms_mobile/core/widgets/brand_mark.dart';

void main() {
  testWidgets('BrandMark renders', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: const Scaffold(body: Center(child: BrandMark())),
      ),
    );
    expect(find.byType(BrandMark), findsOneWidget);
  });
}
