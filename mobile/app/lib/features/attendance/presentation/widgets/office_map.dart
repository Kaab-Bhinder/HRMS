import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/di/providers.dart';
import '../../../../core/network/json_num.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/skeleton.dart';

/// Office location + geofence, and — for department heads — where their
/// checked-in team currently is.
///
/// The `/attendance/map` endpoint requires `attendance:track`, which only heads
/// hold. An employee calling it gets a 403, which is correct: staff should not
/// see each other's positions. So this widget asks for the team layer, and on
/// 403 quietly falls back to office-only rather than surfacing a permission
/// error the employee can do nothing about.
class OfficeMapData {
  const OfficeMapData({this.office, this.employees = const []});
  final OfficePin? office;
  final List<EmployeePin> employees;

  bool get hasOffice => office != null;
}

class OfficePin {
  const OfficePin({required this.name, required this.lat, required this.lng, required this.radiusMeters});
  final String name;
  final double lat;
  final double lng;
  final double radiusMeters;
}

class EmployeePin {
  const EmployeePin({required this.name, required this.lat, required this.lng, this.departmentName});
  final String name;
  final double lat;
  final double lng;
  final String? departmentName;

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    final a = parts.isNotEmpty && parts[0].isNotEmpty ? parts[0][0] : '';
    final b = parts.length > 1 && parts[1].isNotEmpty ? parts[1][0] : '';
    return (a + b).toUpperCase();
  }
}

final officeMapProvider = FutureProvider<OfficeMapData>((ref) async {
  final api = ref.watch(apiClientProvider);

  // Office coordinates come from attendance settings, which every signed-in
  // user may read — so the office pin works for employees and heads alike.
  OfficePin? office;
  try {
    final s = await api.get('/attendance/settings') as Map<String, dynamic>;
    final o = (s['office'] as Map?)?.cast<String, dynamic>();
    final lat = asDoubleOrNull(o?['latitude']);
    final lng = asDoubleOrNull(o?['longitude']);
    if (lat != null && lng != null) {
      office = OfficePin(
        name: o?['name']?.toString() ?? 'Office',
        lat: lat,
        lng: lng,
        radiusMeters: asDouble(o?['radiusMeters'], 150),
      );
    }
  } catch (_) {
    // Office not configured yet — the card renders its own empty state.
  }

  // Team positions: heads only. A 403 here is expected for employees.
  final pins = <EmployeePin>[];
  try {
    final m = await api.get('/attendance/map') as Map<String, dynamic>;
    for (final e in (m['employees'] as List? ?? const [])) {
      final row = (e as Map).cast<String, dynamic>();
      final lat = asDoubleOrNull(row['lat']);
      final lng = asDoubleOrNull(row['lng']);
      if (lat == null || lng == null) continue;
      pins.add(EmployeePin(
        name: row['name']?.toString() ?? 'Employee',
        lat: lat,
        lng: lng,
        departmentName: row['departmentName']?.toString(),
      ));
    }
  } catch (_) {
    // No track permission, or nobody checked in — office-only view.
  }

  return OfficeMapData(office: office, employees: pins);
});

/// Compact map card for the Home screen.
class OfficeMapCard extends ConsumerWidget {
  const OfficeMapCard({super.key, this.height = 200});
  final double height;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final async = ref.watch(officeMapProvider);

    return AppCard(
      padding: EdgeInsets.zero,
      radius: AppRadius.rXl,
      child: ClipRRect(
        borderRadius: AppRadius.rXl,
        child: SizedBox(
          height: height,
          child: async.when(
            loading: () => Skeleton(height: height),
            error: (_, _) => _Empty(message: 'Map unavailable', height: height),
            data: (d) {
              if (!d.hasOffice) {
                return _Empty(
                  message: 'No office location set yet',
                  height: height,
                );
              }
              final office = d.office!;
              final centre = LatLng(office.lat, office.lng);
              return Stack(
                children: [
                  FlutterMap(
                    options: MapOptions(
                      initialCenter: centre,
                      initialZoom: 15,
                      // A dashboard card is a glance, not a tool — dragging it
                      // inside a scrolling page fights the scroll.
                      interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        subdomains: const ['a', 'b', 'c'],
                        userAgentPackageName: 'com.hrclient.workforce',
                      ),
                      CircleLayer(
                        circles: [
                          CircleMarker(
                            point: centre,
                            radius: office.radiusMeters,
                            useRadiusInMeter: true,
                            color: c.primary.withValues(alpha: 0.12),
                            borderColor: c.primary.withValues(alpha: 0.45),
                            borderStrokeWidth: 1.5,
                          ),
                        ],
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: centre,
                            width: 34,
                            height: 34,
                            child: _Pin(color: c.primary, icon: Icons.business_rounded),
                          ),
                          for (final e in d.employees)
                            Marker(
                              point: LatLng(e.lat, e.lng),
                              width: 30,
                              height: 30,
                              child: _InitialsPin(initials: e.initials, color: c.success),
                            ),
                        ],
                      ),
                    ],
                  ),
                  // Caption strip: what the viewer is actually looking at.
                  Positioned(
                    left: 0, right: 0, bottom: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                      color: c.surface.withValues(alpha: 0.92),
                      child: Row(
                        children: [
                          Icon(Icons.place_rounded, size: 15, color: c.primary),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              office.name,
                              style: context.text.titleSmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            d.employees.isEmpty
                                ? '${office.radiusMeters.round()} m geofence'
                                : '${d.employees.length} checked in',
                            style: context.text.labelSmall?.copyWith(color: c.mutedForeground),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.message, required this.height});
  final String message;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      height: height,
      color: c.muted.withValues(alpha: 0.4),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.map_outlined, size: 26, color: c.mutedForeground),
          const SizedBox(height: AppSpacing.sm),
          Text(message, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
        ],
      ),
    );
  }
}

class _Pin extends StatelessWidget {
  const _Pin({required this.color, required this.icon});
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2.5),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Icon(icon, size: 16, color: Colors.white),
    );
  }
}

class _InitialsPin extends StatelessWidget {
  const _InitialsPin({required this.initials, required this.color});
  final String initials;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
      ),
    );
  }
}
