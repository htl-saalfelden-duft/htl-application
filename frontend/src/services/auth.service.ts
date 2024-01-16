import { SignUpFormInput } from "../components/SignupApplicant";
import { Applicant } from "../models/applicant.model";
import { User } from "../models/user.model";
import { ApiService } from "./api.service";
import moment from 'moment';
import ms from 'ms'

export interface AuthDataDto {
    idToken: string
    expiresIn: string
    userType: string
}

export interface AuthUserDto {
    email: string
    password: string
}

export class AuthService extends ApiService {
    loadCurrentApplicant() {
        return this.getPath<Applicant>(Applicant, 'current')
        .then(applicant => {
            return applicant
        })
    }

    loadCurrentUser() {
        return this.getPath<Applicant>(User, 'current')
        .then(user => {
            return user
        })
    }

    signUpApplicant(data: SignUpFormInput) {
        return super.post(Applicant, 'register', data)
    }

    signInApplicant(authUser: AuthUserDto) {
        return this.post<AuthDataDto>(Applicant, 'signIn', authUser)
        .then((response: AuthDataDto) => {
            this.setSession(response)
        })
    }

    signInUser(authUser: AuthUserDto) {
        return this.post<AuthDataDto>(User, 'signIn', authUser)
        .then((response: AuthDataDto) => {
            this.setSession(response)
        })
    }

    signOut(): void {
        localStorage.removeItem('idToken')
        localStorage.removeItem('userType')
        localStorage.removeItem('expiresAt')
    }

    isSignedIn(): boolean {
        const expiresAt: moment.Moment = this.getExpiration()
        return moment().isBefore(expiresAt)
    }

    getUserType(): string | null {
        return localStorage.getItem('userType')
    }

    private setSession(authResult: AuthDataDto): void {
        const expiresAt: moment.Moment = moment().add().add(ms(authResult.expiresIn), 'ms')

        localStorage.setItem('idToken', authResult.idToken)
        localStorage.setItem('userType', authResult.userType)
        localStorage.setItem('expiresAt', JSON.stringify(expiresAt.valueOf()) )
    }

    private getExpiration(): moment.Moment {
        const expiresAt: number = parseInt(localStorage.getItem('expiresAt') || '0')
        return moment(expiresAt)
    }    
}
