import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { authSuccess } from "@/features/auth/authSlice";
import api from "@/features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import GoogleAuthButton from "./GoogleLogin";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = formData;
    try {
      const res = await api.post("/auth/login", { email, password });
      dispatch(
        authSuccess({
          user: res.data.user,
        })
      );
      // alert(res.data.message);
      // console.log(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-[url('/pixel.jfif')] bg-cover bg-center bg-no-repeat px-4 mt-5">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
        <h2 className="text-4xl font-jersey mb-6">EduQuest</h2>

        {/* Google Login */}
        <GoogleAuthButton setError={setError} className="w-full mb-4" />

        {/* OR separator */}
        <div className="flex items-center text-gray-400 text-sm my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-2">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Email & Password inputs (optional) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />
          <Button
            variant={"pixel"}
            type="submit"
            className="w-full font-jersey text-xl p-3 rounded-md font-medium transition mt-5"
          >
            Login
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-yellow-600 hover:underline ">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
