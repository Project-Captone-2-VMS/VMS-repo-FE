import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import toast from "react-hot-toast";
import { getUserByUsername, getNoti, logoutSystem } from "../../services/apiRequest";
import { over } from "stompjs";
import {
  Bell,
  ChevronDown,
  UserCircle,
  LogOut,
  Settings,
  Menu,
  BellRing,
} from "lucide-react";
import User from "../../assets/images/user.png";
import SockJS from "sockjs-client";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [ChangePassword, setChangePassword] = useState([]);

  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");
  const jwtToken = localStorage.getItem("jwtToken");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserByUsername(username);
        const userData = response.result;
        if (username === "admin123") {
          setFullName("ADMIN");
        } else {
          const { firstName, lastName } = userData;
          setFullName(`${firstName} ${lastName}`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (userRole === "USER") {
      const storedNotifications =
        JSON.parse(localStorage.getItem("notifications")) || [];
      setNotifications(storedNotifications);
      setNotificationCount(storedNotifications.length);
    }
  }, [userRole]);

  useEffect(() => {
    if (!username) return;

    const getNotice = async () => {
      const res = await getNoti(username);
      if (res) {
        setNotifications(res);
        setNotificationCount(res.length);
        setHasNewNotification(true);
      }
    };
    getNotice();
    const socket = new SockJS("http://localhost:8080/ws");
    const client = over(socket);

    client.connect(
      {},
      () => {
        console.log(`Connected to WebSocket as ${username}`);
        client.subscribe(`/user/${username}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          if (notification.type === "SYSTEM") {
            toast.success(
              `New notification: ${notification.title || "You have a new notification"}`
            );
          } else if (notification.type === "USER") {
            toast.success("You have a new message!", { duration: 10000 });
          } else if (notification.type === "ALERT") {
            toast.success(
              `Warning: ${notification.title || "You have a new message!"}`,
              {
                icon: "⚠️",
                style: { background: "#FF2929", color: "#FAB12F" },
                duration: 10000,
              }
            );
          }
          getNotice();
        });
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  }, [username]);

  const DeleteItemNotice = (notificationId) => {
    const updatedNotifications = notifications.filter(
      (notice) => notice.id !== notificationId
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    setSelectedNotification(null);
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    localStorage.removeItem("notifications");
    toast.success("All notifications have been deleted!");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setNotificationCount(0);
    setHasNewNotification(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    const formData = { token: `${jwtToken}` };
    logoutSystem(formData);
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("jwtToken");
    dispatch(logout());
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);
  };

  const handleClosePopUp = () => {
    setSelectedNotification(null);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 shadow-lg rounded-xl px-4 py-3"
    >
      <div className="flex flex-grow items-center justify-between">
        {/* Left Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hello, <span>{fullName}!</span>
            </h1>
            <p className="text-sm text-gray-500 animate-pulse">
              Track, manage, and forecast your customers and orders.
            </p>
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              className="relative group flex items-center p-2 rounded-full hover:bg-blue-50 transition-all duration-300"
            >
              <Bell className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold"
                >
                  {notificationCount}
                </motion.span>
              )}
              {hasNewNotification && (
                <span className="absolute top-0 right-0 h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="absolute inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-96 max-h-96 overflow-y-auto bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100"
                >
                  <div className="sticky top-0 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                    {userRole === "USER" && (
                      <button
                        onClick={deleteAllNotifications}
                        className="absolute right-4 top-3 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <ul className="p-3 space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((notice) => (
                        <li
                          key={notice.id}
                          className="group p-3 rounded-lg bg-white hover:bg-gray-100 shadow-sm cursor-pointer transition-all duration-300 hover:scale-105"
                          onClick={() => handleNotificationClick(notice)}
                        >
                          <p className="text-sm font-semibold text-gray-800">
                            {notice.notification?.title || "No Title"}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {notice.notification?.content || "No Content"}
                          </p>
                        </li>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        You have no new notifications.
                      </div>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDropdown}
              className="flex items-center gap-3 p-2 rounded-full hover:bg-blue-50 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-blue-500 ring-opacity-50"
              >
                <img
                  className="h-full w-full object-cover"
                  src={User}
                  alt="Admin Avatar"
                />
              </motion.div>
              <div className="hidden md:flex flex-col text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {fullName || ""}
                </p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </motion.button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100"
              >
                {userRole === "USER" && (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile Information
                    </Link>
                    <Link
                      to="/changePassWord"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                    >
                      <Settings className="h-4 w-4" />
                      Change Password
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-1/3 bg-white rounded-xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedNotification.notification.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {selectedNotification.notification.content}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleClosePopUp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => DeleteItemNotice(selectedNotification.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;