import ActionButton from "@/components/Buttons/ActionButton";
import InputField from "@/components/InputFileds/InputField";

const RegisterEntryPoint = ({ formik, showPassword, setShowPassword }) => {
  return (
    <div className="w-full max-w-md rounded-2xl bg-gray-200 bg-opacity-90 p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-700 text-shadow-lg">
          VMS
        </h1>
        <div className="text-start">
          <p className="mt-2 text-lg font-bold text-[#333333]">Hello Again!</p>
          <p className="text-sm font-light text-gray-500">
            Register to Get Started
          </p>
        </div>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="transform transition-all duration-300 hover:translate-x-1">
          <InputField
            icon="person"
            name="username"
            type="text"
            formik={formik}
            placeholder="Username"
            className="rounded-xl border-2 p-3"
          />
        </div>

        <div className="transform transition-all duration-300 hover:translate-x-1">
          <InputField
            icon="person"
            name="password"
            type="password"
            formik={formik}
            placeholder="Password"
            showPasswordToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            className="rounded-xl border-2 p-3"
          />
        </div>

        <div className="transform transition-all duration-300 hover:translate-x-1">
          <InputField
            icon="person"
            name="confirmPassword"
            type="password"
            formik={formik}
            placeholder="Confirm password"
            showPasswordToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            className="rounded-xl border-2 p-3"
          />
        </div>

        <ActionButton
          label="Register"
          isSubmitting={formik.isSubmitting}
          disabled={formik.isSubmitting}
          className="rounded-xl px-6 py-4 shadow-md"
        />

        <div className="mt-4 flex items-center gap-20">
          <button
            type="button"
            onClick={() => formik.setSubmitting(false)}
            className="text-sm font-medium text-[#102530] hover:text-[#3a6b85]"
          >
            Back
          </button>
          <p className="text-sm text-gray-600">
            Already a member?{" "}
            <a href="/login" className="text-[#102530] hover:text-blue-500">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterEntryPoint;
