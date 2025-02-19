import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRouter = ({ allowedRoles }) => {
  const currentUser = useSelector((state) => state.auth.login.currentUser);

  const userRole = localStorage.getItem("userRole");

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userRole === "admin") {
    return <Outlet />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/driveuser" />;
  }

  return <Outlet />;
};

export default PrivateRouter;
