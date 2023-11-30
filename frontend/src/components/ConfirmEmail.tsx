import { useLocation } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { Applicant } from '../models/applicant.model';
import { Container } from 'react-bootstrap';

const ConfirmEmail = () => {
  const location = useLocation();
  const apiService = new ApiService()
  const token = new URLSearchParams(location.search).get('token');
    
    const confirmEmail = () => {
        console.log("Button clicked!")
        apiService.post(Applicant, 'confirm', {token})
    }
  
    return (
      <Container>
        <div className="ConfirmEmail">
          <p>
            After email-confirmation you are able to login.
          </p>
          <button className="btn btn-primary" onClick={confirmEmail}>
            Confirm your email
          </button>
        </div>
      </Container>
  );
}

export default ConfirmEmail;
