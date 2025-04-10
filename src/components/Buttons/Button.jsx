import { motion } from "framer-motion";

const Button = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200 ${className}`}
  >
    {children}
  </motion.button>
);

export default Button;
