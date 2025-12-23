import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./Logout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AuthButtons() {
  const { user, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (status === "loading" || status === "idle") {
    return (
      <Button disabled variant="ghost">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex gap-4">
        <Button
          variant={"pixel"}
          className="font-jersey text-xl"
          onClick={() => navigate("/profile")}
        >
          Profile
        </Button>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={"pixel"}
        className="font-jersey text-xl"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
      <Button
        variant={"pixel"}
        className="font-jersey text-xl"
        onClick={() => navigate("/signup")}
      >
        Sign Up
      </Button>
    </div>
  );
}
