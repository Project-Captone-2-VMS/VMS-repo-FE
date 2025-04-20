import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import OTPInput from "react-otp-input";
import { toast, Toaster } from "react-hot-toast";
import { auth } from "../src/firebase-config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { CgSpinner } from "react-icons/cg";

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer =
      countdown > 0 &&
      setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            toast.error("reCAPTCHA hết hạn. Vui lòng thử lại.");
          },
        },
      );
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOtp = () => {
    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }

    setLoading(true);
    const formattedPhoneNumber = "+" + phoneNumber;

    signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setShowOTP(true);
        setLoading(false);
        toast.success("OTP đã được gửi qua SMS!");
      })
      .catch((error) => {
        console.error("Lỗi khi gửi OTP:", error);
        setLoading(false);
        toast.error("Không gửi được OTP. Vui lòng thử lại!");
      });
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số hợp lệ!");
      return;
    }

    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        setUser(result.user);
        setLoading(false);
        toast.success("Xác minh thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi xác minh OTP:", error);
        setLoading(false);
        toast.error("Mã OTP không hợp lệ. Vui lòng thử lại!");
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Toaster toastOptions={{ duration: 4000 }} />
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        {user ? (
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-green-600">
              Đăng nhập thành công! 🎉
            </h2>
            <p className="text-gray-600">
              Chào mừng bạn! Số điện thoại của bạn đã được xác minh.
            </p>
          </div>
        ) : (
          <div>
            {!showOTP ? (
              <div className="space-y-4">
                <h2 className="mb-6 text-center text-2xl font-bold">
                  Xác minh số điện thoại
                </h2>

                <p className="font-medium">Số Điện Thoại</p>
                <PhoneInput
                  country={"vn"}
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Nhập số điện thoại (ví dụ: 901234567)"
                  inputProps={{
                    className: "w-full pl-12 py-2 border ",
                  }}
                />
                <p className="text-center text-xs text-gray-400">
                  Ví dụ: Nhập 901234567 sẽ tự động thành +84901234567
                </p>
                <button
                  onClick={handleSendOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading && <CgSpinner className="animate-spin" />}
                  Gửi mã OTP qua SMS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="mt-4 text-center text-3xl font-bold">
                  Xác thực mã OTP
                </h2>
                <p className="mt-1 text-center text-sm text-gray-400">
                  <span>Mã xác thực đã được gửi qua SĐT: </span>
                  <a href="#" className="font-semibold text-blue-500">
                    {phoneNumber}
                  </a>
                </p>
                <div className="flex flex-col items-center justify-center">
                  <p className="mb-4 mt-3 self-start font-medium">
                    Nhập mã OTP
                  </p>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    otpType="number"
                    disabled={false}
                    autoFocus
                    containerStyle={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      margin: "0px 0px 30px 0px",
                    }}
                    inputStyle={{
                      width: "2.5rem",
                      height: "2.5rem",
                      fontSize: "1.5rem",
                      textAlign: "center",
                      border: `2.5px solid ${otp.length === 6 ? "green" : "#ccc"}`,
                      borderRadius: "8px",
                      transition: "border 0.3s ease",
                    }}
                    renderInput={(props) => <input {...props} />}
                  />
                  <p className="flex flex-col text-gray-500">
                    {countdown > 0 ? (
                      `Chờ phản hồi ${countdown} s...`
                    ) : (
                      <button
                        onClick={() => setCountdown(5)}
                        className="flex gap-1 text-xs"
                      >
                        Bạn Chưa nhận mã OTP?{" "}
                        <p href="" className="text-blue-500">
                          {" "}
                          GỬI LẠI OTP
                        </p>
                      </button>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-white"
                  disabled={loading}
                >
                  {loading && <CgSpinner className="animate-spin" />}
                  Xác minh OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
