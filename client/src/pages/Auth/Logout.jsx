import { useDispatch } from "react-redux";
import { authLogout } from "../../features/auth/authSlice";
import api from "../../features/auth/authApi";
import { Button } from "@/components/ui/button";
import { clearPlaygroundCache } from "../../features/playground/playgroundApi";

export default function LogoutButton({ className }) {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("accessToken");
      clearPlaygroundCache();
      dispatch(authLogout());
    } catch (err) {
      console.log(err);
    }
  };

  return <button className={className} onClick={handleLogout}>Logout</button>;
}
