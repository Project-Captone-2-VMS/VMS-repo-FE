import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertCircle } from 'lucide-react';

const EditVehicleModal = ({ vehicle, onClose, onSave }) => {
  const [vehicleData, setVehicleData] = useState({
    type: "",
    capacity: "",
    licensePlate: "",
    maintenanceSchedule: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setVehicleData({
        type: vehicle.type || "",
        capacity: vehicle.capacity || "",
        licensePlate: vehicle.licensePlate || "",
        maintenanceSchedule: vehicle.maintenanceSchedule || "",
      });
    }
  }, [vehicle]);

  const validateField = (name, value) => {
    let errors = { ...fieldErrors };

    switch (name) {
      case "licensePlate":
        if (!value) {
          errors.licensePlate = "License plate is required";2
        } else if (value.length > 15) {
          errors.licensePlate = "License plate cannot exceed 15 characters";
        } else if (!/^[0-9]{2}[A-Z]{1}-\d{4,5}$/.test(value)) {
          errors.licensePlate = "License plate must be in the format XXA-1234 or XX-12345 (2 digits, 1 letter, 4-5 digits)";
        } else {
          delete errors.licensePlate;
        }
        break;

      case "type":
        if (!value) {
          errors.type = "Type is required.";
        } else if (value.length > 30) {
          errors.type = "Type cannot exceed 30 characters.";
        } else {
          delete errors.type;
        }
        break;

      case "capacity":
        if (!value || value <= 0) {
          errors.capacity = "Capacity must be a positive number.";
        } else {
          delete errors.capacity;
        }
        break;

      case "maintenanceSchedule":
        if (!value) {
          errors.maintenanceSchedule = "Maintenance schedule is required.";
        } else {
          const date = new Date(value);
          const today = new Date();
          if (date < today) {
            errors.maintenanceSchedule =
              "Maintenance schedule must be today or in the future.";
          } else {
            delete errors.maintenanceSchedule;
          }
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = Object.keys(fieldErrors).length === 0;
    if (!isValid) return;

    onSave({ ...vehicleData, status: vehicle.status, vehicleId: vehicle.vehicleId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto z-50 border border-gray-200">
        <h2 className="mb-4 text-xl font-bold">Edit Vehicle</h2>
        <form onSubmit={handleSubmit}>
          <label className="mb-2 block">
            Plate Number
            <Input
              type="text"
              name="status"
              value={vehicle.licensePlate }
              readOnly
              className="w-full mt-1 bg-gray-100 cursor-not-allowed"
            />
            {fieldErrors.licensePlate && (
              <span className="text-sm text-red-500">
                {fieldErrors.licensePlate}
              </span>
            )}
          </label>
          <label className="mb-2 block">
            Type
            <Input
              type="text"
              name="type"
              value={vehicleData.type}
              onChange={handleChange}
              className={`w-full ${
                fieldErrors.type ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {fieldErrors.type && (
              <span className="text-sm text-red-500">{fieldErrors.type}</span>
            )}
          </label>
          <Label className="block mb-2">
            Status
            <div className={`mt-1 px-3 py-2 rounded-md ${
              vehicle.status ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            }`}>
              {vehicle.status ? "Busy (On Delivery)" : "Active (Available)"}
            </div>
          </Label>
          <label className="mb-2 block">
            Capacity
            <Input
              type="number"
              name="capacity"
              value={vehicleData.capacity}
              onChange={handleChange}
              className={`w-full ${
                fieldErrors.capacity ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {fieldErrors.capacity && (
              <span className="text-sm text-red-500">
                {fieldErrors.capacity}
              </span>
            )}
          </label>
          <label className="mb-2 block">
            Maintenance Schedule
            <Input
              type="date"
              name="maintenanceSchedule"
              value={vehicleData.maintenanceSchedule}
              onChange={handleChange}
              className={`w-full ${
                fieldErrors.maintenanceSchedule
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            {fieldErrors.maintenanceSchedule && (
              <span className="text-sm text-red-500">
                {fieldErrors.maintenanceSchedule}
              </span>
            )}
          </label>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Vehicle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;

