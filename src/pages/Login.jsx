import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Key } from "lucide-react";
import { loginStart, loginSuccess } from "../redux/authSlice";
import { loginUser } from "../services/apiRequest";
import { toast } from "react-toastify";
import background from "../assets/images/datnuoc.jpg"; // Import the tank image

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) return "Password must be at least 8 characters.";
    if (!hasUppercase) return "Password must contain at least one uppercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "username" || name === "password") {
      setErrors({ ...errors, [name]: value.trim() ? "" : errors[name] });
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    const { username, password } = formData;
    const user = { username, password };
    dispatch(loginStart());
    try {
      const userData = await loginUser(user, dispatch, navigate);
      dispatch(loginSuccess(userData));
      if (userData) {
        toast.success("Login successful!");
        const userRole = userData.result.roles[0];
        setTimeout(() => {
          navigate(userRole === "ADMIN" ? "/dashboard" : "/driveuser");
        }, 1000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({
          username: "Invalid username or password.",
          password: "Invalid username or password.",
        });
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
        }}
      ></div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 w-full h-full bg-black bg-opacity-40"></div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Anniversary Text */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-red-500 drop-shadow-md">
            Cùng Duy Tân Chào Mừng 50 Năm Thống Nhất
          </h2>
          <p className="text-2xl md:text-3xl mt-2 text-yellow-500 drop-shadow-md">
            Đất Nước 30/4/1975 - 30/4/2025
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md rounded-2xl bg-white bg-opacity-90 p-8 shadow-2xl animate-fade-in">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 drop-shadow-md">
              VMS
            </h1>
            <div className="mt-2">
              <p className="text-lg font-bold text-gray-700">
                Hello Again!
              </p>
              <p className="text-sm font-light text-gray-500">
                Sign in to Continue
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col gap-5">
              {/* Username Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full rounded-sm border px-3 py-3 pl-10 text-sm text-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 ${
                      errors.username
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-300 focus:border-red-400"
                    }`}
                    placeholder="User name"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                    <Key size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full rounded-sm border px-3 py-3 pl-10 pr-10 text-sm text-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-300 focus:border-red-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-red-500 focus:ring-red-400"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block cursor-pointer text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgetPassword"
                  className="font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button and Sign Up Link */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md bg-red-500 py-3 text-lg font-semibold text-white hover:bg-red-600 hover:shadow-lg transition-all duration-300 ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <p className="text-center text-sm font-medium text-gray-700">
                Don't have an account yet?{" "}
                <a
                  href="/register"
                  className="font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-in-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Login;