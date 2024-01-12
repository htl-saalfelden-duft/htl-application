import React, {useContext, useEffect, useMemo, useState} from 'react'
import { AuthService } from '../services/auth.service'
import { Applicant } from '../models/applicant.model'

interface Props {
    children: any
}

interface AuthValues {
    currentApplicant: Applicant | null,
    isSignedIn: boolean,
    signIn: (email: string, password: string, type: 'user' | 'applicant') => Promise<Applicant>,
    signOut: () => void
}

const AuthContext = React.createContext<AuthValues>(undefined as any )

const useAuth = () => useContext(AuthContext)

const AuthProvider = (props: Props) => {
    const authService = useMemo(() => new AuthService(), [])

    const [currentApplicant, setCurrentApplicant] = useState<Applicant | null>(null)
    const [isSignedIn, setIsSignedIn] = useState(authService.isSignedIn())

    const signIn = (email: string, password: string, type: 'user' | 'applicant') => {
        if(type === 'applicant') {
            return authService.signInApplicant({email, password})
            .then(() => authService.loadCurrentApplicant())
            .then((currentApplicant) => {
                setCurrentApplicant(currentApplicant)
                setIsSignedIn(true)
                return currentApplicant
            })
        } else {
            return authService.signInUser({email, password})
            .then(() => authService.loadCurrentApplicant())
            .then((currentApplicant) => {
                setCurrentApplicant(currentApplicant)
                setIsSignedIn(true)
                return currentApplicant
            })
        }        
    }

    const signOut = () => {
        setIsSignedIn(false)
        return authService.signOut()
    }

    const value = {
        currentApplicant,
        isSignedIn,
        signIn,
        signOut
    }

    useEffect(() => {
        if(isSignedIn) {
            authService.loadCurrentApplicant()
            .then((currentApplicant) => {
                setCurrentApplicant(currentApplicant)
            })
        } else {
            setCurrentApplicant(null)
        }
    }, [authService, isSignedIn])

    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )
}

export { AuthProvider, useAuth }
