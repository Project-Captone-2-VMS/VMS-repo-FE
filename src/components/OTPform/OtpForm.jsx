import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import OTPInput from "react-otp-input";

const OTP = ({
  setIsOtpVisible,
  otp,
  setOtp,
  countdown,
  loading,
  setCountdown,
  handleVerifyOtp,
}) => {
  // const [otp, setOtp] = useState("");
  // const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer =
      countdown > 0 &&
      setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleBack = () => {
    setIsOtpVisible(false); // Quay lại form nhập số điện thoại
    setOtp(""); // Xóa OTP đã nhập
  };
  return (
    <>
      <div className="w-80 rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-between text-sm text-blue-500">
          <button onClick={handleBack}>Back</button>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold">Enter OTP</h2>
        <p className="mt-1 text-center text-sm text-gray-500">
          <span>Type in the 6-digit code sent to the number </span>
          <a href="#" className="font-semibold text-blue-500">
            +84 961055444
          </a>
        </p>

        <div className="mt-4 flex justify-center">
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            inputStyle={{
              width: "2.5rem",
              height: "2.5rem",
              margin: "0 5px",
              fontSize: "1.5rem",
              textAlign: "center",
              border: `2.5px solid ${otp.length === 6 ? "green" : "#ccc"}`,
              borderRadius: "8px",
              transition: "border 0.3s ease",
            }}
            renderInput={(props) => <input {...props} />}
          />
        </div>

        <p className="mt-3 text-center text-sm text-gray-500">
          {countdown > 0 ? (
            `Resend OTP in ${countdown} seconds...`
          ) : (
            <button
              className="font-semibold text-blue-500"
              onClick={() => setCountdown(30)}
            >
              Resend OTP
            </button>
          )}
        </p>

        <button
          onClick={handleVerifyOtp}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-white"
          disabled={loading}
        >
          {loading && <CgSpinner className="animate-spin" />}
          Xác minh OTP
        </button>
      </div>
    </>
  );
};

export default OTP;
