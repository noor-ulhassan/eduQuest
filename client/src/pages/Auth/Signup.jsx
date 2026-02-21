import React, { useState } from "react";
import api from "@/features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import GoogleAuthButton from "./GoogleLogin";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[url('/moon.gif')] bg-cover bg-center bg-no-repeat px-4 py-8 sm:py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-jersey mb-4 sm:mb-6">EduQuest</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-sm">{success}</p>}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button
            variant={"pixel"}
            type="submit"
            className="w-full font-jersey text-xl mt-4 p-3 rounded-md font-medium transition"
          >
            Sign Up
          </Button>
        </div>
        <div className="flex items-center text-gray-400 text-sm my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-2">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <GoogleAuthButton setError={setError} className="w-full" />/
        <p className="text-center mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
