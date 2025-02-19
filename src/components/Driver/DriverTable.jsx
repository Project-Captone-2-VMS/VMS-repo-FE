// components/DriverTable.jsx
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "../../../src/components/ui/button";

const DriverTable = ({ drivers, onEditClick, onDelete }) => (
  <div className="overflow-hidden rounded-lg bg-white shadow">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-black text-white">
        <tr>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            First Name
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Last Name
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Email
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Phone Number
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Status
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            License Number
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Work Schedule
          </th>
          <th className="border-r border-gray-800 px-4 py-3 text-left text-10 font-medium uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {drivers.map((driver, index) => (
          <tr key={index}>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.firstName}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.lastName}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.email}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.phoneNumber}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              <span
                className={`rounded-full px-2 py-1 text-10 font-medium ${
                  !driver.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {driver.status ? "Busy (On Delivery)" : "Active (Available)"}
              </span>
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.licenseNumber}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              {driver.workSchedule}
            </td>
            <td className="whitespace-nowrap border-r px-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditClick(driver)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(driver)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DriverTable;
