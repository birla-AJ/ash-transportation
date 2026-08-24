import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type UserRole = 'super_admin' | 'sub_admin' | 'admin';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
