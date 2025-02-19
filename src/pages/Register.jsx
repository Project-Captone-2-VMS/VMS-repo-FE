import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from "../services/apiRequest";
import { useFormik } from "formik";
import container from "../assets/images/Container.png";
import circle from "../assets/images/circle.png";
import logo from "../assets/images/logo.png";
import * as Yup from "yup";
import toast from 'react-hot-toast';
import { checkPhoneNumber } from "../services/apiRequest";
import { checkEmail } from "../services/apiRequest";

const Register = () => {
  const [isSecondForm, setIsSecondForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const firstFormSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^0\d{9}$/, "Phone number must start with 0 and be 10 digits")
      .required("Phone number is required"),
  });

  const secondFormSchema = Yup.object().shape({
    username: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
        'Username must be 8-20 characters and contain both letters and numbers'
      )
      .required("Username is required"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        'Password must contain uppercase, lowercase, number, special character and be 8-50 characters'
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
        if(resEmail && resPhoneNumber){
          toast.error("Email and Phone Number already exists. Please use a different one.");
        }else if (resEmail) {
          toast.error("Email already exists. Please use a different one.");
        } else if (resPhoneNumber) {
          toast.error(
            "Phone Number already exists. Please use a different one.",
          );
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
        console.log("daaaaaaaaaaaaaaaaaaaaaaa")
        console.log("data", result.json());
        
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
              // toast.error('An unexpected error occurred');
          }
          toast.error(message);
        } 
      }
    },
  });

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
          <h1 className="text-[red] italic text-3xl lg:text-5xl font-bold">VMS</h1>
          <p className="text-sm lg:text-xl">
            Vehicle Monitoring System for Logistics Operations
          </p>
        </div>
        <img
          src={container}
          alt="container"
          className="absolute w-[82%] h-[95%] right-[2%] top-0"
        />
        <img
          src={circle}
          alt="circle"
          className="absolute left-0 bottom-0 w-[60%] h-[40%]"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center bg-[white] p-10 rounded-r-[10px]">
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="VMS Logo" className="w-[90px] mb-1" />
          <p className="text-[#055bc7] text-3xl font-bold">VMS</p>
        </div>

        {!isSecondForm ? (
          <form
            onSubmit={firstFormFormik.handleSubmit}
            className="w-full flex flex-col"
          >
            <div className="flex justify-between gap-3">
              <div className="mt-2">
                <label className="block text-sm font-normal text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="first name"
                  value={firstFormFormik.values.firstName}
                  onChange={firstFormFormik.handleChange}
                  className="text-black rounded-lg border-2 block w-full p-2"
                />
                {firstFormFormik.touched.firstName &&
                  firstFormFormik.errors.firstName && (
                    <p className="text-red-500 text-[1vw]">
                      {firstFormFormik.errors.firstName}
                    </p>
                  )}
              </div>

              <div className="mt-2">
                <label className="block text-sm font-normal text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="last name"
                  value={firstFormFormik.values.lastName}
                  onChange={firstFormFormik.handleChange}
                  className="text-black rounded-lg border-2 block w-full p-2"
                />
                {firstFormFormik.touched.lastName &&
                  firstFormFormik.errors.lastName && (
                    <p className="text-red-500 text-[1vw]">
                      {firstFormFormik.errors.lastName}
                    </p>
                  )}
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-normal text-gray-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email"
                value={firstFormFormik.values.email}
                onChange={firstFormFormik.handleChange}
                className="text-black rounded-lg border-2 block w-full p-2"
              />
              {firstFormFormik.touched.email &&
                firstFormFormik.errors.email && (
                  <p className="text-red-500 text-[1vw]">
                    {firstFormFormik.errors.email}
                  </p>
                )}
            </div>

            <div className="mt-2">
              <label className="block text-sm font-normal text-gray-500">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="phone number"
                value={firstFormFormik.values.phoneNumber}
                onChange={firstFormFormik.handleChange}
                className="text-black rounded-lg border-2 block w-full p-2"
              />
              {firstFormFormik.touched.phoneNumber &&
                firstFormFormik.errors.phoneNumber && (
                  <p className="text-red-500 text-[1vw]">
                    {firstFormFormik.errors.phoneNumber}
                  </p>
                )}
            </div>

            {firstFormFormik.errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-2">
                {firstFormFormik.errors.phoneNumber}
              </p>
            )}
            {firstFormFormik.errors.email && (
              <p className="text-red-500 text-sm mt-2">
                {firstFormFormik.errors.email}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0073ff] hover:bg-[#005bb5] text-white p-2 rounded-lg mt-6"
            >
              Next
            </button>
            <p className="mt-2 text-center text-sm font-light text-gray-500 dark:text-gray-500">
              Already a member?{" "}
              <a
                href="/login"
                className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-[#0073ff] "
              >
                Login
              </a>
            </p>
          </form>
        ) : (
          <form
            onSubmit={secondFormFormik.handleSubmit}
            className="w-full flex flex-col"
          >
            {/* Username */}
            <div className="mt-2">
              <label className="block text-sm font-normal text-gray-500">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={secondFormFormik.values.username}
                onChange={secondFormFormik.handleChange}
                className="text-black rounded-lg border-2 block w-full p-2"
              />
              {secondFormFormik.touched.username &&
                secondFormFormik.errors.username && (
                  <p className="text-red-500 text-sm">
                    {secondFormFormik.errors.username}
                  </p>
                )}
            </div>

            {/* Password */}
            <div className="mt-2 relative">
              <label className="block text-sm font-normal text-gray-500">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={secondFormFormik.values.password}
                onChange={secondFormFormik.handleChange}
                className="text-black rounded-lg border-2 block w-full p-2"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 transform -translate-y-[50%] cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {secondFormFormik.touched.password &&
                secondFormFormik.errors.password && (
                  <p className="text-red-500 text-sm">
                    {secondFormFormik.errors.password}
                  </p>
                )}
            </div>

            <div className="mt-2 relative">
              <label className="block text-sm font-normal text-gray-500">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={secondFormFormik.values.confirmPassword}
                onChange={secondFormFormik.handleChange}
                className="text-black rounded-lg border-2 block w-full p-2"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 transform -translate-y-[50%] cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {secondFormFormik.touched.confirmPassword &&
                secondFormFormik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {secondFormFormik.errors.confirmPassword}
                  </p>
                )}
            </div>
            <button
              type="submit"
              className="w-full bg-[#0073ff] text-white p-2 rounded-lg mt-4"
            >
              Register
            </button>

            <div className="flex justify-between gap-12 mt-3 mb-3 w-72">
              <button
                type="button"
                onClick={() => setIsSecondForm(false)}
                className=" text-[#0073ff] underline"
              >
                Back
              </button>
              <p className="text-center text-[1.3vw] font-light text-gray-500 dark:text-gray-500">
                Already a member?{" "}
                <a
                  href="/login"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-[#0073ff] "
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;

