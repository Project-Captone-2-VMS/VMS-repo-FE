import React from "react";
import { Link, Outlet } from "react-router-dom";

const OverviewRoute = () => {
  return (
    <>
      <div className="mb-4 flex rounded-lg border border-b bg-white px-4 py-3">
        <Link
          to="overviewRoute"
          className="px-4 py-2 hover:bg-slate-400 focus:bg-slate-300"
        >
          Overview Route
        </Link>
        <Link
          to="listRoute"
          className="px-4 py-2 hover:bg-slate-400 focus:bg-slate-300"
        >
          List Route
        </Link>
      </div>

      <Outlet />
    </>
  );
};

export default OverviewRoute;
