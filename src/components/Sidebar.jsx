
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
    {
      path: "/vehicle",
      icon: Truck,
      label: "Vehicle",
      hasDropdown: true,
    },
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
    {
      path: "vehicle/OverviewTab",
      label: "Overview",
      icon: SquareChartGantt,
    },
    {
      path: "vehicle/VehiclesTab",
      label: "Vehicles",
      icon: Car,
    },
    { path: "vehicle/IncidentTab", label: "Incident", icon: DiamondPlus },
  ];

  const filteredMenuItems =
    role === "USER"
      ? sb_menuItems.filter(
          (item) =>
            item.path === "/UserReceiver" ||
            item.path === "/showTrackingUser" ||
            item.path === "/routeDetail",
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
              item.path === "/shipment",
          )
        : sb_menuItems;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isVehicleDropdownOpen) {
      setVehicleDropdownOpen(!isVehicleDropdownOpen);
    }
  };

  const toggleVehicleDropdown = () => {
    setVehicleDropdownOpen(!isVehicleDropdownOpen);
  };

  return (
    <aside
      className={`dark:bg-box-dark mx-3 my-3 rounded-md bg-black transition-all duration-300 ease-linear ${
        isOpen ? "w-60" : "w-16"
      } sticky left-0 top-0`}
    >
      <div className="flex flex-col items-center p-1">
        <NavLink
          to="/dashboard"
          className={`flex items-center ${isOpen ? "px-4" : "justify-center"} py-4`}
        >
          <img
            src={Logo}
            alt="Logo"
            className={`transition-all duration-300 ${isOpen ? "h-9 w-12" : "h-6 w-8"}`}
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? "ml-2 w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <p className="whitespace-nowrap text-xl font-bold text-white">
              VMS
            </p>
          </div>
        </NavLink>
      </div>

      {/* Menu Toggle Button */}
      <div className="p-1">
        <button
          onClick={toggleSidebar}
          className={`flex items-center ${
            isOpen ? "px-2" : "justify-center"
          } w-full border-b border-gray-800 py-1 text-sm text-gray-300 transition-all duration-200 ease-in-out hover:bg-gray-800 hover:text-white`}
        >
          <Menu className={`h-6 w-6 ${isOpen ? "mr-2" : ""} text-gray-400`} />
          <span
            className={`overflow-hidden font-medium transition-all duration-300 ${
              isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            Menu
          </span>
        </button>
      </div>

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
                    className={`flex items-center hover:bg-gray-800 ${
                      isOpen
                        ? "px-4 py-3"
                        : "justify-center px-6 py-3 focus:bg-blue-800"
                    } text-sm transition-all duration-200 ease-out ${
                      isActive
                        ? "text-white"
                        : "text-gray-300 hover:text-white focus:bg-blue-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isOpen ? "mr-3" : ""} ${
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

                  <ul
                    className={`transform overflow-hidden pl-12 transition-all duration-500 ease-in-out ${
                      isVehicleDropdownOpen
                        ? "max-h-96 scale-100 opacity-100"
                        : "max-h-0 scale-95 opacity-0"
                    }`}
                  >
                    {dropdownItems.map((dropdownItem) => {
                      const DropdownIcon = dropdownItem.icon; // Lấy icon từ dropdownItem
                      return (
                        <li
                          key={dropdownItem.path}
                          className="flex items-center"
                        >
                          <DropdownIcon
                            className={`h-5 w-5 text-gray-500 ${isOpen ? "mr-3" : ""} ${
                              location.pathname === dropdownItem.path
                                ? "text-white"
                                : "text-gray-400"
                            }`}
                          />
                          <Link
                            to={dropdownItem.path}
                            className={`block py-2 text-sm font-medium text-gray-500 hover:text-white ${
                              location.pathname === dropdownItem.path
                                ? "bg-blue-800 text-white"
                                : "focus:text-white"
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
                } text-sm transition-all duration-200 ease-out ${
                  isActive
                    ? "bg-blue-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon
                  className={`h-5 w-5 ${isOpen ? "mr-3" : ""} ${
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
            isOpen ? "px-4" : "justify-center"
          } py-3 text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-800 hover:text-white`}
          title={!isOpen ? "Settings" : ""}
        >
          <Settings
            className={`h-5 w-5 ${isOpen ? "mr-3" : ""} text-gray-400`}
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