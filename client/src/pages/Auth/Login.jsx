import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { authSuccess } from "@/features/auth/authSlice";
import api from "@/features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import GoogleAuthButton from "./GoogleLogin";
import { Mail, Lock, Terminal } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "", adminPasscode: "" });
  const [logoClicks, setLogoClicks] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password, adminPasscode } = formData;
    try {
      const payload = { email, password };
      if (logoClicks >= 5 && adminPasscode) {
        payload.adminPasscode = adminPasscode;
      }
      const res = await api.post("/auth/login", payload);
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
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717] px-4 font-sans relative overflow-hidden">
      {/* Subtle ambient glow in the background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0) 50%)",
          filter: "blur(40px)",
        }}
      />

      <MagicCard
        className="dark w-full max-w-[420px] rounded-2xl border border-transparent p-8 sm:p-10 shadow-2xl relative z-10"
        gradientColor="#ff6b6b"
        gradientOpacity={0.2}
        gradientSize={300}
        backgroundColor="#212121"
      >
        {/* Logo (Secret Admin Trigger) */}
        <div className="flex justify-center mb-6">
          <div 
            onClick={() => setLogoClicks(prev => prev + 1)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="logo1.png" alt="" width={50} height={50} className="pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Sign in to EduQuest
          </h2>
          <p className="text-[#a3a3a3] text-sm">
            Welcome back, let's get back to coding.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google Login */}
        <div className="flex justify-center mb-6">
          <GoogleAuthButton setError={setError} className="w-full" />
        </div>

        {/* OR separator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            or continue with email
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              placeholder="Email address"
              required
              className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Password"
              required
              className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
            />
          </div>

          {logoClicks >= 5 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                type="password"
                name="adminPasscode"
                onChange={handleChange}
                value={formData.adminPasscode}
                placeholder="Secret Admin Passcode"
                required={logoClicks >= 5}
                className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-red-500/30 rounded-xl text-red-400 placeholder:text-red-500/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 border border-red-400 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer mt-2 text-sm"
            style={{
              boxShadow: "0 2px 12px rgba(220, 38, 38, 0.2)",
            }}
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-white hover:underline transition-all"
          >
            Sign up
          </Link>
        </p>
      </MagicCard>
    </div>
  );
}
