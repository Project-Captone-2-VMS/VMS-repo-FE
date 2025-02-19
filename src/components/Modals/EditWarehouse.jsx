import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import toast, { Toaster } from "react-hot-toast";
import { updateWarehouse } from "../../services/apiRequest";

// Hàm validate với regex cho phép tiếng Việt và dấu phẩy
const validateWarehouseData = (data) => {
    const errors = {};

    // Warehouse Name validation
    if (!data.warehouseName?.trim()) {
      errors.warehouseName = "Warehouse name is required";
    } else if (data.warehouseName.length > 50) {
      errors.warehouseName = "Warehouse name cannot exceed 50 characters";
    } else if (!/^[a-zA-ZÀ-ỹ0-9\s,]+$/.test(data.warehouseName)) {
      errors.warehouseName = "Warehouse name cannot contain special characters other than commas";
    }

    // Location validation
    if (!data.location?.trim()) {
      errors.location = "Location is required";
    } else if (data.location.length > 100) {
      errors.location = "Location cannot exceed 100 characters";
    } else if (!/^[a-zA-ZÀ-ỹ0-9\s,]+$/.test(data.location)) {
      errors.location = "Location cannot contain special characters other than commas";
    }

    // Capacity validation
    const capacity = Number(data.capacity);
    if (!data.capacity) {
      errors.capacity = "Capacity is required";
    } else if (isNaN(capacity)) {
      errors.capacity = "Capacity must be a valid number";
    } else if (capacity <= 0) {
      errors.capacity = "Capacity must be greater than 0";
    } else if (capacity > 1000000) {
      errors.capacity = "Capacity cannot exceed 1,000,000";
    }

    return errors;
};

const EditWarehouse = ({ isOpen, onClose, onSubmit, warehouse }) => {
  const [formData, setFormData] = useState({
    warehouseName: '',
    location: '',
    capacity: '',
    currentStock: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when warehouse prop changes
  useEffect(() => {
    if (warehouse) {
      setFormData({
        warehouseName: warehouse.warehouseName ?? '',
        location: warehouse.location ?? '',
        capacity: warehouse.capacity ?? '',
        currentStock: warehouse.currentStock ?? '',
      });
    }
  }, [warehouse]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const getInputStatus = (fieldName) => {
    if (!touchedFields[fieldName]) return "default";
    return fieldErrors[fieldName] ? "error" : "success";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const errors = validateWarehouseData(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all errors before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedData = {
        ...formData,
        capacity: Number(formData.capacity),
        currentStock: Number(formData.currentStock)
      };

      await updateWarehouse(warehouse.warehouseId, updatedData);
      toast.success("Warehouse updated successfully!");
      onSubmit && onSubmit(updatedData);
      onClose();
    } catch (error) {
      toast.error("Failed to update warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto z-50 border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseName">Warehouse Name</Label>
              <Input
                id="warehouseName"
                value={formData.warehouseName}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  onBlur={() => handleBlur('location')}
                  className={`pr-10 ${fieldErrors.location && touchedFields.location ? 'border-red-500' : ''}`}
                />
                {touchedFields.location && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getInputStatus("location") === "error" ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.location && touchedFields.location && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fieldErrors.location}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <div className="relative">
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    onBlur={() => handleBlur('capacity')}
                    min="0"
                    className={`pr-10 ${fieldErrors.capacity && touchedFields.capacity ? 'border-red-500' : ''}`}
                  />
                  {touchedFields.capacity && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {getInputStatus("capacity") === "error" ? (
                        <X className="h-5 w-5 text-red-500" />
                      ) : (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {fieldErrors.capacity && touchedFields.capacity && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fieldErrors.capacity}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Warehouse'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditWarehouse;
