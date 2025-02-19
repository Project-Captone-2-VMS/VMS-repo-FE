import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  addIncident,
  getAllDrivers,
  getAllVehicles,
} from "../../services/apiRequest";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import Swal from "sweetalert2";

const valioccurredAtIncidentData = (data) => {
  const errors = {};

  if (!data.type?.trim()) {
    errors.type = "Incident type is required";
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  }

  if (!data.occurredAt) {
    errors.occurredAt = "occurredAt is required";
  }

  if (!data.driverId) {
    errors.driverId = "Driver is required";
  }

  if (!data.vehicleId) {
    errors.vehicleId = "Vehicle is required";
  }

  return errors;
};

const AddIncidentModal = ({ isOpen, onClose, onIncidentAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    occurredAt: "",
    driverId: "",
    vehicleId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [driversData, vehiclesData] = await Promise.all([
          getAllDrivers(),
          getAllVehicles(),
        ]);
        setDrivers(Array.isArray(driversData) ? driversData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlertMessage("Failed to load drivers and vehicles");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));

    const errors = valioccurredAtIncidentData({
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

  const handleClose = () => {
    setFormData({
      type: "",
      description: "",
      occurredAt: "",
      driverId: "",
      vehicleId: "",
    });
    setFieldErrors({});
    setTouchedFields({});
    setAlertMessage("");
    onClose();
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setAlertMessage("");
    setIsSubmitting(true);

    const errors = valioccurredAtIncidentData(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      const incidentToSave = {
        type: formData.type,
        description: formData.description,
        occurredAt: new Date(formData.occurredAt).toISOString(),
        driver: {
          driverId: formData.driverId,
        },
        vehicle: {
          vehicleId: formData.vehicleId,
        },
      };

      await addIncident(incidentToSave);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Incident created successfully!",
      });
      handleClose();
      if (onIncidentAdded) {
        onIncidentAdded();
      }
    } catch (error) {
      console.error("Failed to create incident:", error);
      setAlertMessage(
        error.response?.data?.message || "Failed to create incident"
      );
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to create incident",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle>Add New Incident</DialogTitle>
        </DialogHeader>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Incident Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger
                id="type"
                className={
                  fieldErrors.type && touchedFields.type ? "border-red-500" : ""
                }
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACCIDENT">Accident</SelectItem>
                <SelectItem value="DELAY">Delay</SelectItem>
                <SelectItem value="MECHANICAL">Mechanical</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.type && touchedFields.type && (
              <p className="text-sm text-red-600">{fieldErrors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              onBlur={() => handleBlur("description")}
              className={`mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 ${
                fieldErrors.description && touchedFields.description
                  ? "border-red-500"
                  : ""
              }`}
            />
            {fieldErrors.description && touchedFields.description && (
              <p className="text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occurredAt">Date</Label>
            <Input
              id="occurredAt"
              type="date"
              value={formData.occurredAt}
              onChange={(e) => handleInputChange("occurredAt", e.target.value)}
              onBlur={() => handleBlur("occurredAt")}
              className={`mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 ${
                fieldErrors.occurredAt && touchedFields.occurredAt ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.occurredAt && touchedFields.occurredAt && (
              <p className="text-sm text-red-600">{fieldErrors.occurredAt}</p>
            )}
          </div>

          <div className="mb-4 px-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Driver:
              <select
                value={formData.driverId}
                onChange={(e) => handleInputChange("driverId", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              >
                <option value="" disabled>
                  Select a driver
                </option>
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <option key={driver.driverId} value={driver.driverId}>
                      {`${driver.firstName} ${driver.lastName}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading drivers...</option>
                )}
              </select>
            </label>
            {fieldErrors.driverId && touchedFields.driverId && (
              <p className="text-sm text-red-600">{fieldErrors.driverId}</p>
            )}
          </div>

          <div className="mb-4 px-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Vehicle:
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              >
                <option value="" disabled>
                  Select a vehicle
                </option>
                {isLoading ? (
                  <option disabled>Loading vehicles...</option>
                ) : (
                  vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.vehicleId}>
                        {vehicle.licensePlate}
                      </option>
                    ))
                  ) : (
                    <option disabled>No vehicles available</option>
                  )
                )}
              </select>
            </label>
            {fieldErrors.vehicleId && touchedFields.vehicleId && (
              <p className="text-sm text-red-600">{fieldErrors.vehicleId}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncidentModal;
