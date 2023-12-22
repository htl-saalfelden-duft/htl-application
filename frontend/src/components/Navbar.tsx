import { NavDropdown, Navbar } from "react-bootstrap"
import { useAuth } from "../contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { PersonCircle } from 'react-bootstrap-icons';

const Navigationbar = () => {
    const auth = useAuth()
    const navigate = useNavigate()

    const signOut = () => {
        auth.signOut()
        navigate("/signin")
    }

    return(        
        <Navbar bg="dark" data-bs-theme="dark" expand="false" className="bg-body-tertiary">
            <Navbar.Brand href="#" className="ms-2">HTL-Saalfelden Bewerbung</Navbar.Brand>
            <div className="me-2">
                <NavDropdown title={
                    <PersonCircle color="white" size={40} title={auth.currentUser?.contactEmail} />
                } id="basic-nav-dropdown" align="end">
                    <NavDropdown.Item onClick={signOut}>Sign Out</NavDropdown.Item>
                </NavDropdown>
            </div>
        </Navbar>
    )
}

export default Navigationbar