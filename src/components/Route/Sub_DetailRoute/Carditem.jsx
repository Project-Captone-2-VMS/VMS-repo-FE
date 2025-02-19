import React from "react";

const CardItem = ({ name, total_hour, distance, status }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{name}</h2>
      <hr className="border-gray-200 mb-6" />

      <div className="grid grid-cols-2 gap-y-4 text-gray-500">
        <div className="flex flex-col">
          <span className="text-sm">Item Quantity</span>
          <span className="text-lg font-semibold text-gray-900">23 Items</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm">Total Hour</span>
          <span className="text-lg font-semibold text-gray-900">
            {total_hour}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm"> Distance</span>
          <span className="text-lg font-semibold text-gray-900">
            {distance}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm">Status</span>
          <div
            className={`mt-1 w-20 h-8 ${
              status === "Done" ? "bg-green-300" : "bg-yellow-300"
            } text-gray-900 text-center rounded-full flex items-center justify-center`}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
