import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/apiRequest";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess } from "../redux/authSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff, LogIn, User, Key, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../assets/images/logo.png";
import container from "../assets/images/Container.png";
import logistics1 from "../assets/images/logistics1.jpg";
import logistics2 from "../assets/images/logistics2.jpg";

// Icon cho Google (màu gốc)
const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h7.07c-.26 1.37-1.04 2.53-2.21 3.31v2.79h3.57c2.08-1.92 3.28-4.74 3.28-8.11z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.79c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.34-1.36-.34-2.09s.12-1.43.34-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.19 1.65l3.15-3.15C16.45 2.09 14.25 1 12 1 7.7 1 4 4.48 4 8.97v2.52h4.27c-.1-1.1-.32-2.18-.67-3.11z"
    />
  </svg>
);

// Icon cho Facebook (màu gốc)
const FacebookIcon = () => (
  <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407 .593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.621h-3.12V24h6.116c.731 0 1.324-.593 1.324-1.324V1.324C24 .593 23.407 0 22.676 0z" />
  </svg>
);

// Icon cho Apple (màu gốc)
const AppleIcon = () => (
  <svg className="w-6 h-6" fill="#000000" viewBox="0 0 24 24">
    <path d="M12.001 0C5.373 0 0 5.373 0 12.001c0 6.628 5.373 12.001 12.001 12.001 6.628 0 12.001-5.373 12.001-12.001C24.001 5.373 18.628 0 12.001 0zm-2.215 19.883c-2.475-.59-4.33-2.688-4.5-5.011h2.828c.093 1.379 1.219 2.557 2.699 2.855v-5.738h-3.379V8.117h3.379V4.256l4.143 1.72v2.141h-4.143v4.2c.723-.069 1.458-.22 2.143-.443v3.081c-1.133.502-2.37.771-3.628.771l-.005-.003z" />
  </svg>
);

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [appear, setAppear] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    { src: container, alt: "Container Logistics" },
    { src: logistics1, alt: "Logistics Services 1" },
    { src: logistics2, alt: "Logistics Services 2" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setAppear(true);

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "username" || name === "password") {
      setErrors({ ...errors, [name]: value.trim() ? "" : errors[name] });
    }
  };

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
    setIsSubmitted(true);
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
    <div className="h-screen w-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div
        className={`w-full h-[95vh] flex flex-col md:flex-row transition-all duration-700 ease-in-out transform rounded-[2rem] overflow-hidden shadow-2xl bg-white ${
          appear ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Left Side - Update the gradient container */}
        <div className="w-full md:w-1/2 relative h-full bg-gradient-to-br from-blue-600 to-indigo-800 rounded-r-[2rem]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    index === currentImage
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                  style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.3))" }}
                />
              ))}
            </div>
          </div>

          {/* Updated VMS Title positioning */}
          <div className="absolute left-12 top-1/3 text-white z-10 -translate-y-1/2">
            <h1 
              className="text-red-600 italic text-6xl md:text-7xl font-bold mb-4" 
              style={{ fontFamily: "Poppins", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
            >
              VMS
            </h1>
            <p 
              className="text-2xl md:text-3xl font-medium leading-relaxed" 
              style={{ fontFamily: "Poppins", maxWidth: "80%" }}
            >
              Vehicle Monitoring System for Logistics Operations
            </p>
          </div>

          {/* Carousel controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-xl p-2 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-xl p-2 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Right Side - Update the form container */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-20 py-12 rounded-l-[2rem]">
          {/* Update logo container */}
          <div className="flex flex-col items-center mb-12 -mt-8">
            <div className="rounded-[1.5rem] bg-blue-50 p-6 mb-4 transition-transform duration-500 hover:scale-110 shadow-lg">
              <img src={logo} alt="VMS Logo" className="w-20 h-20" />
            </div>
            <p className="text-blue-600 text-3xl font-bold">VMS</p>
          </div>

          {/* Updated form spacing */}
          <div className="text-left w-full mb-8">
            <h2 className="text-4xl font-bold mb-3 text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-lg">Login to access your dashboard</p>
          </div>

          <form className="space-y-7 w-full" onSubmit={handleLogin}>
            <div className="transition-all duration-300 transform hover:translate-x-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className={`pl-10 text-gray-800 rounded-xl border-2 ${
                    errors.username ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="relative transition-all duration-300 transform hover:translate-x-1">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  className={`pl-10 text-gray-800 rounded-xl border-2 ${
                    errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Updated button positioning */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800 focus:outline-none ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <LogIn size={18} className="mr-2" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-gray-600 mt-4">
              Don't have an account yet?{" "}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Sign up
              </a>
            </p>
          </form>

          {/* Updated social login positioning */}
          <div className="mt-10 -mb-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute border-t border-gray-200 w-full"></div>
              <div className="relative bg-white px-4 text-sm text-gray-500">
                Or continue with
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-8">
              <button className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg">
                <GoogleIcon />
              </button>
              <button className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg">
                <FacebookIcon />
              </button>
              <button className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg">
                <AppleIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;