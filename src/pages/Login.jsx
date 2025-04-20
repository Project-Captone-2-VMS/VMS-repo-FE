import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Key } from "lucide-react";
import { loginStart, loginSuccess } from "../redux/authSlice";
import { loginUser } from "../services/apiRequest";
import { toast } from "react-toastify";
import background from "../assets/images/background.png";

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
    if (!hasUppercase)
      return "Password must contain at least one uppercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecialChar)
      return "Password must contain at least one special character.";
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

  return (
    <div className="relative min-h-screen">
      <div
        className="brightness-80 absolute inset-0 w-full bg-cover bg-center object-contain"
        style={{
          backgroundImage: `url(${background})`,
          pointerEvents: "none",
        }}
      ></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center bg-transparent">
        <div className="w-full max-w-md rounded-2xl bg-gray-200 bg-opacity-90 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-shadow-lg text-4xl font-extrabold tracking-tight text-[#102530] opacity-70">
              VMS
            </h1>
            <div className="text-start">
              <p className="mt-2 text-lg font-bold text-[#333333]">
                Hello Again!
              </p>
              <p className="text-sm font-light text-gray-500">
                Register to Get Started
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* <div className="flex flex-col gap-5">
              <ButtonSignInGG />
              <p className="w-full rounded-lg bg-slate-200 p-[2px]"></p>
            </div> */}

            <div className="flex flex-col gap-5">
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`shadow-inner-md ${
                      errors.username
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } w-full rounded-sm border border-gray-300 px-3 py-3 pl-9 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder="User name"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                    <Key size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`shadow-inner-md ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } w-full rounded-sm border border-gray-300 px-3 py-3 pl-9 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </p>
                )}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block cursor-pointer text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgetPassword"
                  className="text-[#102530]]transition-colors font-medium duration-200 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md bg-[#102530] py-3 text-lg text-white opacity-70 transition-colors hover:bg-[#183744] ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <p className="text-center text-sm font-medium text-black">
                Don have an account yet?
                <a
                  href="/register"
                  className="ml-1 font-normal text-[#183744] hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
