import { HttpException, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'

export const enum ApiErrorType {
    USER_NOT_FOUND,
    USER_EXISTS,
    NOT_IN_SESSION,
    NO_USERS_IN_DB,
    WRONG_PASSWORD,
    USER_NOT_ACTIVE,
    NOT_ACCEPTABLE,
    EMAIL_NOT_CONFIRMED,
    EMAIL_ALREADY_CONFIRMED,
    BAD_CONFIRMATION_TOKEN,
    CONFIRMATION_TOKEN_EXPIRED,
    LOGIN_EXPIRED
}

export interface IApiError {
    httpStatus: HttpStatus
    title: string
    message: string
}

export class ApiError extends HttpException {

    public httpStatus: number
    public title: string
    public apiError: string

    constructor(error: ApiErrorType | any) {
        console.error(error)

        const apiError: IApiError = ApiError.getError(error)

        let response:string;
        
        if (apiError.httpStatus == HttpStatus.BAD_REQUEST) {
            response = HttpException.createBody(error)
        } else {
            response = `${apiError.title}: ${apiError.message}`
        }

        super(response, apiError.httpStatus)

        Error.captureStackTrace(this, this.constructor)
    }

    private static getError(error: ApiErrorType | any): IApiError {

        let apiError: IApiError

        switch (error) {
            case ApiErrorType.USER_NOT_FOUND:
                apiError = {
                    httpStatus: HttpStatus.NOT_FOUND,
                    title: 'User not found',
                    message: 'Unable to find the user with the provided information.'
                }
                break
            case ApiErrorType.USER_NOT_ACTIVE:
                apiError = {
                    httpStatus: HttpStatus.FORBIDDEN,
                    title: 'User not active',
                    message: 'User is not active.'
                }
                break
            case ApiErrorType.USER_EXISTS:
                apiError = {
                    httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
                    title: 'Email exists',
                    message: 'Email exists in Database'
                }
                break
            case ApiErrorType.NOT_IN_SESSION:
                apiError = {
                    httpStatus: HttpStatus.UNAUTHORIZED,
                    title: 'No Session',
                    message: 'The session is expired'
                }
                break
            case ApiErrorType.NO_USERS_IN_DB:
                apiError = {
                    httpStatus: HttpStatus.NOT_FOUND,
                    title: 'No Users',
                    message: 'User does not exit in database'
                }
                break
            case ApiErrorType.WRONG_PASSWORD:
                apiError = {
                    httpStatus: HttpStatus.FORBIDDEN,
                    title: 'Wrong password',
                    message: 'Password is not correct'
                }
                break
            case ApiErrorType.NOT_ACCEPTABLE:
                apiError = {
                    httpStatus: HttpStatus.NOT_ACCEPTABLE,
                    title: 'Entity not acceptable',
                    message: 'The given entity could not been processed'
                }
                break
            case ApiErrorType.LOGIN_EXPIRED:
                apiError = {
                    httpStatus: HttpStatus.NOT_ACCEPTABLE,
                    title: 'Login expired',
                    message: 'Please login again'
                }
                break                
            case ApiErrorType.EMAIL_NOT_CONFIRMED:
                apiError = {
                    httpStatus: HttpStatus.NOT_ACCEPTABLE,
                    title: 'Email not confirmed',
                    message: 'Please confirm your email first'
                }
                break                
            case ApiErrorType.EMAIL_ALREADY_CONFIRMED:
                apiError = {
                    httpStatus: HttpStatus.NOT_ACCEPTABLE,
                    title: 'Email already confirmed',
                    message: 'Your email is already confirmed'
                }
                break
            case ApiErrorType.BAD_CONFIRMATION_TOKEN:
                apiError = {
                    httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
                    title: 'Bad confirmation token',
                    message: 'The confirmation-token is not valid'
                }
                break
            case ApiErrorType.CONFIRMATION_TOKEN_EXPIRED:
                apiError = {
                    httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
                    title: 'Token expired',
                    message: 'Email confirmation token expired. Please request a new one!'
                }
                break             
            default:
                if(error instanceof Prisma.PrismaClientKnownRequestError) {
                    console.error(error.code, error.meta)
                    const { code, meta } = error
                    switch (code) {
                        case 'P2002':
                            const target = meta?.target
                            let title = target as string

                            let message = `Unique constraint failed on the ${target}`

                            if(target === 'Applicant_email_key') {
                                title = "Email exists"
                                message = "You are already signed up with this email!"
                            }

                            apiError = {
                                httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
                                title,
                                message
                            }
                            break;
                        default:
                            apiError = {
                                httpStatus: HttpStatus.BAD_REQUEST,
                                title: undefined,
                                message: undefined
                            }
                            break;
                    }

                } else {
                    console.error(error) //Leave this for logging error in teminal
                    apiError = {
                        httpStatus: HttpStatus.BAD_REQUEST,
                        title: undefined,
                        message: undefined
                    }
                }
        }
        return apiError
    }
}
