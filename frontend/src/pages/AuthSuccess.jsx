import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/authSlice";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AuthSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function updateState() {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/auth");
          return;
        }

        const user = await res.json();
        dispatch(loginSuccess(user));

        navigate("/");
        
      } catch (err) {
        navigate("/auth");
      }
    }

    updateState();
  }, [dispatch, navigate]);

  return <div>Signing you in...</div>;
};

export default AuthSuccess;
