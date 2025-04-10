import ButtonSignInGG from "../../components/Buttons/ButtonSignInGG";
import InputField from "@/components/InputFileds/InputField";
import ActionButton from "@/components/Buttons/ActionButton";

const RegisterFirstForm = ({ formik }) => {
  return (
    <div className="w-full max-w-md rounded-2xl bg-gray-200 bg-opacity-90 p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#102530] opacity-70 text-shadow-lg">
          VMS
        </h1>
        <div className="text-start">
          <p className="mt-2 text-lg font-bold text-[#333333]">Hello Again!</p>
          <p className="text-sm font-light text-gray-500">
            Register to Get Started
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="flex flex-col gap-5">
          <ButtonSignInGG />
          <p className="w-full rounded-lg bg-slate-200 p-[2px]"></p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <InputField
              icon="person"
              name="firstName"
              type="text"
              formik={formik}
              placeholder="First name"
            />
            <InputField
              icon="person"
              name="lastName"
              type="text"
              formik={formik}
              placeholder="Last name"
            />
          </div>
          <InputField
            icon="email"
            name="email"
            type="email"
            formik={formik}
            placeholder="Email"
          />
          <InputField
            icon="phone"
            name="phoneNumber"
            type="tel"
            formik={formik}
            placeholder="Phone number"
          />
        </div>

        <div className="flex flex-col gap-2">
          <ActionButton
            label="VERIFY"
            isSubmitting={formik.isSubmitting}
            disabled={formik.isSubmitting}
          />
          <p className="text-center text-sm font-medium text-black">
            Already a member?{" "}
            <a
              href="/login"
              className="font-normal text-[#183744] hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterFirstForm;
