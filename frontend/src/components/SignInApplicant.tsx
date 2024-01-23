import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { ISignInFormInput } from "./SignInForm"

const SignInApplicant = () => {
	const navigate = useNavigate()
	const { setUserType, signIn } = useAuth()

	setUserType('applicant')

	const onSubmit = ((data: ISignInFormInput) => {
        signIn(data.email, data.password)
        .then(() => {
			toast("Willkommen im HTL-Bewerber-Portal!")
			navigate("/home")
        }, (err) => {
			toast(err.response.data.message)
		})
	})

	return (
		<SignInForm onSubmit={onSubmit}/>
	)
}

export default SignInApplicant