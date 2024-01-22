import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.scss';
import ConfirmEmail from './components/ConfirmEmail';
import SignupApplicant from './components/SignupApplicant';
import SignInApplicant from "./components/SignInApplicant";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./contexts/auth.context";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SignInUser from "./components/SignInUser";
import { Applicants } from "./components/Applicants";
import Applicant from "./components/Applicant";
import SignupUser from "./components/SignupUser";

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Routes>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="signin-applicant" element={<SignInApplicant />} />
          <Route path="signin-user" element={<SignInUser />} />
          <Route path="signup-applicant" element={<SignupApplicant />} />
          <Route path="confirm-email" element={<ConfirmEmail />} />
          <Route element={<ProtectedRoute userType="applicant" redirectPath="/signin-applicant" />}>
              <Route path="home" element={<Applicant />} />
          </Route>
          <Route element={<ProtectedRoute userType="user" redirectPath="/signin-user"/>}>
              <Route path="applicants" element={<Applicants />} />
              <Route path="applicant" element={<Applicant />} />
          </Route>
          <Route element={<ProtectedRoute userType="user"  admin={true} redirectPath="/signin-user"/>}>
              <Route path="signup-user" element={<SignupUser />} />
          </Route>              
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
