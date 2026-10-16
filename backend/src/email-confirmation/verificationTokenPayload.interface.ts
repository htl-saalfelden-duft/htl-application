interface VerificationTokenPayload {
    email: string;
    purpose?: 'invite';
}
   
export default VerificationTokenPayload;
