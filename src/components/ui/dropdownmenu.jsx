import React from "react";

export const DropdownMenu = ({ children }) => {
  return <div className="relative">{children}</div>;
};

export const DropdownMenuTrigger = ({ children, asChild }) => {
  return <div className="cursor-pointer">{children}</div>;
};

export const DropdownMenuContent = ({ children, className }) => {
  return (
    <div className={`absolute mt-2 bg-white shadow-lg rounded-md ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
};
