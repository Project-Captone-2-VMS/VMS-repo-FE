import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/apiRequest";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess } from "../redux/authSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import container from "../assets/images/Container.png";
import circle from "../assets/images/circle.png";
import logo from "../assets/images/logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "username" || name === "password") {
      setErrors({
        ...errors,
        [name]: value.trim() ? "" : errors[name],
      });
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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateInputs()) return;

    const { username, password } = formData;
    const user = { username, password };

    dispatch(loginStart());
    try {
      const userData = await loginUser(user, dispatch, navigate);
      dispatch(loginSuccess(userData));

      if (userData) {
        const userRole = userData.result.roles[0];
        navigate(userRole === "ADMIN" ? "/dashboard" : "/driveuser");
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
    }
  };

  return (
    <div className="bg-[rgb(243,238,250)] flex h-screen p-[30px]">
      <div
        className="flex-[2] justify-center items-center relative rounded-l-[10px] hidden md:flex"
        style={{
          background:
            "linear-gradient(180deg, #0575e6 0%, #02298a 85%, #021b79 100%)",
        }}
      >
        <div className="z-[2] absolute text-[white] left-[10%] top-[20%]">
          <h1
            className="text-[red] italic text-3xl lg:text-5xl font-bold leading-[normal]"
            style={{ fontFamily: "Poppins" }}
          >
            VMS
          </h1>
          <p
            className="not-italic text-sm lg:text-xl font-medium leading-[normal] text-[white]"
            style={{ fontFamily: "Poppins" }}
          >
            Vehicle Monitoring System for Logistics Operations
          </p>
        </div>
        <img
          src={container}
          alt="Multimodal Logistics Trade"
          className="z-[1] absolute w-[82%] h-[95%] right-[2%] top-0"
        />
        <img
          src={circle}
          alt="circle"
          className="absolute left-0 bottom-0 w-[60%] h-[40%]"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center bg-[white] p-10 rounded-r-[10px]">
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="VMS Logo" className="w-[80px] " />
          <p className="text-[#055bc7] text-2xl font-bold">VMS</p>
        </div>

        <div className="text-left w-full">
          <h2 className="text-3xl font-semibold mb-2">Hello</h2>
          <p className="text-sm text-gray-500 mb-4">Login to Get Started</p>
        </div>

        <form
          className="space-y-4 md:space-y-2 w-full flex flex-col "
          onSubmit={handleLogin}
        >
          <div>
            <label
              htmlFor="username"
              className="block text-ms font-normal text-gray-500 dark:text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`text-black rounded-lg border-2 ${
                errors.username ? "border-red-500" : "border-inherit"
              } block w-full p-2.5`}
              value={formData.username}
              onChange={handleChange}
            />
            <p
              className="text-red-500 text-[0.7vw] mt-1"
              style={{ minHeight: "16px" }}
            >
              {errors.username}
            </p>
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-1 text-ms font-normal text-gray-500"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              name="password"
              className={`text-black rounded-lg border-2 ${
                errors.password ? "border-red-500" : "border-inherit"
              } block w-full p-2.5`}
              value={formData.password}
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400" />
              ) : (
                <Eye size={20} className="text-gray-400" />
              )}
            </span>
            <p
              className="text-red-500 text-[.7vw] mt-1"
              style={{ minHeight: "16px" }}
            >
              {errors.password}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0073ff] text-white cursor-pointer text-base p-3 rounded-[5px] border-[none] hover:bg-[#005bb5]"
          >
            Sign in
          </button>
          <p className="text-sm font-light text-gray-500 dark:text-gray-500">
            Don’t have an account yet?{" "}
            <a
              href="/register"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-[#0073ff]"
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
