import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { over } from "stompjs";
import { motion } from "framer-motion";
import {
  getUserByUsername,
  getNoti,
  logoutSystem,
  deleteAllNotifications,
} from "../../services/apiRequest";
import SockJS from "sockjs-client";
import HeaderLeft from "./HeaderLeft";
import NotificationBell from "./NotificationBell";
import UserDropdown from "./UserDropdown";
import NotificationPopup from "./NotificationPopup";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const MainHeader = () => {
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserByUsername(username);
        const userData = response.result;
        setFullName(
          username === "admin123"
            ? "ADMIN"
            : `${userData.firstName} ${userData.lastName}`,
        );
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
        const sortedNotifications = [...res].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNotifications(sortedNotifications);
        setNotificationCount(sortedNotifications.length);
        setHasNewNotification(true);
      }
    };
    getNotice();

    const socket = new SockJS("http://localhost:8080/ws");
    const client = over(socket);
    client.connect(
      {},
      () => {
        client.subscribe(`/user/${username}/notifications`, () => {
          getNotice();
        });
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      },
    );

    return () => client.connected && client.disconnect();
  }, [username]);

  const handleLogout = () => {
    logoutSystem({ token: jwtToken });
    localStorage.clear();
    dispatch(logout());
    navigate("/login");
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setNotificationCount(0);
      setHasNewNotification(false);
      toast.success("All notifications have been deleted!");
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error("Failed to delete notifications. Please try again.");
    }
  };

  return (
    <motion.header className="sticky top-0 z-50 w-full rounded-xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="flex flex-grow items-center justify-between">
        <HeaderLeft fullName={fullName} />
        <div className="flex items-center gap-4">
          <NotificationBell
            notifications={notifications}
            notificationCount={notificationCount}
            hasNewNotification={hasNewNotification}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            setSelectedNotification={setSelectedNotification}
            setNotificationCount={setNotificationCount}
            setHasNewNotification={setHasNewNotification}
            onDeleteAll={handleDeleteAllNotifications}
          />
          <UserDropdown
            fullName={fullName}
            userRole={userRole}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleLogout={handleLogout}
          />
        </div>
      </div>
      <NotificationPopup
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </motion.header>
  );
};

export default MainHeader;
