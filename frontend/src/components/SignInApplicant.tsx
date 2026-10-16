import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { ISignInFormInput } from "./SignInForm"
import { ApiService } from "../services/api.service"
import { Setting } from "../models/setting.model"

const SignInApplicant = () => {
	const navigate = useNavigate()
	const location = useLocation()
	// Only known pages, no open redirect
	const redirect = new URLSearchParams(location.search).get('redirect') === '/trial-days' ? '/trial-days' : undefined
	const { setUserType, signIn } = useAuth()

	setUserType('applicant')

	const onSubmit = ((data: ISignInFormInput) => {
        signIn(data.email, data.password)
        .then(() => new ApiService().getPath<Setting>(Setting, 'applicationOpen'))
        .then((applicationOpen) => {
			toast("Willkommen im HTL-Bewerber-Portal!")
			// Before the application is unlocked the portal is only used for trial days
			navigate(redirect ?? (applicationOpen.value ? "/home" : "/trial-days"))
        }, (err) => {
			toast(err.response.data.message)
		})
	})

	return (
		<SignInForm onSubmit={onSubmit}/>
	)
}

export default SignInApplicant