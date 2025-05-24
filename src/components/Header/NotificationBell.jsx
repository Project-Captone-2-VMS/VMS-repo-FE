import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import NotificationList from "./NotificationList";

const NotificationBell = ({
  notifications,
  notificationCount,
  hasNewNotification,
  showNotifications,
  setShowNotifications,
  setSelectedNotification,
  setNotificationCount,
  setHasNewNotification,
  onDeleteAll,
}) => {
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setNotificationCount(0);
    setHasNewNotification(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleNotifications}
        className="group relative flex items-center rounded-full p-2 transition-all duration-300 hover:bg-blue-50"
      >
        <motion.div
          animate={hasNewNotification ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{
            repeat: hasNewNotification ? Infinity : 0,
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
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
                {notifications.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={onDeleteAll}
                    className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm text-white hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear all</span>
                  </motion.button>
                )}
              </div>
            </div>
            <NotificationList
              notifications={notifications}
              onNotificationClick={setSelectedNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

NotificationBell.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      notification: PropTypes.shape({
        type: PropTypes.string,
        title: PropTypes.string,
        content: PropTypes.string,
      }),
      createdAt: PropTypes.string,
    }),
  ).isRequired,
  notificationCount: PropTypes.number.isRequired,
  hasNewNotification: PropTypes.bool.isRequired,
  showNotifications: PropTypes.bool.isRequired,
  setShowNotifications: PropTypes.func.isRequired,
  setSelectedNotification: PropTypes.func.isRequired,
  setNotificationCount: PropTypes.func.isRequired,
  setHasNewNotification: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
};

export default NotificationBell;
