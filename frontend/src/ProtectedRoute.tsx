import { Navigate, Outlet } from "react-router-dom";
import { UserType, useAuth } from "./contexts/auth.context";
import Navigationbar from "./components/Navbar";
import { Alert, Container } from "react-bootstrap";

interface Props {
  userType?: UserType
  admin?: boolean
  redirectPath: string
  children?: any
}

const ProtectedRoute = ({ userType, admin = false, redirectPath, children }: Props) => {
  const { userType: userTypeAuth, isSignedIn, isAdmin } = useAuth()

  if (!isSignedIn) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children :
    (
      <>
        <Navigationbar />
        <Container>
          {
          (userType === userTypeAuth && (!admin || (isAdmin && admin)))  && 
            <Outlet />
          }

        </Container>
      </>
    );
};

export default ProtectedRoute