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
  deleteNotification,
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
  // Thêm state để quản lý hiệu ứng flash
  const [flashIntervalId, setFlashIntervalId] = useState(null);
  // Thêm state để theo dõi div chớp đỏ
  const [flashDiv, setFlashDiv] = useState(null);

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

  // Sửa lại hàm tạo hiệu ứng chớp đỏ
  const startFlashingScreen = () => {
    // Tạo div chớp đỏ nếu chưa tồn tại
    if (!flashDiv) {
      const newFlashDiv = document.createElement("div");
      newFlashDiv.style.position = "fixed";
      newFlashDiv.style.top = 0;
      newFlashDiv.style.left = 0;
      newFlashDiv.style.width = "100vw";
      newFlashDiv.style.height = "100vh";
      newFlashDiv.style.backgroundColor = "rgba(255,0,0,0.4)";
      newFlashDiv.style.zIndex = 9998; // Giảm z-index để popup có thể hiện lên trên
      newFlashDiv.style.transition = "opacity 0.3s";
      newFlashDiv.style.pointerEvents = "none"; // Ngăn chặn click event trên flash div

      document.body.appendChild(newFlashDiv);
      setFlashDiv(newFlashDiv);

      // Bắt đầu hiệu ứng nhấp nháy
      const intervalId = setInterval(() => {
        newFlashDiv.style.opacity =
          newFlashDiv.style.opacity === "0" ? "1" : "0";
      }, 500);
      setFlashIntervalId(intervalId);
    }
  };

  // Hàm dừng hiệu ứng chớp đỏ
  const stopFlashingScreen = () => {
    if (flashDiv) {
      // Xóa interval
      if (flashIntervalId) {
        clearInterval(flashIntervalId);
        setFlashIntervalId(null);
      }
      // Xóa div khỏi DOM
      document.body.removeChild(flashDiv);
      setFlashDiv(null);
    }
  };

  // Sửa lại trong useEffect WebSocket
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
        client.subscribe(`/user/${username}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          if (notification.type === "ALERT") {
            // Bắt đầu hiệu ứng chớp đỏ
            startFlashingScreen();
            // Hiện popup ALERT
            setSelectedNotification({
              id: notification.id || Date.now(),
              notification,
              createdAt: notification.createdAt || new Date().toISOString(),
            });
            // Tự động tắt popup sau 15s nếu chưa bấm Mark as Read
            setTimeout(() => {
              setSelectedNotification(null);
              stopFlashingScreen();
            }, 15000);
          } else if (notification.type === "SYSTEM") {
            toast.success(`New notification: ${notification.title}`);
          } else if (notification.type === "USER") {
            toast.success("You have a new message!");
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
        client.disconnect();
      }
      stopFlashingScreen();
    };
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

  // Sửa lại hàm handleMarkAsRead
  const handleMarkAsRead = () => {
    stopFlashingScreen();
    setSelectedNotification(null);
  };

  // Thêm hàm xử lý khi đóng popup (bao gồm cả việc tắt flash)
  const handleClosePopup = () => {
    stopFlashingScreen();
    setSelectedNotification(null);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const updatedNotifications = notifications.filter(
        (notice) => notice.notification.id !== notificationId,
      );
      setNotifications(updatedNotifications);
      setNotificationCount(updatedNotifications.length);
      toast.success("Notification deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification. Please try again.");
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
        setSelectedNotification={handleClosePopup} // Sử dụng hàm mới
        notifications={notifications}
        setNotifications={setNotifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </motion.header>
  );
};

export default MainHeader;