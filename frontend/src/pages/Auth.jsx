import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isSignup
        ? `${BACKEND_URL}/auth/register`
        : `${BACKEND_URL}/auth/login`;

      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });


      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message  || "Authentication failed");
      }

      toast.success("Login successful");
      navigate("/auth/success");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    toast.info("Redirecting to Google...")
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-pink-500/20">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isSignup ? "Sign up to get started" : "Sign in to continue"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="relative">
                <input
                  name="username"
                  placeholder="Username"
                  onChange={handleChange}
                  value={form.username}
                  required
                  className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={form.email}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-200"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                value={form.password}
                required
                className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-200"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={googleLogin}
              className="w-full py-3 px-6 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-semibold text-gray-700 flex items-center justify-center gap-3 transition-all duration-200 hover:border-gray-300 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-indigo-600 hover:text-purple-600 font-medium transition-colors duration-200"
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "New user? Create account"}
              </button>
            </div>
          </form>
        </div>

        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
