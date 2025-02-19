import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import toast from "react-hot-toast";
import { createExpense, getAllDrivers, getAllVehicle } from "../../services/apiRequest";

const validateExpenseData = (data) => {
  const errors = {};

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  }

  const amount = Number(data.amount);
  if (!data.amount) {
    errors.amount = "Amount is required";
  } else if (isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (!data.date) {
    errors.date = "Date is required";
  }

  if (!data.vehicle) {
    errors.vehicle = "Vehicle ID is required";
  }

  if (!data.driver) {
    errors.driver = "Driver ID is required";
  }

  return errors;
};

const AddExpense = ({ isOpen, onClose, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "",
    vehicle: "",
    driver: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataDriver, setDataDriver] = useState([]);
  const [dataVehicle, setDataVehicle] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverResult = await getAllDrivers();
        setDataDriver(driverResult);

        const vehicleResult = await getAllVehicle();
        setDataVehicle(vehicleResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));

    const errors = validateExpenseData({
      ...formData,
      [field]: value,
    });
    setFieldErrors(errors);
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage("");
    setIsSubmitting(true);

    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouchedFields(allTouched);

    const errors = validateExpenseData(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all errors before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        vehicle: { vehicleId: parseInt(selectedVehicle) },
        driver: { driverId: parseInt(selectedDriver) },
      };
      await createExpense(expenseData);
      toast.success("Expense added successfully!");
      onExpenseAdded(expenseData);
      handleClose();
    } catch (error) {
      setAlertMessage(
        error.message || "An error occurred while saving the expense"
      );
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      description: "",
      amount: "",
      date: "",
      category: "",
      vehicle: "",
      driver: "",
    });
    setFieldErrors({});
    setTouchedFields({});
    setAlertMessage("");
    setSelectedVehicle("");
    setSelectedDriver("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-full w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              className={
                fieldErrors.description && touchedFields.description
                  ? "border-red-500"
                  : ""
              }
            />
            {fieldErrors.description && touchedFields.description && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.description}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Price *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              onBlur={() => handleBlur("amount")}
              className={
                fieldErrors.amount && touchedFields.amount
                  ? "border-red-500"
                  : ""
              }
            />
            {fieldErrors.amount && touchedFields.amount && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.amount}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              onBlur={() => handleBlur("date")}
              className={
                fieldErrors.date && touchedFields.date ? "border-red-500" : ""
              }
            />
            {fieldErrors.date && touchedFields.date && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.date}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2 mb-4 px-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Vehicle:
              <select
                value={selectedVehicle}
                onChange={(e) => {
                  setSelectedVehicle(e.target.value);
                  handleInputChange("vehicle", e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              >
                <option value="" disabled>
                  Select a vehicle
                </option>
                {dataVehicle && dataVehicle.length > 0 ? (
                  dataVehicle.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.licensePlate}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading vehicles...</option>
                )}
              </select>
            </label>
            {fieldErrors.vehicle && touchedFields.vehicle && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.vehicle}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2 mb-4 px-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Driver:
              <select
                value={selectedDriver}
                onChange={(e) => {
                  setSelectedDriver(e.target.value);
                  handleInputChange("driver", e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              >
                <option value="" disabled>
                  Select a driver
                </option>
                {dataDriver && dataDriver.length > 0 ? (
                  dataDriver.map((driver) => (
                    <option key={driver.driverId} value={driver.driverId}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading drivers...</option>
                )}
              </select>
            </label>
            {fieldErrors.driver && touchedFields.driver && (
              <Alert variant="destructive">
                <AlertDescription>{fieldErrors.driver}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpense;
