import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ROLE_USER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, fullName, password, role);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : null) || "Registration failed. Try a different username.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-[#7c4dff]">
          Register
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-4 text-center bg-green-50 p-2.5 rounded-lg border border-green-100">
            Registered! Redirecting to login...
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]"
          required
        />

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]"
          required
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]"
          required
        />

        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]"
        >
          <option value="ROLE_USER">Lecturer</option>
          <option value="ROLE_GUEST">Head of Department (HOD)</option>
          <option value="ROLE_MODERATOR">Moderator</option>
          <option value="ROLE_ADMIN">Assistant Registrar (AR)</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7c4dff] text-white py-2 rounded-lg font-semibold hover:bg-[#6a3df0] disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#7c4dff] font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
