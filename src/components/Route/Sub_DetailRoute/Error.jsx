import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import moment from "moment-timezone";

const Error = ({ notifications }) => {
  const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");

  const [localError, setLocalError] = useState(notifications);

  // Lọc notification với type === "error"
  const filteredNotifications = localError.filter(
    (notification) => notification.type === "error"
  );

  const formattedDate = moment().format("DD.MM.YYYY");

  return (
    <div className="mt-4 bg-white p-4 rounded-[10px]">
      {filteredNotifications.map((error, index) => (
        <div key={error.notification_id} className="mb-4">
          <div className="p-4 mb-2 bg-[#FFE5E5] rounded-[10px] shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-[#4B4B4B]">
                <TriangleAlert className="mr-2 text-red-700" />
                <p className="text-sm font-bold text-red-700">
                  Error {index + 1}
                </p>
              </div>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <hr className="my-2 border-gray-200 dark:border-gray-300" />
            <p className="text-sm text-gray-700">{error.content} </p>
          </div>
          <p className="text-[10px] text-center text-gray-400">{vietnamTime}</p>
        </div>
      ))}

      {filteredNotifications.length === 0 && (
        <p className="text-gray-500 text-center text-sm mt-4">
          No error notifications to display.
        </p>
      )}
    </div>
  );
};

export default Error;
