import { motion } from "framer-motion";
import NotificationItem from "../Notifications/NotificationItem";

const NotificationList = ({ notifications, onNotificationClick }) => (
  <div className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 max-h-80 overflow-y-auto">
    {notifications.length > 0 ? (
      <ul className="space-y-2 p-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            onClick={() => onNotificationClick(notification)} // Đảm bảo dòng này có
            className="cursor-pointer hover:bg-gray-100"
          >
            <NotificationItem notice={notification} />
          </li>
        ))}
      </ul>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <p className="text-sm text-gray-500">You have no new notifications.</p>
      </motion.div>
    )}
  </div>
);

export default NotificationList;
