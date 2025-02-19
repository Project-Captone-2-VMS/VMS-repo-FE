import React, { useState } from "react";
import { Bell } from "lucide-react";
import moment from "moment-timezone";

const NotificationDetail = ({ notifications }) => {
  const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
  const formattedDate = moment().format("DD.MM.YYYY");

  const [localNotifications, setLocalNotifications] = useState(notifications);
  const handleAddNotification = (newContent) => {
    const newNotification = {
      notification_id: crypto.randomUUID(),
      content: newContent,
      title: "New Notification",
      type: "notification",
    };
    setLocalNotifications((prev) => [...prev, newNotification]);
  };

  //lọc notification với type === notification
  const filteredNotifications = localNotifications.filter(
    (notification) => notification.type === "notification"
  );

  return (
    <div className="mt-2 bg-white p-4 rounded-[10px] px-2 ">
      <div
        className="max-h-[300px] overflow-y-auto p-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#ccc #f0f0f0",
        }}
      >
        {filteredNotifications.map((notification, index) => (
          <div key={notification.notification_id} className="mb-4">
            <div className="p-4 mb-2 bg-[#E5FCF4] rounded-[10px] shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-[#4B4B4B]">
                  <Bell className="mr-2" />
                  <p className="text-sm font-bold">Notification {index + 1}</p>
                </div>
                <p className="text-sm text-gray-600">{formattedDate}</p>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-300" />
              <p className="text-sm text-gray-700">{notification.content}</p>
            </div>
            <p className="text-[10px] text-center text-gray-400">
              {vietnamTime}
            </p>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Add notification"
        className="w-full rounded-3xl border border-gray-300 bg-white text-left p-2 px-4 text-sm text-black mt-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.value.trim()) {
            handleAddNotification(e.target.value.trim());
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};

export default NotificationDetail;
