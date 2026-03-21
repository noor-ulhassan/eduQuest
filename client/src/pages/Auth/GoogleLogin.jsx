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
      if (res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
      }
      dispatch(
        authSuccess({
          user: res.data.user,
        }),
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full rounded-lg bg-zinc-400">
      <GoogleLogin
        theme="filled_white"
        shape="rectangular"
        size="large"
        text="white"
        width="340"
        onSuccess={handleGoogleLogin}
        onError={() => setError("Google login failed")}
      />
    </div>
  );
}
