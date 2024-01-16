import { Navigate, Outlet } from "react-router-dom";
import { UserType, useAuth } from "./contexts/auth.context";
import Navigationbar from "./components/Navbar";
import { Alert, Container } from "react-bootstrap";

interface Props {
  userType?: UserType
  redirectPath: string
  children?: any
}

const ProtectedRoute = ({ userType, redirectPath, children }: Props) => {
  const { userType: userTypeAuth, isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children :
    (
      <>
        <Navigationbar />
        <Container>
          {userType === userTypeAuth ? <Outlet /> : <Alert className="mt-4" variant="danger">Sorry, but this route is not allowed!</Alert>}

        </Container>
      </>
    );
};

export default ProtectedRoute