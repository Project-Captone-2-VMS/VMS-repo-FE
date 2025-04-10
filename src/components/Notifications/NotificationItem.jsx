import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, Info } from "lucide-react";

const NotificationItem = ({ notice, onClick }) => {
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

  const getNotificationTime = (createdAt) => {
    const date = new Date(createdAt || new Date());
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.li
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative cursor-pointer rounded-lg border-l-4 border-blue-500 bg-white p-3 shadow-sm transition-all duration-300 hover:bg-blue-50"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-100 p-2">
          {getNotificationIcon(notice.notification?.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
              {notice.notification?.title || "No Title"}
            </p>
            <span className="text-xs text-gray-500">
              {getNotificationTime(notice.createdAt)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 group-hover:text-gray-700">
            {notice.notification?.content || "No Content"}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

export default NotificationItem;
