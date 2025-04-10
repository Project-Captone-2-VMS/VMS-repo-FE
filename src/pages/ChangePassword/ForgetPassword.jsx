import { useEffect, useState } from "react";
import background from "../../assets/images/background.png";
import { Key } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import OtpForm from "@/components/OTPform/OtpForm";
import ChangePassWord from "../ChangePassWord";

const ForgetPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [isChangePassVisible, setIsChangePassVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer =
      countdown > 0 &&
      setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = () => {
    console.log("Verifying OTP:", otp); // Debug giá trị OTP
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số hợp lệ!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Xác minh thành công!");
      setIsOtpVisible(false);
      setIsChangePassVisible(true);
      console.log("Switching to ChangePassWord"); // Debug trạng thái chuyển đổi
      setOtp("");
    }, 1000);
  };
  const handleSendOTP = (e) => {
    e.preventDefault();

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 số!");
      return;
    }

    setIsOtpVisible(true);
    toast.success("Đã gửi OTP đến số điện thoại của bạn!");
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
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
        {!isOtpVisible && !isChangePassVisible && (
          <div className="w-full max-w-md rounded-2xl bg-gray-200 bg-opacity-90 p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#102530] opacity-70 text-shadow-lg">
                Find Your Account
              </h1>
              <p className="mt-5 text-start text-xs text-gray-500">
                Please enter your mobile number to search for your account.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSendOTP}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                  <Key size={17} />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  name="phoneNumber"
                  className="w-full rounded-sm border border-gray-300 px-3 py-3 pl-9 text-sm shadow-inner-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Input your phone number (e.g., 0123456789)"
                  maxLength="10"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="border-1 rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-black text-opacity-100 opacity-60 hover:bg-gray-600"
                >
                  <Link to="/login">Cancel</Link>
                </button>
                <button
                  type="submit"
                  className="border-1 rounded-md bg-[#102530] px-4 py-2 text-sm font-medium text-white opacity-70 hover:bg-[#060e13] hover:opacity-80"
                >
                  Send OTP
                </button>
              </div>
            </form>
          </div>
        )}

        {isOtpVisible && !isChangePassVisible && (
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
        {isChangePassVisible && <ChangePassWord />}
      </div>
    </div>
  );
};

export default ForgetPassword;
