import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { ISignInFormInput } from "./SignInForm"

const SignInUser = () => {
	const navigate = useNavigate()
	const { setUserType, signIn } = useAuth()

	setUserType('administration')

	const onSubmit = ((data: ISignInFormInput) => {
        signIn(data.email, data.password)
        .then(() => {
			toast("Willkommen im HTL-Bewerber-Portal!")
			navigate("/applicants")
        }, (err) => {
			toast(err.response.data.message)
		})
	})

	return (
		<SignInForm onSubmit={onSubmit} isUser={true}/>
	)
}

export default SignInUser