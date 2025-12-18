import { useDispatch } from "react-redux";
import { authLogout } from "../features/auth/authSlice";
import api from "../features/auth/authApi";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("accessToken");
      dispatch(authLogout());
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
