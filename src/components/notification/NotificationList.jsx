import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  Info,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const NotificationList = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");

  const getNotificationTime = (notice) => {
    const createdAt = notice.createdAt || new Date().toISOString();
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);
  };

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

  const handleClosePopUp = () => {
    setSelectedNotification(null);
  };

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
  return (
    <>
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
    </>
  );
};

export default NotificationList;
