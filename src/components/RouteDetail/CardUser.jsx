import React from "react";

const CardUser = () => {
  return (
    <div className="">
      <a
        href="#"
        class="flex flex-col p-3 space-y-6 transition-all duration-500 bg-white border border-indigo-100 rounded-lg shadow hover:shadow-xl lg:px-4 lg:py-5 lg:flex-row lg:space-y-0 lg:space-x-4"
      >
        <div class="flex items-center justify-center w-6 h-6 bg-blue-100 border border-blue-200 rounded-full shadow-inner lg:h-12 lg:w-12">
          <svg
            className="w-6 h-6 text-blue-500 rounded-sm"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            ></path>
          </svg>
        </div>
        <div class="flex-1 text-sm">
          <p class=" lg:text-base ">Distance</p>
          <p class=" text-gray-400"> 89 KM</p>
        </div>
      </a>
    </div>
  );
};

export default CardUser;
