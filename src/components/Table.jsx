import React from 'react';

export const Table = ({ headers, children }) => (
  <div className="w-full bg-white rounded-lg shadow overflow-hidden">
    <div className="min-w-full divide-y divide-gray-200">
      <div className="bg-gray-50">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 px-6 py-3">
          {headers.map((header, index) => (
            <div key={index} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white">
        {children}
      </div>
    </div>
  </div>
);

export const TableRow = ({ children }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 px-6 py-4 hover:bg-gray-50">
    {children}
  </div>
);