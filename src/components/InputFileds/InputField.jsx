import React from "react";
import { MdMailOutline } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { IoPersonCircleOutline } from "react-icons/io5";

const InputField = ({
  icon,
  name,
  type,
  formik,
  placeholder,
  showPasswordToggle,
  showPassword,
  setShowPassword,
  className = "",
}) => {
  const IconComponent =
    icon === "email"
      ? MdMailOutline
      : icon === "phone"
        ? FaPhone
        : IoPersonCircleOutline;

  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
          <IconComponent size={icon === "phone" ? 17 : 22} />
        </div>
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`shadow-inner-md ${
            formik.touched[name] && formik.errors[name]
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-blue-500"
          } w-full rounded-sm border border-gray-300 px-3 py-3 pl-9 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {formik.touched[name] && formik.errors[name] && (
        <p className="mt-1 text-xs text-red-500">{formik.errors[name]}</p>
      )}
    </div>
  );
};
export default InputField;
