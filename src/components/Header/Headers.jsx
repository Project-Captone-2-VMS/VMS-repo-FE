import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../redux/authSlice";
import toast from "react-hot-toast";
import {
  getUserByUsername,
  getNoti,
  logoutSystem,
} from "../../services/apiRequest";
import { over } from "stompjs";
import {
  Bell,
  ChevronDown,
  UserCircle,
  LogOut,
  Settings,
  BellRing,
  X,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  MessageSquare,
} from "lucide-react";
import User from "../../assets/images/user.png";
import SockJS from "sockjs-client";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useDispatch } from "react-redux";

const Headers = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");
  const jwtToken = localStorage.getItem("jwtToken");

  const navigate = useNavigate();
  const dispatch = useDispatch();


  console.log("notifications" ,notifications )
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
              `New notification: ${notification.title || "You have a new notification"}`,
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
              },
            );
          }
          getNotice();
        });
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      },
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
      (notice) => notice.id !== notificationId,
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

  // Function to get notification icon based on type
  const getNotificationIcon = (notice) => {
    const type = notice.notification?.type || "SYSTEM";
    switch (type) {
      case "USER":
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case "ALERT":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "SYSTEM":
      default:
        return <Info className="h-6 w-6 text-indigo-500" />;
    }
  };

  // Function to get notification time
  const getNotificationTime = (notice) => {
    const createdAt = notice.createdAt || new Date().toISOString();
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full rounded-xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md"
    >
      <div className="flex flex-grow items-center justify-between">
        {/* Left Section */}
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

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              className="group relative flex items-center rounded-full p-2 transition-all duration-300 hover:bg-blue-50"
            >
              <motion.div
                animate={
                  hasNewNotification ? { rotate: [0, 10, -10, 10, -10, 0] } : {}
                }
                transition={{
                  repeat: hasNewNotification ? Infinity : 0,
                  repeatDelay: 5,
                  duration: 0.5,
                }}
              >
                <Bell className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
              </motion.div>

              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                >
                  {notificationCount}
                </motion.span>
              )}
              {hasNewNotification && (
                <span className="absolute right-0 top-0 h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-500"></span>
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
                  className="absolute right-0 z-50 mt-3 max-h-96 w-96 overflow-hidden rounded-xl border border-gray-100 bg-white/90 shadow-xl backdrop-blur-md"
                >
                  <div className="sticky top-0 rounded-t-xl border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-white" />
                        <h2 className="text-xl font-semibold text-white">
                          Notifications
                        </h2>
                      </div>
                      {userRole === "USER" && notifications.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={deleteAllNotifications}
                          className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm text-white transition-colors duration-200 hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Clear all</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <ul className="space-y-2 p-3">
                        {notifications.map((notice) => (
                          <motion.li
                            key={notice.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                            className="group relative cursor-pointer rounded-lg border-l-4 border-blue-500 bg-white p-3 shadow-sm transition-all duration-300 hover:bg-blue-50"
                            onClick={() => handleNotificationClick(notice)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-blue-100 p-2">
                                {getNotificationIcon(notice)}
                                
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <p className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-700">
                                    {notice.notification?.title || "No Title"}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {getNotificationTime(notice)}
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-600 group-hover:text-gray-700">
                                  {notice.notification?.content || "No Content"}
                                </p>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center p-8 text-center"
                      >
                        <Bell className="mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          You have no new notifications.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Any new activity will appear here.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-4 py-2 text-center text-xs text-gray-500">
                    Click on a notification to view details
                  </div>
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
              className="flex items-center gap-3 rounded-full p-2 transition-all duration-300 hover:bg-blue-50"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-blue-500 ring-opacity-50"
              >
                <img
                  className="h-full w-full object-cover"
                  src={User}
                  alt="Admin Avatar"
                />
              </motion.div>
              <div className="hidden flex-col text-left md:flex">
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
                className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-100 bg-white/90 shadow-xl backdrop-blur-md"
              >
                {userRole === "USER" && (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile Information
                    </Link>
                    <Link
                      to="/changePassWord"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Settings className="h-4 w-4" />
                      Change Password
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Popup */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleClosePopUp}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-1/3 overflow-hidden rounded-xl bg-white shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(selectedNotification)}
                    <h3 className="text-xl font-semibold">
                      {selectedNotification.notification.title ||
                        "Notification"}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClosePopUp}
                    className="rounded-full p-1 transition-colors hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 rounded-lg bg-blue-50 p-4">
                  <p className="text-gray-700">
                    {selectedNotification.notification.content}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClosePopUp}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-300"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => DeleteItemNotice(selectedNotification.id)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-all duration-200 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-all duration-200 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Read
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Headers;
