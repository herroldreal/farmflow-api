import { Roles } from '@base/roles';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Role = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
