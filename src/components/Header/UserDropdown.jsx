import { motion } from "framer-motion";
import { ChevronDown, UserCircle, Settings, LogOut } from "lucide-react";
import UserAvatar from "../User/UserAvatar";
import { Link } from "react-router-dom";

const UserDropdown = ({
  fullName,
  userRole,
  isDropdownOpen,
  setIsDropdownOpen,
  handleLogout,
}) => (
  <div className="relative">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="flex items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-blue-50"
    >
      <UserAvatar />
      <div className="hidden flex-col text-left md:flex">
        <p className="text-sm font-semibold text-gray-800">{fullName}</p>
        <p className="text-xs text-gray-500">{userRole}</p>
      </div>
      <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
        <ChevronDown className="h-5 w-5 text-gray-500" />
      </motion.div>
    </motion.button>

    {isDropdownOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-100 bg-white/90 shadow-xl backdrop-blur-md"
      >
        {userRole === "USER" && (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserCircle className="h-4 w-4" /> Profile Information
            </Link>
            <Link
              to="/changePassWord"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" /> Change Password
            </Link>
          </>
        )}
        <div className="border-t border-gray-200"></div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </motion.div>
    )}
  </div>
);

export default UserDropdown;
