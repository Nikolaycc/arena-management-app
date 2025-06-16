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
  status: "active" | "suspended" | "inactive";
  emailVerified: boolean;
  phoneVerified: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}
