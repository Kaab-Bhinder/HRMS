import '../../domain/entities/auth_user.dart';

/// Maps the backend user payload (`/auth/login`, `/auth/refresh`, `/auth/me`)
/// into the domain [AuthUser].
class AuthUserModel {
  static AuthUser fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      isSuperAdmin: json['isSuperAdmin'] as bool? ?? false,
      roles: (json['roles'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      permissions: (json['permissions'] as List?)?.map((e) => e.toString()).toList() ?? const [],
    );
  }
}
