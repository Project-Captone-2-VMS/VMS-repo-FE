import { FcGoogle } from "react-icons/fc";

const buttonSignInGG = () => {
  return (
    <button
      type="button"
      className="rounded-xs shadow-inner-md flex w-full items-center justify-center border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
    >
      <FcGoogle className="mr-2 h-7 w-6" />
      <p className="text-sm font-normal text-[#333333] opacity-70">
        Sign in with Google
      </p>
    </button>
  );
};

export default buttonSignInGG;
