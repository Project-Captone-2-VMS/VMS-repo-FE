import React from 'react';
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

const DeleteVehicleModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <h2 className="text-xl font-semibold">Are you sure you want to delete this vehicle?</h2>
        <p className="mt-4">
          You are about to delete <strong>{vehicle.model} ({vehicle.plateNumber})</strong>.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="destructive" onClick={() => onConfirm(vehicle.id)}>
            Yes
          </Button>
          <Button variant="outline" onClick={onClose}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteVehicleModal;
