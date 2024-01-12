import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"
import SignInForm, { IFormInput } from "./SignInForm"

const SignInApplicant = () => {
	const navigate = useNavigate()
	const { signIn } = useAuth()

	const onSubmit = ((data: IFormInput) => {
        signIn(data.contactEmail,data.password, 'applicant')
        .then(() => {
			toast("Willkommen in der HTL-Bewerbungsseite!")
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