import { NavDropdown, Navbar } from "react-bootstrap"
import { useAuth } from "../contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { PersonCircle } from 'react-bootstrap-icons';
import htlLogoWhite from '../assets/images/htl-saalfelden-logo_white.png'

const Navigationbar = () => {
    const { userType, signOut, currentUser } = useAuth()
    const navigate = useNavigate()

    const triggerSignOut = () => {
        signOut()
        if(userType === 'applicant')
            navigate("/signin-applicant")
        else
            navigate("/signin-user")
    }

    return(        
        <Navbar bg="dark" data-bs-theme="dark" expand="false" className="bg-body-tertiary">
            <Navbar.Brand href="#" className="ms-2"><img src={htlLogoWhite} alt="" /></Navbar.Brand>
            <div className="me-2">
                <NavDropdown title={
                    <PersonCircle color="white" size={40} title={currentUser?.email} />
                } id="basic-nav-dropdown" align="end">
                    <NavDropdown.Item onClick={triggerSignOut}>Abmelden</NavDropdown.Item>
                </NavDropdown>
            </div>
        </Navbar>
    )
}

export default Navigationbar