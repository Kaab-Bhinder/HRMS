/// The authenticated user, as the app cares about it (framework-free domain type).
class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.roles,
    required this.permissions,
    this.isSuperAdmin = false,
  });

  final String id;
  final String email;
  final String fullName;
  final List<String> roles;
  final List<String> permissions;
  final bool isSuperAdmin;

  bool can(String permission) =>
      isSuperAdmin || permissions.contains('*') || permissions.contains(permission);

  String get initials {
    final parts = fullName.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
  }

  String get firstName => fullName.trim().split(RegExp(r'\s+')).first;
}
