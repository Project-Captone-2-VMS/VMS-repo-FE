import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import AddVehicleModal from "../../components/Modals/AddVehicleModal";

const VehicleManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const handleAddVehicle = (newVehicle) => {
    setVehicles((prev) => [...prev, newVehicle]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="">
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-sm text-gray-600">Manage your fleet efficiently</p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="flex items-center font-semibold rounded-md bg-black px-4 py-2 text-white hover:bg-slate-800"
        >
          + ADD NEW VEHICLE
        </button>
      </div>

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddVehicle}
      />

      <Outlet />
    </div>
  );
};

export default VehicleManagement;
