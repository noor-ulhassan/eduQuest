// GoogleAuthButton.jsx
import { GoogleLogin } from "@react-oauth/google";
import api from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import { authSuccess } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function GoogleAuthButton({ setError }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        idToken: credentialResponse.credential,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      dispatch(
        authSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => setError("Google login failed")}
    />
  );
}
