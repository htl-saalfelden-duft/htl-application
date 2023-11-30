import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.scss';
import ConfirmEmail from './components/ConfirmEmail';
import SignupApplicant from './components/SignupApplicant';
import SignIn from "./components/SignIn";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./components/Home";
import { AuthProvider } from "./contexts/auth.context";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
        <Router>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup-applicant" element={<SignupApplicant />} />
            <Route path="confirm-email" element={<ConfirmEmail />} />
            <Route element={<ProtectedRoute/>}>
              <Route path="home" element={<Home />} />
            </Route>
          </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
