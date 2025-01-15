import { useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { Applicant } from '../models/applicant.model';
import { Card, CardBody, Container, Row } from 'react-bootstrap';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import htlLogo128 from '../assets/images/htl-logo.png'


const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate()

  const apiService = useMemo(() => new ApiService(), [])
  const token = new URLSearchParams(location.search).get('token');

  const confirmEmail = () => {
    apiService.post(Applicant, 'confirm', { token })
      .then(() => {
        toast("Email-Adresse bestätigt!")
        navigate("/signin-applicant")
      }, (err) => {
        toast(err.response.data.message)
      })
  }

  return (
    <Container>
      <Row className='justify-content-md-center'>
        <Card className='col-lg-5 mt-5'>
          <CardBody>
            <div className="d-flex flex-row-reverse">
                <img src={htlLogo128} width={64} alt="htl-logo" />
                <h5 className="card-title mt-4 flex-grow-1">HTL-Bewerber-Portal</h5>
            </div>
            <div className="mt-4">
              <p>
                Um fortzufahren bestätigen Sie bitte ihre Email-Adresse.
              </p>
              <button className="btn btn-primary mt-3" onClick={confirmEmail}>
                Email bestätigen
              </button>
            </div>
          </CardBody>
        </Card>
      </Row>
    </Container>
  );
}

export default ConfirmEmail;
