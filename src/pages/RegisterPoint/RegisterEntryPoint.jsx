import { useEffect, useState } from "react";
import {
  checkEmail,
  checkPhoneNumber,
  registerUser,
} from "../../services/apiRequest";
import * as Yup from "yup";
import toast from "react-hot-toast";
import background from "../../assets/images/datnuoc.jpg"; // Import the tank image
import RegisterFirstForm from "./RegisterFirstForm";
import RegisterSecondForm from "./RegisterSecondForm";
import OtpForm from "../../components/OTPform/OtpForm";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { useNavigate } from "react-router";

const Register2 = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isSecondForm, setIsSecondForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpVisible, setIsOtpVisible] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const timer =
      countdown > 0 &&
      setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số hợp lệ!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Xác minh thành công!");
      setIsOtpVisible(false);
      setIsSecondForm(true);
      setOtp("");
    }, 1000);
  };

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
        "Username must be 8-20 characters and contain both letters and numbers",
      )
      .required("Username is required"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/,
        "Password must contain uppercase, lowercase, number, special character and be 8-50 characters",
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
          toast.error("Email and Phone Number already exist.");
        } else if (resEmail) {
          toast.error("Email already exists.");
        } else if (resPhoneNumber) {
          toast.error("Phone Number already exists.");
        } else {
          setPhoneNumber(values.phoneNumber);
          setIsOtpVisible(true);
        }
      } catch (error) {
        toast.error("Error checking email or phone number.");
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
      if (!secondFormFormik.isValid) {
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
        return;
      }
      const newUser = {
        ...firstFormFormik.values,
        ...values,
      };
      try {
        await registerUser(newUser, dispatch, navigate);
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
          {!isOtpVisible && !isSecondForm && (
            <RegisterFirstForm formik={firstFormFormik} />
          )}
          {isOtpVisible && !isSecondForm && (
            <OtpForm
              phoneNumber={phoneNumber}
              otp={otp}
              setOtp={setOtp}
              countdown={countdown}
              setCountdown={setCountdown}
              handleVerifyOtp={handleVerifyOtp}
              setIsOtpVisible={setIsOtpVisible}
              loading={loading}
            />
          )}
          {isSecondForm && !isOtpVisible && (
            <RegisterSecondForm
              formik={secondFormFormik}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
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

export default Register2;