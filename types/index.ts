export interface User {
  id: string;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  birthDate?: string;
  address?: string;
  adult: boolean;
  gender: "M" | "F" | "O";
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  emailVerified: boolean;
  phoneVerified: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  permissionNames: string[];
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: User;
  permissions?: UserPermissions;
  expiresAt: number;
}
