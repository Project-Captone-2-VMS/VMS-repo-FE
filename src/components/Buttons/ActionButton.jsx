
const ActionButton = ({
  label,
  isSubmitting,
  onClick,
  disabled,
  className,
}) => {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`w-full rounded-md bg-[#102530] py-3 text-lg text-white opacity-70 transition-colors hover:bg-[#183744] ${
        isSubmitting || disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className || ""}`}
    >
      {isSubmitting ? "Processing..." : label}
    </button>
  );
};

export default ActionButton;
