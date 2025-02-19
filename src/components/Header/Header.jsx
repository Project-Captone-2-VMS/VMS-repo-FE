import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import toast from "react-hot-toast";
import { getUserByUsername, getNoti,logoutSystem } from "../../services/apiRequest";
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

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const [ChangePassword, setChangePassword] = [];

  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");
  const jwtToken = localStorage.getItem("jwtToken")

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
              `New notification: ${
                notification.title || "You have a new notification"
              }`,
            );
          } else if (notification.type === "USER") {
            toast.success("You have a new message!", {
              duration: 10000,
            });
          } else if (notification.type === "ALERT") {
            toast.success(
              `Warning: ${notification.title || "You have a new message!"}`,
              {
                icon: "⚠️",
                style: {
                  background: "#FF2929",
                  color: "#FAB12F",
                },
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
    const formData={
      "token": `${jwtToken}`
    }
    logoutSystem(formData)
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
    <header className="sticky top-0 z-50 flex w-full rounded-md border-2 bg-white px-2">
      <div className="flex flex-grow items-center justify-between py-2">
        <div className="flex items-center">
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">
              Hello, <span className="text-text-Default">{fullName}!</span>
            </h1>
            <p className="text-sm text-text-Comment">
              Track, manage, and forecast your customers and orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="flex rounded-full p-2 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {notificationCount.length > 0 && (
                  <p className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-black">
                    {notificationCount.length}
                  </p>
                )}
              </button>
              {hasNewNotification && (
                <p className="absolute right-1 top-1 h-3 w-3 animate-ping rounded-full bg-green-400"></p>
              )}{" "}
            </div>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-lg border-2 border-slate-300 bg-white shadow-lg">
                <div className="sticky top-0 flex justify-between border-b bg-white px-2 py-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Notifications
                  </h2>
                  {userRole === "USER" && (
                    <button
                      onClick={deleteAllNotifications}
                      className="hover:none rounded-md border-2 border-slate-100 px-2 text-sm hover:bg-slate-100"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1 px-3 py-1">
                    {notifications.map((notice) => (
                      <li
                        key={notice.id}
                        className="mb-2 cursor-pointer rounded-lg border-0 bg-slate-100 px-2 py-1 shadow-md hover:bg-gray-200"
                        onClick={() => handleNotificationClick(notice)}
                      >
                        <p className="flex gap-2 text-sm font-medium text-gray-700">
                          <strong>
                            {notice.notification?.title || "No Title"}
                          </strong>
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {notice.notification?.content || "No Content"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    You have no new notifications.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full">
                <img
                  className="h-full w-full object-cover"
                  src={User}
                  alt="Admin Avatar"
                />
              </div>
              <div className="flex flex-col text-left">
                <p className="text-sm font-medium text-gray-900">
                  {fullName || ""}
                </p>
                <p className="text-xs text-gray-400">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            { isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg">
                {userRole === "USER" && (
                  <div>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <UserCircle className="h-4 w-4" />
                  <Link to="/profile">Profile Information</Link>
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="h-4 w-4" />
                  <Link to="/changePassWord">Change Password</Link>
                </button>
                  </div>
                )}
              
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedNotification && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedNotification.notification.title}
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              {selectedNotification.notification.content}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleClosePopUp}
                className="rounded-lg bg-blue-500 px-3 py-1 text-white"
              >
                Close
              </button>
              <button
                onClick={() => DeleteItemNotice(selectedNotification.id)}
                className="rounded-lg bg-red-500 px-3 py-1 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
