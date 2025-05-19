import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Key, ChevronLeft, ChevronRight } from "lucide-react";
import { registerUser } from "../services/apiRequest";
import { useFormik } from "formik";
import container from "../assets/images/Container.png";
import logo from "../assets/images/logo.png";
import logistics1 from "../assets/images/logistics1.jpg";
import logistics2 from "../assets/images/logistics2.jpg";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { checkPhoneNumber } from "../services/apiRequest";
import { checkEmail } from "../services/apiRequest";

const Register = () => {
  const [isSecondForm, setIsSecondForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [appear, setAppear] = useState(false);
  const [currentImage, setCurrentImage] = useState(0); // Thêm state cho carousel

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const firstFormSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^0\d{9}$/, "Phone number must start with 0 and be 10 digits")
      .required("Phone number is required"),
  });

  const secondFormSchema = Yup.object().shape({
    username: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
        "Username must be 8-20 characters and contain both letters and numbers"
      )
      .required("Username is required"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        "Password must contain uppercase, lowercase, number, special character and be 8-50 characters"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const firstFormFormik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
    validationSchema: firstFormSchema,
    onSubmit: async (values) => {
      try {
        const resEmail = await checkEmail(values.email);
        const resPhoneNumber = await checkPhoneNumber(values.phoneNumber);
        if (resEmail && resPhoneNumber) {
          toast.error("Email and Phone Number already exist. Please use a different one.");
        } else if (resEmail) {
          toast.error("Email already exists. Please use a different one.");
        } else if (resPhoneNumber) {
          toast.error("Phone Number already exists. Please use a different one.");
        } else {
          setIsSecondForm(true);
        }
      } catch (error) {
        toast.error("Error checking email. Please try again.");
      }
    },
  });

  const secondFormFormik = useFormik({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: secondFormSchema,
    onSubmit: async (values, { setErrors }) => {
      const newUser = {
        ...firstFormFormik.values,
        ...values,
      };
      try {
        const result = await registerUser(newUser, dispatch, navigate);
      } catch (error) {
        if (error.response && error.response.data) {
          const { code, message } = error.response.data;
          switch (code) {
            case 1017:
              setErrors({ phoneNumber: message });
              break;
            case 1018:
              setErrors({ username: message });
              break;
            case 1019:
              setErrors({ email: message });
              break;
            default:
              toast.error("An unexpected error occurred");
          }
          toast.error(message);
        }
      }
    },
  });

  useEffect(() => {
    setAppear(true);

    // Chạy carousel tự động
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % 3); // 3 hình ảnh
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % 3);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + 3) % 3);
  };

  // Update the main container and its layout
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div
        className={`w-full h-[95vh] flex flex-col md:flex-row transition-all duration-700 ease-in-out transform rounded-[2rem] overflow-hidden shadow-2xl bg-white ${
          appear ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Left Side - Graphics */}
        <div className="w-full md:w-1/2 relative h-full bg-gradient-to-br from-blue-600 to-indigo-800 rounded-r-[2rem]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {[container, logistics1, logistics2].map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Logistics ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    currentImage === index ? "opacity-100 z-10" : "opacity-0 z-0"
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

          {/* Updated carousel controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentImage === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Updated navigation arrows */}
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

        {/* Right Side - Register Form */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-20 py-12 rounded-l-[2rem]">
          {/* Updated logo container */}
          <div className="flex flex-col items-center mb-12 -mt-8">
            <div className="rounded-[1.5rem] bg-blue-50 p-6 mb-4 transition-transform duration-500 hover:scale-110 shadow-lg">
              <img src={logo} alt="VMS Logo" className="w-20 h-20" />
            </div>
            <p className="text-blue-600 text-3xl font-bold">VMS</p>
          </div>

          {/* Updated form title */}
          <div className="text-left w-full mb-8">
            <h2 className="text-4xl font-bold mb-3 text-gray-800">
              {isSecondForm ? "Create Account" : "Sign Up"}
            </h2>
            <p className="text-gray-500 text-lg">Join our logistics management system</p>
          </div>

          {/* Form content remains the same but with updated styling for inputs */}
          {!isSecondForm ? (
            <form onSubmit={firstFormFormik.handleSubmit} className="space-y-6 w-full">
              <div className="flex gap-4">
                <div className="w-1/2 transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={firstFormFormik.values.firstName}
                      onChange={firstFormFormik.handleChange}
                      className={`pl-10 text-gray-800 rounded-xl border-2 ${
                        firstFormFormik.errors.firstName ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    />
                  </div>
                  {firstFormFormik.touched.firstName && firstFormFormik.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                      {firstFormFormik.errors.firstName}
                    </p>
                  )}
                </div>

                <div className="w-1/2 transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={firstFormFormik.values.lastName}
                      onChange={firstFormFormik.handleChange}
                      className={`pl-10 text-gray-800 rounded-xl border-2 ${
                        firstFormFormik.errors.lastName ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    />
                  </div>
                  {firstFormFormik.touched.lastName && firstFormFormik.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                      {firstFormFormik.errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="transition-all duration-300 transform hover:translate-x-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={firstFormFormik.values.email}
                    onChange={firstFormFormik.handleChange}
                    className={`pl-10 text-gray-800 rounded-xl border-2 ${
                      firstFormFormik.errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  />
                </div>
                {firstFormFormik.touched.email && firstFormFormik.errors.email && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {firstFormFormik.errors.email}
                  </p>
                )}
              </div>

              <div className="transition-all duration-300 transform hover:translate-x-1">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone number (e.g., 0123456789)"
                    value={firstFormFormik.values.phoneNumber}
                    onChange={firstFormFormik.handleChange}
                    className={`pl-10 text-gray-800 rounded-xl border-2 ${
                      firstFormFormik.errors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  />
                </div>
                {firstFormFormik.touched.phoneNumber && firstFormFormik.errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {firstFormFormik.errors.phoneNumber}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={firstFormFormik.isSubmitting}
                className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800 focus:outline-none ${
                  firstFormFormik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {firstFormFormik.isSubmitting ? "Processing..." : "Next"}
              </button>

              <p className="text-center text-gray-600 mt-4">
                Already a member?{" "}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Login
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={secondFormFormik.handleSubmit} className="space-y-6 w-full">
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
                    value={secondFormFormik.values.username}
                    onChange={secondFormFormik.handleChange}
                    className={`pl-10 text-gray-800 rounded-xl border-2 ${
                      secondFormFormik.errors.username ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  />
                </div>
                {secondFormFormik.touched.username && secondFormFormik.errors.username && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {secondFormFormik.errors.username}
                  </p>
                )}
              </div>

              <div className="relative transition-all duration-300 transform hover:translate-x-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Key size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={secondFormFormik.values.password}
                    onChange={secondFormFormik.handleChange}
                    className={`pl-10 text-gray-800 rounded-xl border-2 ${
                      secondFormFormik.errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {secondFormFormik.touched.password && secondFormFormik.errors.password && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {secondFormFormik.errors.password}
                  </p>
                )}
              </div>

              <div className="relative transition-all duration-300 transform hover:translate-x-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Key size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={secondFormFormik.values.confirmPassword}
                    onChange={secondFormFormik.handleChange}
                    className={`pl-10 text-gray-800 rounded-xl border-2 ${
                      secondFormFormik.errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } block w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {secondFormFormik.touched.confirmPassword && secondFormFormik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">
                    {secondFormFormik.errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={secondFormFormik.isSubmitting}
                className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800 focus:outline-none ${
                  secondFormFormik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {secondFormFormik.isSubmitting ? "Processing..." : "Register"}
              </button>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSecondForm(false)}
                  className="text-blue-600 text-sm font-medium hover:text-blue-500 transition-colors duration-200"
                >
                  Back
                </button>
                <p className="text-gray-600 text-sm">
                  Already a member?{" "}
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Login
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;