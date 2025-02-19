import React, { useState, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { updateIncident } from '../../services/apiRequest'
import { AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import Swal from "sweetalert2"

const validateIncidentData = (data) => {
  const errors = {};

  if (!data.type?.trim()) {
    errors.type = "Incident type is required";
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  }

  if (!data.date) {
    errors.date = "Date is required";
  }

  const driverId = Number(data.driverId);
  if (!data.driverId) {
    errors.driverId = "Driver ID is required";
  } else if (isNaN(driverId) || driverId <= 0) {
    errors.driverId = "Driver ID must be a positive number";
  }

  const vehicleId = Number(data.vehicleId);
  if (!data.vehicleId) {
    errors.vehicleId = "Vehicle ID is required";
  } else if (isNaN(vehicleId) || vehicleId <= 0) {
    errors.vehicleId = "Vehicle ID must be a positive number";
  }

  return errors;
};

const EditIncidentModal = ({ isOpen, onClose, incident, onIncidentUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    description: '',
    date: '',
    driverId: '',
    vehicleId: ''
  });

  useEffect(() => {
    if (incident) {
      const formattedDate = incident.date ? 
        new Date(incident.date).toISOString().split('T')[0] : '';
      
      setFormData({
        ...incident,
        date: formattedDate
      });
    }
  }, [incident]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    const errors = validateIncidentData({
      ...formData,
      [field]: value
    });
    setFieldErrors(errors);
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

  const handleClose = () => {
    setFieldErrors({});
    setTouchedFields({});
    setAlertMessage('');
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const errors = validateIncidentData(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!incident?.id) {
        throw new Error('Incident ID is missing');
      }

      const updatedData = {
        ...formData,
        driverId: Number(formData.driverId),
        vehicleId: Number(formData.vehicleId),
        date: new Date(formData.date).toISOString()
      };

      await updateIncident(incident.id, updatedData);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Incident updated successfully'
      });
      onIncidentUpdated();
      handleClose();
    } catch (error) {
      console.error('Failed to update incident:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update incident'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-full overflow-y-auto z-50 border border-gray-200">
        <DialogHeader>
          <DialogTitle>Edit Incident</DialogTitle>
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
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger id="type" className={fieldErrors.type && touchedFields.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACCIDENT">Accident</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="VIOLATION">Violation</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.type && touchedFields.type && (
              <p className="text-sm text-red-600">{fieldErrors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                className={`pr-10 ${fieldErrors.description && touchedFields.description ? 'border-red-500' : ''}`}
              />
              {touchedFields.description && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {getInputStatus("description") === "error" ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {fieldErrors.description && touchedFields.description && (
              <p className="text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                onBlur={() => handleBlur('date')}
                className={`pr-10 ${fieldErrors.date && touchedFields.date ? 'border-red-500' : ''}`}
              />
              {touchedFields.date && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {getInputStatus("date") === "error" ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {fieldErrors.date && touchedFields.date && (
              <p className="text-sm text-red-600">{fieldErrors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID</Label>
              <div className="relative">
                <Input
                  id="driverId"
                  type="number"
                  value={formData.driverId}
                  onChange={(e) => handleInputChange('driverId', e.target.value)}
                  onBlur={() => handleBlur('driverId')}
                  min="1"
                  className={`pr-10 ${fieldErrors.driverId && touchedFields.driverId ? 'border-red-500' : ''}`}
                />
                {touchedFields.driverId && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getInputStatus("driverId") === "error" ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.driverId && touchedFields.driverId && (
                <p className="text-sm text-red-600">{fieldErrors.driverId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle ID</Label>
              <div className="relative">
                <Input
                  id="vehicleId"
                  type="number"
                  value={formData.vehicleId}
                  onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                  onBlur={() => handleBlur('vehicleId')}
                  min="1"
                  className={`pr-10 ${fieldErrors.vehicleId && touchedFields.vehicleId ? 'border-red-500' : ''}`}
                />
                {touchedFields.vehicleId && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getInputStatus("vehicleId") === "error" ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.vehicleId && touchedFields.vehicleId && (
                <p className="text-sm text-red-600">{fieldErrors.vehicleId}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Incident'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditIncidentModal;