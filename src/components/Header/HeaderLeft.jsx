import { motion } from "framer-motion";

const HeaderLeft = ({ fullName }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center"
  >
    <div className="hidden sm:block">
      <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
        Hello, <span>{fullName}!</span>
      </h1>
      <p className="animate-pulse text-sm text-gray-500">
        Track, manage, and forecast your customers and orders.
      </p>
    </div>
  </motion.div>
);

export default HeaderLeft;
