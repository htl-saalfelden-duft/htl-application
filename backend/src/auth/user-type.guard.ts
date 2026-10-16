import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from './public.decorator'
import { ADMIN_ONLY_KEY, ALLOW_APPLICANT_KEY } from './access.decorator'
import { JwtTokenPayload } from './jwt-token-payload.model'
import { PrismaService } from 'src/prisma.service'
import { ApiError, ApiErrorType } from 'src/common/api-error'

// Runs after JwtAuthGuard (both registered as APP_GUARD in auth.module.ts)
@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()]

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true
    }

    const user: JwtTokenPayload = context.switchToHttp().getRequest().user

    if (user?.userType === 'applicant') {
      if (this.reflector.getAllAndOverride<boolean>(ALLOW_APPLICANT_KEY, targets)) {
        return true
      }
      throw new ApiError(ApiErrorType.FORBIDDEN)
    }

    if (user?.userType === 'administration') {
      if (!this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, targets)) {
        return true
      }
      const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } })
      if (dbUser?.active && dbUser.userRoleKey === 'admin') {
        return true
      }
    }

    throw new ApiError(ApiErrorType.FORBIDDEN)
  }
}
