import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import {
  Truck,
  Users,
  Map,
  Warehouse,
  ChartColumnBig,
  MessageSquare,
  FileText,
  Settings,
  Menu,
  Route,
  BellDot,
  ChartSpline,
  SquareChartGantt,
  Car,
  Wrench,
  DiamondPlus,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen, role }) => {
  const location = useLocation();
  const [isVehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

  const sb_menuItems = [
    { path: "/vehicle", icon: Truck, label: "Vehicle", hasDropdown: true },
    { path: "/driver", icon: Users, label: "Driver" },
    { path: "/routeDetail", icon: Users, label: "Route" },
    { path: "/warehouse", icon: Warehouse, label: "Warehouse" },
    { path: "/analytics", icon: ChartColumnBig, label: "Analytics" },
    { path: "/indexNotification", icon: BellDot, label: "Notification" },
    { path: "/route", icon: Route, label: "Route" },
    { path: "/shipment", icon: FileText, label: "Shipment" },
    { path: "/RealtimeTrackingUser", icon: Map, label: "Realtime Tracking" },
    { path: "/showTrackingUser", icon: ChartSpline, label: "Show Tracking" },
  ];

  const dropdownItems = [
    { path: "vehicle/OverviewTab", label: "Overview", icon: SquareChartGantt },
    { path: "vehicle/VehiclesTab", label: "Vehicles", icon: Car },
    { path: "vehicle/IncidentTab", label: "Incident", icon: DiamondPlus },
  ];

  const filteredMenuItems =
    role === "USER"
      ? sb_menuItems.filter(
          (item) =>
            item.path === "/UserReceiver" ||
            item.path === "/showTrackingUser" ||
            item.path === "/routeDetail"
        )
      : role === "ADMIN"
        ? sb_menuItems.filter(
            (item) =>
              item.path === "/vehicle" ||
              item.path === "/driver" ||
              item.path === "/warehouse" ||
              item.path === "/analytics" ||
              item.path === "/indexNotification" ||
              item.path === "/route" ||
              item.path === "/shipment"
          )
        : sb_menuItems;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isVehicleDropdownOpen) setVehicleDropdownOpen(false);
  };

  const toggleVehicleDropdown = () => {
    setVehicleDropdownOpen(!isVehicleDropdownOpen);
  };

  return (
    <aside
      className={`bg-gradient-to-b from-gray-900 to-black mx-3 my-3 rounded-xl shadow-lg transition-all duration-500 ease-in-out ${
        isOpen ? "w-64" : "w-16"
      } sticky left-0 top-0`}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center p-2">
        <NavLink
          to="/dashboard"
          className={`flex items-center ${isOpen ? "px-4" : "justify-center"} py-4 transition-all duration-300`}
        >
          <img
            src={Logo}
            alt="Logo"
            className={`transition-transform duration-300 ${isOpen ? "h-10 w-14 scale-110" : "h-6 w-8"}`}
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? "ml-3 w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <p className="whitespace-nowrap text-2xl font-bold text-white tracking-wide">VMS</p>
          </div>
        </NavLink>
      </div>

      {/* Menu Toggle Button */}
      <div className="p-2">
        <button
          onClick={toggleSidebar}
          className={`group flex items-center ${
            isOpen ? "px-3" : "justify-center"
          } w-full py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 transition-all duration-300`}
        >
          <Menu
            className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${
              isOpen ? "mr-3 rotate-90" : "rotate-0"
            } group-hover:text-white`}
          />
          <span
            className={`overflow-hidden font-medium transition-all duration-300 ${
              isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            Menu
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto">
        <ul className="py-2 text-white">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.hasDropdown) {
              return (
                <li key={item.path} className="relative">
                  <Link
                    to="/vehicle"
                    onClick={toggleVehicleDropdown}
                    className={`flex items-center ${
                      isOpen ? "px-4 py-3" : "justify-center py-3"
                    } text-sm rounded-lg transition-all duration-300 group hover:bg-gray-700 hover:scale-105 ${
                      isActive ? "bg-blue-600 text-white" : "text-gray-300"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isOpen ? "mr-3" : ""
                      } transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`overflow-hidden font-medium transition-all duration-300 ${
                        isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>

                  {/* Dropdown */}
                  <ul
                    className={`pl-12 overflow-hidden transition-all duration-500 ease-in-out ${
                      isVehicleDropdownOpen
                        ? "max-h-96 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-2"
                    }`}
                  >
                    {dropdownItems.map((dropdownItem) => {
                      const DropdownIcon = dropdownItem.icon;
                      return (
                        <li key={dropdownItem.path} className="flex items-center">
                          <DropdownIcon
                            className={`h-5 w-5 text-gray-500 ${
                              isOpen ? "mr-3" : ""
                            } transition-transform duration-300 group-hover:scale-110 ${
                              location.pathname === dropdownItem.path
                                ? "text-white"
                                : "text-gray-400"
                            }`}
                          />
                          <Link
                            to={dropdownItem.path}
                            className={`block py-2 text-sm font-medium rounded-lg transition-all duration-300 group hover:bg-gray-700 hover:text-white ${
                              location.pathname === dropdownItem.path
                                ? "bg-blue-600 text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${
                  isOpen ? "px-4 py-3" : "justify-center py-3"
                } text-sm rounded-lg transition-all duration-300 group hover:bg-gray-700 hover:scale-105 ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-300"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isOpen ? "mr-3" : ""
                  } transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span
                  className={`overflow-hidden font-medium transition-all duration-300 ${
                    isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-800">
        <button
          className={`flex w-full items-center ${
            isOpen ? "px-4 py-3" : "justify-center py-3"
          } text-sm text-gray-300 rounded-lg transition-all duration-300 group hover:bg-gray-700 hover:scale-105`}
          title={!isOpen ? "Settings" : ""}
        >
          <Settings
            className={`h-5 w-5 ${
              isOpen ? "mr-3" : ""
            } transition-transform duration-300 group-hover:scale-110 text-gray-400 group-hover:text-white`}
          />
          <span
            className={`overflow-hidden font-medium transition-all duration-300 ${
              isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;