import { SetMetadata } from '@nestjs/common'

// Endpoints are restricted to administration users by default (see UserTypeGuard).
// @AllowApplicant() additionally opens an endpoint (or a whole controller) for applicants.
export const ALLOW_APPLICANT_KEY = 'allowApplicant'
export const AllowApplicant = () => SetMetadata(ALLOW_APPLICANT_KEY, true)

// @AdminOnly() restricts an endpoint to administration users with userRoleKey 'admin'.
export const ADMIN_ONLY_KEY = 'adminOnly'
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true)
