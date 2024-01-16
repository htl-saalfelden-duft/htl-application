
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../auth/public.decorator'
import { ApiError, ApiErrorType } from 'src/common/api-error'
import { RequestWithUser } from 'src/auth/request-with-user.model'
import { PrismaService } from 'src/prisma.service'


@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) { }

  canActivate(context: ExecutionContext) {
    const request: RequestWithUser = context.switchToHttp().getRequest()
    const user = request.user

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if(user) {
      return this.prisma.applicant.findUnique({ where: { id: user.id } })
      .then(user => {
        if(!user) {
          throw new ApiError(ApiErrorType.NO_USERS_IN_DB)
        } else if (isPublic) {
          return true
        } else {
          if (!user?.emailConfirmed) {
            throw new ApiError(ApiErrorType.EMAIL_NOT_CONFIRMED)
          } else {
            return true
          }
        }
      })
    } else {
      return true
    }
  }
}