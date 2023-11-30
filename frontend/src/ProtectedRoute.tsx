import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/auth.context";
import Navigationbar from "./components/Navbar";
import { Container } from "react-bootstrap";

interface Props {
    isAllowed?: boolean
    redirectPath?: string
    children?: any
}

const ProtectedRoute = ({ isAllowed, redirectPath = '/signin', children }:Props) => {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return children ? children : 
    (
      <>
        <Navigationbar />
        <Container>
          <Outlet />
        </Container>
      </>
    );
};

export default ProtectedRoute