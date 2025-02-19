import React from "react";
import { BadgeAlert } from "lucide-react";

const CardRouteUser = () => {
  return (
    <div className="bg-white border-2 px-2 py-2 rounded-lg hover:border-blue-400 cursor-pointer hover:bg-slate-100">
      <div className=" flex flex-col">
        <div className="flex justify-between items-center">
          <p className="font-bold text-[1.8vw]"> Route Đà Nẵng - Huê</p>
          <p className="text-blue-600 font-extrabold text-[1.6vw]"> ON</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-gray-400 text-[1.5vw] "> 5 point</p>
            <p className="text-gray-400 text-[1.5vw] "> 20/8/2024</p>
          </div>
          <button className="text-[1.5vw] px-2 py-1 bg-blue-200 rounded-lg text-blue-700 font-bold">
            {" "}
            Build time
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardRouteUser;
