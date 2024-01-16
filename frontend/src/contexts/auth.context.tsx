import React, {useContext, useEffect, useMemo, useState} from 'react'
import { AuthService } from '../services/auth.service'
import { Applicant } from '../models/applicant.model'
import { User } from '../models/user.model'

interface Props {
    children: any
}

interface AuthValues {
    currentUser: User | Applicant | undefined,
    isSignedIn: boolean,
    signIn: (email: string, password: string) => Promise<void>,
    signOut: () => void
    userType: UserType | undefined
    setUserType: (type: UserType) => void
}

export type UserType = 'user' | 'applicant'

const AuthContext = React.createContext<AuthValues>(undefined as any )

const useAuth = () => useContext(AuthContext)

const AuthProvider = (props: Props) => {
    const authService = useMemo(() => new AuthService(), [])

    const [currentUser, setCurrentUser] = useState<User | Applicant | undefined>()
    const [isSignedIn, setIsSignedIn] = useState(authService.isSignedIn())
    let userType: UserType = authService.getUserType() as UserType

    const setUserType = (ut: UserType) => {
        userType = ut
    }


    const signIn = (email: string, password: string) => {
        if(userType === 'applicant') {
            return authService.signInApplicant({email, password})
            .then(() => authService.loadCurrentApplicant())
            .then((currentUser) => {
                setCurrentUser(currentUser)
                setIsSignedIn(true)
            })
        } else if(userType === 'user') {
            return authService.signInUser({email, password})
            .then(() => authService.loadCurrentUser())
            .then((currentUser) => {
                setCurrentUser(currentUser)
                setIsSignedIn(true)
            })
        } else throw new Error("No type selected. Please select type first by calling setType()")
    }

    const signOut = () => {
        setIsSignedIn(false)
        return authService.signOut()
    }

    const value = {
        currentUser,
        isSignedIn,
        signIn,
        signOut,
        setUserType,
        userType
    }

    useEffect(() => {
        if(isSignedIn) {
            if(userType === 'applicant') {
                authService.loadCurrentApplicant()
                .then((currentUser) => {
                    setCurrentUser(currentUser)
                })
            } else {
                authService.loadCurrentUser()
                .then((currentUser) => {
                    setCurrentUser(currentUser)
                })
            }
        } else {
            setCurrentUser(undefined)
        }
    }, [authService, isSignedIn])

    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )
}

export { AuthProvider, useAuth }
