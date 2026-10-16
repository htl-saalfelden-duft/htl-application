import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap"
import { useAuth } from "../contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { Gear, People, PersonCircle } from 'react-bootstrap-icons';
import htlLogoWhite from '../assets/images/htl-logo-nav.svg'

const Navigationbar = () => {
    const { signOut, currentUser, isAdmin, isAdministration, userType } = useAuth()
    const navigate = useNavigate()

    const triggerSignOut = () => {
        signOut()
        if (isAdministration)
            navigate("/signin-user")
        else
            navigate("/signin-applicant")
    }

    return (

        <Navbar bg="dark" data-bs-theme="dark" expand="false" className="bg-body-tertiary navbar-htl">
            <Container>
                <div className="me-2">
                    <NavDropdown 
                        title={<PersonCircle color="white" size={40} title={currentUser?.email} />} 
                        id="basic-nav-dropdown" 
                        align="start"
                        >
                        <NavDropdown.Item onClick={triggerSignOut}>Abmelden</NavDropdown.Item>
                    </NavDropdown>
                </div>
                <div className="d-flex flex-grow-1 ms-4 text-white">
                    {isAdministration && <>
                        <Nav.Item>
                            <Nav.Link href="/applicants" className="text-white">Bewerber</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="ms-4">
                            <Nav.Link href="/trial-days-admin" className="text-white">Schnuppertage</Nav.Link>
                        </Nav.Item>
                    </>}
                    {userType === 'applicant' && <>
                        <Nav.Item>
                            <Nav.Link href="/trial-days" className="text-white">Schnuppern</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="ms-4">
                            <Nav.Link href="/home" className="text-white">Bewerbung</Nav.Link>
                        </Nav.Item>
                    </>}
                    {isAdmin && 
                        <NavDropdown title="Admin" className="ms-4">
                            <NavDropdown.Item href="/users"><People /><span className="ms-2">Show Users</span></NavDropdown.Item>
                            <NavDropdown.Item href="/settings"><Gear /><span className="ms-2">Einstellungen</span></NavDropdown.Item>
                        </NavDropdown>
                    }
                </div>
                <Navbar.Brand href="#" className="ms-2"><img src={htlLogoWhite} alt="htl-logo" /></Navbar.Brand>
            </Container>
        </Navbar>
    )
}

export default Navigationbar