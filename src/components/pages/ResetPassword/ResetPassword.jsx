import { useState } from "react";
import "./ResetPassword.css";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  async function handleRequestEmail(e) {
    try {
      e.preventDefault();
      setLoading(true);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/update-password",
      });
      console.log({ data, error });

      if (error) throw error.message;

      setIsVerifying(true);
      // navigate("/update-password");
      // dispatch(toggleModal({ key: "validateResetPasswordModal", value: true }));
    } catch (error) {
      setError(error.toString());
    }
    setLoading(false);
  }

  async function handleValidated() {
    navigate("/update-password");
  }

  return (
    <div className="reset-password">
      {error && <div className="error-text">{error}</div>}
      <h1>Reset Password</h1>
      <form onSubmit={handleRequestEmail}>
        <p>
          Need to create an account? <Link to="/register">Register here</Link>
        </p>
        {/* <button className='google-auth-button' onClick={handleGoogleAuth} type="button">Sign in with Google</button> */}
        <div className="form-block">
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </>
        </div>

        <button type="submit" disabled={email === "" || loading}>
          Send Email
        </button>
      </form>
      {isVerifying && (
        <div className="is-verifying-modal">
          <p>You should have gotten an email requesting to validate</p>
          <button onClick={handleValidated} type="button">
            Verify
          </button>
        </div>
      )}
      {loading && <LoadingOverlay message="Resetting your password..." />}
    </div>
  );
};
export default ResetPassword;
