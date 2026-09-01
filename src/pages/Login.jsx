import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdSchool,
  MdSecurity,
  MdLockOutline,
  MdPersonOutline,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdArrowForward,
  MdErrorOutline,
  MdClose,
  MdVerifiedUser,
  MdAutoGraph,
  MdOutlineAssignmentTurnedIn,
} from "react-icons/md";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login authentication error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid username or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b0f19] text-gray-100 overflow-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDE: HERO & UNIVERSITY BRANDING (55% Desktop)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative lg:w-[54%] xl:w-[56%] flex flex-col justify-between p-8 sm:p-12 xl:p-16 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1435] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
        {/* Background Ambient Glow Orbs & Subtle Grid */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        {/* Top: University Brand Area */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c4dff] via-[#9065ff] to-[#a78bfa] p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0f172a] rounded-[14px] flex items-center justify-center">
                <MdSchool className="text-2xl text-[#a78bfa]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white font-['Outfit']">
                  UNIVERSITY EXAM PORTAL
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  v2.6
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                Examination & Assessment Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hero Narrative & Feature Showcase */}
        <div className="relative z-10 my-10 lg:my-0 max-w-xl space-y-6">
          {/* Security & Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-purple-200 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
            <span className="text-gray-300 font-semibold">
              Secure Academic Assessment Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-['Outfit']">
            Empowering Academic Excellence with{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#f472b6] bg-clip-text text-transparent">
              Assessment Integrity.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300/90 leading-relaxed font-normal">
            A unified, secure infrastructure for examination paper preparation,
            confidential moderation workflows, automated printing pipelines,
            and faculty compliance monitoring.
          </p>

          {/* Glassmorphism Feature Card */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <MdVerifiedUser className="text-[#a78bfa] text-lg" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Enterprise Security & Controls
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Active & Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-1">
                  <MdSecurity className="text-purple-400" />
                  <span>256-Bit SSL</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  End-to-end encrypted packet storage
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-1">
                  <MdOutlineAssignmentTurnedIn className="text-purple-400" />
                  <span>6-Point Rubric</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Quality & difficulty moderation
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-1">
                  <MdAutoGraph className="text-purple-400" />
                  <span>Live Audit</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Real-time timeline tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Left Hero Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/[0.08]">
          <span>Institutional Assessment Portal</span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Authorized Personnel Only
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT SIDE: PREMIUM LOGIN PANEL (45% Desktop)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:w-[46%] xl:w-[44%] flex items-center justify-center p-6 sm:p-10 xl:p-14 bg-[#f8fafc] text-gray-900 min-h-full">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7c4dff] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Academic Authentication
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600">
                <MdSecurity className="text-emerald-600 text-sm" />
                <span>SSL Secured</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-['Outfit']">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Sign in to securely access your examination management dashboard.
            </p>
          </div>

          {/* Dismissible Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 shadow-sm transition-all animate-in fade-in"
            >
              <MdErrorOutline className="text-rose-500 text-base shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded transition"
                aria-label="Dismiss error"
              >
                <MdClose size={14} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Username / Staff ID
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 text-lg pointer-events-none flex items-center justify-center">
                  <MdPersonOutline />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ar_admin or moderator1"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#7c4dff] focus:ring-4 focus:ring-purple-500/10 shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-[11px] text-gray-400">Confidential</span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 text-lg pointer-events-none flex items-center justify-center">
                  <MdLockOutline />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#7c4dff] focus:ring-4 focus:ring-purple-500/10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition p-1 rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={18} />
                  ) : (
                    <MdVisibility size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Utilities Row (Remember me) */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#7c4dff] focus:ring-[#7c4dff] transition cursor-pointer"
                />
                <span className="group-hover:text-gray-900">
                  Remember this workstation
                </span>
              </label>

              <span className="text-xs text-gray-400 italic">
                Authorized Session
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7c4dff] via-[#7040f7] to-[#5b2bf0] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <MdArrowForward size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Navigation Link */}
          <div className="pt-2 text-center text-xs text-gray-500">
            Don't have an authorized account?{" "}
            <Link
              to="/register"
              className="text-[#7c4dff] font-bold hover:text-[#6a3df0] hover:underline transition ml-1"
            >
              Create an account
            </Link>
          </div>

          {/* Supported Roles Quick Badges */}
          <div className="pt-4 border-t border-gray-200/80">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2.5">
              Authorized Institutional Roles
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: "Assistant Registrar", color: "bg-purple-50 text-purple-700 border-purple-200" },
                { label: "Moderator", color: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "Lecturer", color: "bg-blue-50 text-blue-700 border-blue-200" },
                { label: "HOD", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ].map((r, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${r.color}`}
                >
                  {r.label}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-gray-400 pt-2">
            © 2026 University Examination Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}