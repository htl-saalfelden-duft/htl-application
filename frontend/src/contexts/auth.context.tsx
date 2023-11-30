import React, {useContext, useEffect, useMemo, useState} from 'react'
import { AuthService } from '../services/auth.service'
import { Applicant } from '../models/applicant.model'

interface Props {
    children: any
}

interface AuthValues {
    currentUser: Applicant | null,
    isSignedIn: boolean,
    signIn: (email: string, password: string) => Promise<Applicant>,
    signOut: () => void
}

const AuthContext = React.createContext<AuthValues>(undefined as any )

const useAuth = () => useContext(AuthContext)

const AuthProvider = (props: Props) => {
    const authService = useMemo(() => new AuthService(), [])

    const [currentUser, setCurrentUser] = useState<Applicant | null>(null)
    const [isSignedIn, setIsSignedIn] = useState(authService.isSignedIn())

    const signIn = (email: string, password: string) => {
        return authService.signIn({email, password})
		.then(() => authService.loadCurrentUser())
        .then((currentUser) => {
            setCurrentUser(currentUser)
            setIsSignedIn(true)
            return currentUser
        })
    }

    const signOut = () => {
        setIsSignedIn(false)
        return authService.signOut()
    }

    const value = {
        currentUser,
        isSignedIn,
        signIn,
        signOut
    }

    useEffect(() => {
        if(isSignedIn) {
            authService.loadCurrentUser()
            .then((currentUser) => {
                setCurrentUser(currentUser)
            })
        } else {
            setCurrentUser(null)
        }
    }, [authService, isSignedIn])

    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )
}

export { AuthProvider, useAuth }
