import React, { useState } from "react";
import RouteDetail from "../Sub_DetailRoute/RouteDetail";
import NotificationDetail from "../Sub_DetailRoute/NotificationDetail";
import Error from "../Sub_DetailRoute/Error";

const CardRoute = ({ name, isOpen, onClick, locations, notifications }) => {
  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index) => {
    setToggleState(index);
  };
  return (
    <div className="cursor-pointer">
      <div
        onClick={onClick}
        className="flex h-10 bg-white mt-3 p-2 rounded-md hover:bg-gray-400"
      >
        <p>{name}</p>
      </div>

      {isOpen && (
        <div className="mt-2 bg-gray-100 py-2 w-full ">
          <div className="flex justify-between gap-1 mb-2 rounded-sm ">
            <div
              className={`px-4 py-2 w-1/3 rounded-md text-center ${
                toggleState === 1
                  ? "bg-[#E5FCF4] text-black"
                  : "bg-gray-200 hover:bg-custom-teal active:bg-custom-teal text-black"
              }`}
              onClick={() => toggleTab(1)}
            >
              Route
            </div>
            <div
              className={`px-4 py-2 w-1/3 rounded-md text-center ${
                toggleState === 2
                  ? "bg-[#E5FCF4] text-black"
                  : "bg-gray-200 hover:bg-custom-teal active:bg-custom-teal text-black"
              }`}
              onClick={() => toggleTab(2)}
            >
              {" "}
              Notification
            </div>
            <div
              className={`px-4 py-2 w-1/3 rounded-md text-center ${
                toggleState === 3
                  ? "bg-[#E5FCF4] text-black"
                  : "bg-gray-200 hover:bg-custom-teal active:bg-custom-teal text-black"
              }`}
              onClick={() => toggleTab(3)}
            >
              {" "}
              Error
            </div>
          </div>

          <div className="p-2 bg-white rounded-md">
            {toggleState === 1 && <RouteDetail locations={locations} />}
            {toggleState === 2 && (
              <NotificationDetail notifications={notifications} />
            )}
            {toggleState === 3 && <Error notifications={notifications} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardRoute;
