import type { Role } from "../generated/prisma/client";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  verifiedEmail?: boolean;
}

export interface UpdateUserPasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRoleDTO {
  role: Role;
}

export interface ToggleUserDTO {
  isActive: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  verifiedEmail?: boolean;
}

export interface UserListResponse {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
