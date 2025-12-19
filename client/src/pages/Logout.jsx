import { useDispatch } from "react-redux";
import { authLogout } from "../features/auth/authSlice";
import api from "../features/auth/authApi";
import { Button } from "@/components/ui/button";

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

  return <Button onClick={handleLogout}>Logout</Button>;
}
