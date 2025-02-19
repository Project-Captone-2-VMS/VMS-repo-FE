import React from "react";

export const Table = ({ headers, children }) => (
  <div className="w-full overflow-hidden rounded-lg bg-white shadow">
    <div className="min-w-full divide-y divide-gray-200">
      <div className="bg-black">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 px-6">
          {headers.map((header, index) => (
            <div
              key={index}
              className="border-r text-center border-gray-700 py-3 text-xs font-medium uppercase tracking-wider text-white"
            >
              {header}
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white">{children}</div>
    </div>
  </div>
);

export const TableRow = ({ children }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 px-6 hover:bg-gray-50">
    {children}
  </div>
);
