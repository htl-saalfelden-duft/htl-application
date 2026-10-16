import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { ISignInFormInput } from "./SignInForm"
import { ApiService } from "../services/api.service"
import { Setting } from "../models/setting.model"

const SignInApplicant = () => {
	const navigate = useNavigate()
	const { setUserType, signIn } = useAuth()

	setUserType('applicant')

	const onSubmit = ((data: ISignInFormInput) => {
        signIn(data.email, data.password)
        .then(() => new ApiService().getPath<Setting>(Setting, 'applicationOpen'))
        .then((applicationOpen) => {
			toast("Willkommen im HTL-Bewerber-Portal!")
			// Before the application is unlocked the portal is only used for trial days
			navigate(applicationOpen.value ? "/home" : "/trial-days")
        }, (err) => {
			toast(err.response.data.message)
		})
	})

	return (
		<SignInForm onSubmit={onSubmit}/>
	)
}

export default SignInApplicant