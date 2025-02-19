import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { createVehicle } from "../../services/apiRequest";

const AddVehicleModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState({
    licensePlate: "",
    type: "",
    capacity: "",
    status: "false",
    maintenanceSchedule: "",
  });
  const [errors, setErrors] = useState({});

  const resetState = () => {
    setVehicleData({
      licensePlate: "",
      type: "",
      capacity: "",
      status: "false",
      maintenanceSchedule: "",
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  const validateFields = () => {
    const newErrors = {};
    const { licensePlate, type, capacity, maintenanceSchedule } = vehicleData;

    if (!licensePlate) {
      newErrors.licensePlate = "License plate is required";
    } else if (!/^[0-9]{2}[A-Z]{1}-\d{4,5}$/.test(licensePlate)) {
      newErrors.licensePlate =
        "Format: XXA-1234 or XX-12345 (2 digits, 1 letter, 4-5 digits)";
    }

    if (!type) {
      newErrors.type = "Vehicle type is required";
    }

    if (!capacity || capacity <= 0) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    if (!maintenanceSchedule) {
      newErrors.maintenanceSchedule = "Maintenance date is required";
    } else if (new Date(maintenanceSchedule) < new Date()) {
      newErrors.maintenanceSchedule = "Schedule must be today or later";
    }

    return newErrors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (!toast.isActive("form-error")) {
        toast.error("Please fix all errors before submitting", { id: "form-error" });
      }
      return;
    }

    const vehicleDataToSend = {
      ...vehicleData,
      status: vehicleData.status === "true",
    };

    try {
      await createVehicle(vehicleDataToSend);
      toast.dismiss();
      toast.success("Vehicle created successfully!");
      resetState();
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({ ...vehicleData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear specific field error
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto z-50 border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* License Plate */}
            <div>
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                value={vehicleData.licensePlate}
                onChange={handleChange}
                className={`${
                  errors.licensePlate ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="XXA-1234"
              />
              {errors.licensePlate && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.licensePlate}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div>
              <Label htmlFor="type">Vehicle Type</Label>
              <Select
                name="type"
                value={vehicleData.type}
                onValueChange={(value) => handleChange({ target: { name: "type", value } })}
              >
                <SelectTrigger className={`w-full ${errors.type ? "border-red-500" : "border-gray-300"}`}>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={vehicleData.capacity}
                onChange={handleChange}
                className={`${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter capacity"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* Maintenance Schedule */}
            <div>
              <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
              <Input
                id="maintenanceSchedule"
                name="maintenanceSchedule"
                type="date"
                value={vehicleData.maintenanceSchedule}
                onChange={handleChange}
                className={`${
                  errors.maintenanceSchedule ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.maintenanceSchedule && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.maintenanceSchedule}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                Save Vehicle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddVehicleModal;
