import React, { useState } from "react";
import api from "@/features/auth/authApi";
import { useNavigate, Link } from "react-router-dom";
import GoogleAuthButton from "./GoogleLogin";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Rocket,
  Trophy,
  Code2,
} from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

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
    <div className="min-h-screen flex">
      {/* Left Branded Panel */}
      <BackgroundBeamsWithCollision className="!hidden lg:!flex lg:w-1/2 !h-auto min-h-screen !bg-gradient-to-br from-[#12091b] via-[#1a0f2e] to-[#0d0618] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[120px] z-0" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#8c2bee]/20 rounded-full blur-[100px] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8c2bee]/8 rounded-full blur-[150px] z-0" />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8c2bee] to-[#6b1fb8] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#8c2bee]/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Start your journey on{" "}
            <span className="bg-gradient-to-r from-[#8c2bee] to-[#b06aff] bg-clip-text text-transparent">
              EduQuest
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Join thousands of learners mastering new skills with AI-generated
            courses, gamified progress, and community-driven learning.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              {
                icon: Rocket,
                val: "500+",
                label: "AI Courses",
                color: "text-[#8c2bee]",
              },
              {
                icon: Trophy,
                val: "10K+",
                label: "Learners",
                color: "text-amber-400",
              },
              {
                icon: Code2,
                val: "50+",
                label: "Playgrounds",
                color: "text-emerald-400",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-white">{stat.val}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </BackgroundBeamsWithCollision>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8c2bee] to-[#6b1fb8] rounded-xl flex items-center justify-center shadow-lg shadow-[#8c2bee]/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#8c2bee] to-[#b06aff] bg-clip-text text-transparent">
              EduQuest
            </h2>
          </div>

          <h3 className="text-3xl font-bold text-slate-900 mb-2">
            Create your account
          </h3>
          <p className="text-slate-500 mb-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#8c2bee] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Error / Success */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium">
              {success}
            </div>
          )}

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleAuthButton setError={setError} className="w-full" />
          </div>

          {/* OR separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              or sign up with email
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                placeholder="Full name"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c2bee] focus:border-[#8c2bee] focus:outline-none text-slate-900 bg-slate-50/50 placeholder:text-slate-400 transition-colors"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c2bee] focus:border-[#8c2bee] focus:outline-none text-slate-900 bg-slate-50/50 placeholder:text-slate-400 transition-colors"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c2bee] focus:border-[#8c2bee] focus:outline-none text-slate-900 bg-slate-50/50 placeholder:text-slate-400 transition-colors"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8c2bee] to-[#6b1fb8] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-[#8c2bee]/25 hover:shadow-xl hover:shadow-[#8c2bee]/35 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            By signing up, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
