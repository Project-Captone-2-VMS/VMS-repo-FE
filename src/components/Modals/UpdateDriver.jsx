import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { updateDriver } from "../../services/apiRequest";
import { AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = [
  { value: "false", label: "Active (Available)" },
  { value: "true", label: "Busy (On Delivery)" },
];
const SCHEDULE_OPTIONS = ["Monday-Friday", "Weekend", "Night Shift"];

const UpdateDriver = ({ isOpen, onClose, driver, onDriverUpdated }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [updatedDriver, setUpdatedDriver] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    status: "",
    licenseNumber: "",
    workSchedule: "",
  });

  useEffect(() => {
    if (driver) {
      setUpdatedDriver(driver);
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDriver((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...fieldErrors };

    switch (name) {
      case "email":
        // Email validation regex
        const emailRegex =
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {
          errors.email = "Email is required.";
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email address.";
        } else {
          delete errors.email;
        }
        break;

      case "phoneNumber":
        // Phone number validation regex - allows starting with 0 or with country code (+xx)
        const phoneRegex =
          /^(?:\+?\d{1,4}[\s\-]?)?(\(?0?\d{1,4}\)?[\s\-]?)?[\d\s\-]{7,15}$/;
        if (!value) {
          errors.phoneNumber = "Phone number is required.";
        } else if (!phoneRegex.test(value)) {
          errors.phoneNumber =
            "Please enter a valid phone number (e.g. 0123456789 or (012) 345-6789).";
        } else {
          delete errors.phoneNumber;
        }
        break;

      case "licenseNumber":
        if (!value) {
          errors.licenseNumber = "License number is required.";
        } else if (value.length !== 12) {
          errors.licenseNumber = "License number must be exactly 12 digits.";
        } else if (!/^\d{12}$/.test(value)) {
          errors.licenseNumber =
            "License number can only contain digits (0-9).";
        } else {
          delete errors.licenseNumber;
        }
        break;

      case "workSchedule":
        if (!value) {
          errors.workSchedule = "Work schedule is required.";
        } else if (!SCHEDULE_OPTIONS.includes(value)) {
          errors.workSchedule = "Please select a valid work schedule.";
        } else {
          delete errors.workSchedule;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleSave = async () => {
    let hasErrors = false;
    const fieldsToValidate = ["email", "phoneNumber", "licenseNumber", "workSchedule"];

    fieldsToValidate.forEach((field) => {
      validateField(field, updatedDriver[field]);
      if (fieldErrors[field]) {
        hasErrors = true;
      }
    });

    if (hasErrors || Object.keys(fieldErrors).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix all validation errors before saving.",
      });
      return;
    }

    const { driverId, ...driverWithoutId } = updatedDriver;

    try {
      const updatedData = await updateDriver(driverId, driverWithoutId);
      if (updatedData) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Driver information updated successfully.",
        });
        onDriverUpdated();
        onClose();
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response.data.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <DialogHeader className="rounded-t-lg bg-gray-50 p-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Update Driver
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={updatedDriver.firstName}
              className="w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500"
              readOnly
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={updatedDriver.lastName}
              className="w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500"
              readOnly
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={updatedDriver.email}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500 ${
                fieldErrors.email ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.email && (
              <div className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={updatedDriver.phoneNumber}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500 ${
                fieldErrors.phoneNumber ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.phoneNumber && (
              <div className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {fieldErrors.phoneNumber}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <div
              className={`mt-1 rounded-md px-3 py-2 ${
                updatedDriver.status
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {updatedDriver.status
                ? "Busy (On Delivery)"
                : "Active (Available)"}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={updatedDriver.licenseNumber}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500 ${
                fieldErrors.licenseNumber ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.licenseNumber && (
              <div className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {fieldErrors.licenseNumber}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Work Schedule
            </label>
            <select
              name="workSchedule"
              value={updatedDriver.workSchedule}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-gray-100 p-2 focus:ring focus:ring-blue-500 ${
                fieldErrors.workSchedule ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Schedule</option>
              {SCHEDULE_OPTIONS.map((schedule) => (
                <option key={schedule} value={schedule}>
                  {schedule}
                </option>
              ))}
            </select>
            {fieldErrors.workSchedule && (
              <div className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {fieldErrors.workSchedule}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2 rounded-b-lg bg-gray-50 p-4">
          <button
            className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDriver;
