import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header/Header";

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setRole(userRole);
  }, []);

  return (
    <div className="dark:bg-box-dark-2 dark:text-body-dark h-screen bg-gray-100">
      <div className="flex h-full overflow-hidden ">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role={role} />

        <div className="my-3 mr-3 flex flex-1 flex-col">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            className="dark:bg-box-dark sticky top-0 z-50 border-2"
          />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-screen mx-auto bg-gray-100 py-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
