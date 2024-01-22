import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { ISignInFormInput } from "./SignInForm"

const SignInUser = () => {
	const navigate = useNavigate()
	const { setUserType, signIn } = useAuth()

	setUserType('user')

	const onSubmit = ((data: ISignInFormInput) => {
        signIn(data.email, data.password)
        .then(() => {
			toast("Willkommen in der HTL-Bewerbungsseite!")
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