import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";
import { EyeIcon } from "../Icons/EyeIcon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./LoginModal.css";
import { isValidEmail } from "../../../utils/usefulFunctions";

export const LoginModal = () => {
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "post",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "content-type": "application/json", 
        },
      });

      if (!response.ok) throw new Error("There was an error logging in")

      const data = await response.json()

      console.log("Logged in", data) 

      // TODO - Check for user in tbl_user, decline with support message
      // const { data: data2, error: error2 } = await supabase.rpc(
      //   "check_for_user_in_local_db",
      //   {
      //     p_user_id: data.user.id,
      //   }
      // );

      const [error2, data2] = ['Need to check for user', null]

      console.log([error2, data2])

      if (error2) throw error2.message;

      if (data2 == 0)
        throw "There was a problem finding the user account you are trying to access.";

      // navigate("/");
      dispatch(toggleModal({ key: "loginModal", value: false }));
    } catch (error) {
      console.error(error);
      setLoginError(error.toString());
    }
    setLoading(false);
  }

  return (
    <>
      <div className="modal login">
        {loginError && <div className="error-text">{loginError.toString()}</div>}
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="standard">
          <p>
            Need to create an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                dispatch(toggleModal({ key: "loginModal", value: false }));
                dispatch(toggleModal({ key: "registerModal", value: true }));
              }}
            >
              Register here
            </button>
          </p>
          <div className="form-block">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                autoComplete="username"
                placeholder="Email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-and-visible-toggle">
                <input
                  autoComplete="password"
                  placeholder="Password"
                  type={passwordVisible ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  type="button"
                  className="button"
                >
                  <EyeIcon closed={passwordVisible} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={email === "" || password === "" || !isValidEmail(email) || loading}
          >
            {loading ? "Logging you in..." : "Submit"}
          </button>

          <p>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                dispatch(toggleModal({ key: "loginModal", value: false }));
                dispatch(toggleModal({ key: "resetPasswordModal", value: true }));
              }}
            >
              Forgot password?
            </button>
          </p>
        </form>
      </div>
      <ModalOverlay
        zIndex={6}
        onClick={() => dispatch(toggleModal({ key: "loginModal", value: false }))}
      />
    </>
  );
};
