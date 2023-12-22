import { SignUpFormInput } from "../components/SignupApplicant";
import { Applicant } from "../models/applicant.model";
import { ApiService } from "./api.service";
import moment from 'moment';
import ms from 'ms'

export interface AuthDataDto {
    idToken: string
    expiresIn: string
}

export interface AuthUserDto {
    email: string
    password: string
}

export class AuthService extends ApiService {
    loadCurrentUser() {
        return this.getPath<Applicant>(Applicant, 'current')
        .then(applicant => {
            return applicant
        })
    }

    signUp(data: SignUpFormInput) {
        return this.post(Applicant, 'register', data)
    }

    signIn(authUser: AuthUserDto) {
        return this.post<AuthDataDto>(Applicant, 'signIn', authUser)
        .then((response: AuthDataDto) => {
            this.setSession(response)
        })
    }

    signOut(): void {
        localStorage.removeItem('idToken')
        localStorage.removeItem('expiresAt')
    }

    isSignedIn(): boolean {
        const expiresAt: moment.Moment = this.getExpiration()
        return moment().isBefore(expiresAt)
    }

    private setSession(authResult: AuthDataDto): void {
        const expiresAt: moment.Moment = moment().add().add(ms(authResult.expiresIn), 'ms')

        localStorage.setItem('idToken', authResult.idToken)
        localStorage.setItem('expiresAt', JSON.stringify(expiresAt.valueOf()) )
    }

    private getExpiration(): moment.Moment {
        const expiresAt: number = parseInt(localStorage.getItem('expiresAt') || '0')
        return moment(expiresAt)
    }    
}