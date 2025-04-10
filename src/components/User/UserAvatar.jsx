import { motion } from "framer-motion";
import User from "../../assets/images/user.png";

const UserAvatar = () => (
  <motion.div
    whileHover={{ rotate: 360 }}
    transition={{ duration: 0.5 }}
    className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-blue-500 ring-opacity-50"
  >
    <img className="h-full w-full object-cover" src={User} alt="User Avatar" />
  </motion.div>
);

export default UserAvatar;
