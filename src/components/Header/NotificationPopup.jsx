import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Check } from "lucide-react";
import Button from "../Buttons/Button";
// import { getNotificationIcon } from "../Notifications/NotificationItem";

const NotificationPopup = ({
  selectedNotification,
  setSelectedNotification,
  notifications,
  setNotifications,
}) => {
  const handleClosePopUp = () => setSelectedNotification(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "USER":
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case "ALERT":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      default:
        return <Info className="h-6 w-6 text-indigo-500" />;
    }
  };

  const DeleteItemNotice = (notificationId) => {
    const updatedNotifications = notifications.filter(
      (notice) => notice.id !== notificationId,
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    setSelectedNotification(null);
  };

  return (
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
                  {getNotificationIcon(selectedNotification.notification?.type)}
                  <h3 className="text-xl font-semibold">
                    {selectedNotification.notification.title || "Notification"}
                  </h3>
                </div>
                <Button
                  onClick={handleClosePopUp}
                  className="rounded-full p-1 hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <p className="text-gray-700">
                  {selectedNotification.notification.content}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleClosePopUp}
                  className="bg-gray-200 text-gray-700"
                >
                  <X className="h-4 w-4" /> Close
                </Button>
                <Button
                  onClick={() => DeleteItemNotice(selectedNotification.id)}
                  className="bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button className="bg-blue-600 text-white">
                  <Check className="h-4 w-4" /> Mark as Read
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup;
