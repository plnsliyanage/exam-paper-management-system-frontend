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
  MdArrowForward,
  MdErrorOutline,
  MdClose,
  MdVerifiedUser,
  MdCheck,
  MdShield,
  MdHelpOutline,
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
      setError("Please enter both your Username and Password.");
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
          "Authentication failed. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo username for smooth reviewer UX
  const handleQuickRole = (roleUsername) => {
    setUsername(roleUsername);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#070a13] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDE: HERO & UNIVERSITY BRANDING SECTION (55% Desktop)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative lg:w-[54%] xl:w-[56%] flex flex-col justify-between p-8 sm:p-12 xl:p-16 bg-gradient-to-br from-[#070a13] via-[#0d1222] to-[#181335] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
        {/* Ambient Radial Glow Lighting */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle Matrix Academic Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden="true"
        />

        {/* Top: University Brand Area */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Crest Emblem */}
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c4dff] via-[#9366ff] to-[#c084fc] p-[1.5px] shadow-lg shadow-purple-500/25 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                  <MdSchool className="text-2xl text-[#a78bfa]" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b0f19] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white font-['Outfit']">
                  UNIVERSITY EXAMINATION PORTAL
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Centralized Assessment & Moderation Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hero Narrative & Interactive Workflow Showcase */}
        <div className="relative z-10 my-10 lg:my-auto max-w-xl space-y-7">
          {/* Security & Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-medium text-purple-200 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-semibold tracking-wide">
              Official University Academic Network
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-['Outfit']">
            Streamlining Examination Lifecycle with{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#f472b6] bg-clip-text text-transparent">
              Zero-Trust Security.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
            A unified, role-governed platform orchestrating exam paper preparation,
            confidential multi-point moderation, automated printing pipelines,
            and real-time institutional compliance auditing.
          </p>

          {/* Glassmorphism Feature Card: Live Lifecycle Widget */}
          <div className="backdrop-blur-xl bg-white/[0.035] border border-white/[0.1] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <MdShield className="text-[#a78bfa] text-lg" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">
                  Active Examination Lifecycle Pipeline
                </span>
              </div>
              <span className="text-[10px] text-purple-300 font-bold bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Semester 2, 2026
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { stage: "Drafting", status: "Complete", active: false, done: true },
                { stage: "Moderation", status: "In Review", active: true, done: false },
                { stage: "Print Queue", status: "Scheduled", active: false, done: false },
                { stage: "Exam Ready", status: "Final Stage", active: false, done: false },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    s.active
                      ? "bg-purple-600/20 border-purple-500/40 shadow-inner"
                      : s.done
                      ? "bg-white/[0.03] border-white/[0.08]"
                      : "bg-white/[0.015] border-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      0{idx + 1}
                    </span>
                    {s.done && <MdCheck className="text-xs text-emerald-400" />}
                    {s.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {s.stage}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.status}</p>
                </div>
              ))}
            </div>

            {/* Micro Metrics Row */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MdVerifiedUser className="text-emerald-400 text-sm" />
                <span className="text-[11px] text-slate-300 font-medium">
                  256-Bit Cryptographic Envelope
                </span>
              </div>
              <span className="text-[11px] text-purple-300 font-semibold">
                99.98% On-Time Moderation
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Left Hero Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-5 border-t border-white/[0.08]">
          <span className="text-slate-500">
            Institutional Examination Authority
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c4dff]" />
            Role-Gated Access Control
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT SIDE: PREMIUM AUTHENTICATION PANEL (45% Desktop)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:w-[46%] xl:w-[44%] flex items-center justify-center p-6 sm:p-10 xl:p-14 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] text-slate-900 min-h-full">
        <div className="w-full max-w-md space-y-7">
          {/* Header Card Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7c4dff] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Staff Authentication
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                <MdSecurity className="text-emerald-600 text-sm" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Sign in with your university credentials to access the examination portal.
            </p>
          </div>

          {/* Dismissible Error Alert Banner */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 shadow-sm transition-all"
            >
              <MdErrorOutline className="text-rose-500 text-base shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                aria-label="Dismiss error"
              >
                <MdClose size={14} />
              </button>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Username or Staff ID <span className="text-[#7c4dff]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 text-lg pointer-events-none flex items-center justify-center">
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
                  placeholder="e.g. ar_admin, moderator1, or lecturer1"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#7c4dff] focus:ring-4 focus:ring-purple-500/10 shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password <span className="text-[#7c4dff]">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Confidential
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 text-lg pointer-events-none flex items-center justify-center">
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
                  placeholder="Enter your confidential password"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#7c4dff] focus:ring-4 focus:ring-purple-500/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition p-1 rounded-md cursor-pointer"
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

            {/* Session Utilities Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#7c4dff] focus:ring-[#7c4dff] transition cursor-pointer accent-[#7c4dff]"
                />
                <span className="group-hover:text-slate-900 font-medium">
                  Remember this workstation
                </span>
              </label>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MdHelpOutline size={13} />
                <span>Single Sign-On</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7c4dff] via-[#7040f7] to-[#5825eb] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide mt-3 cursor-pointer"
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
          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an authorized account?{" "}
            <Link
              to="/register"
              className="text-[#7c4dff] font-bold hover:text-[#5825eb] hover:underline transition ml-1"
            >
              Create an account
            </Link>
          </div>

          {/* Supported Roles Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-200/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Authorized Institutional Roles
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: "Assistant Registrar", id: "ar_admin", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                { label: "Moderator", id: "moderator1", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                { label: "Lecturer", id: "lecturer1", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                { label: "HOD", id: "hod1", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
              ].map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickRole(r.id)}
                  title={`Click to test as ${r.label}`}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${r.color}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-slate-400 pt-1">
            © 2026 University Examination Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}