import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Table, TableRow } from "../../../components/Vehicle/Table";
import { formatDate } from "../../../lib/formatDate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  getAllVehicle,
  updateVehicle,
  getVehicleById,
  deleteVehicle,
} from "../../../services/apiRequest";
import Swal from "sweetalert2";
import Pagination from "../../../components/Pagination";
import EditVehicleModal from "../../../components/Modals/EditVehicleModal";
import useVehicleSearchFilter from "../../../components/Vehicle/useVehicleSearchFilter";
import AddVehicleModal from "../../../components/Modals/AddVehicleModal"; // Import AddVehicleModal

const VehiclesTable = ({
  vehicles,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVehicles = vehicles.slice(startIndex, endIndex);

  const renderTableRow = (vehicle, index) => (
    <TableRow key={vehicle.vehicleId}>
      <div className="my-auto border-r p-3 text-sm">
        {startIndex + index + 1}
      </div>
      <div className="my-auto border-r p-3 text-sm">{vehicle.licensePlate}</div>
      <div className="my-auto border-r p-3 text-sm">{vehicle.type}</div>
      <div
        className={`my-auto mr-2 rounded-lg border-r py-2 text-center ${
          !vehicle.status
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        <p className="text-sm">
          {vehicle.status ? "Busy (On Delivery)" : "Active (Available)"}
        </p>
      </div>
      <div className="my-auto border-r p-3 text-sm">{vehicle.capacity}</div>
      <div className="my-auto border-r p-3 text-sm">
        {formatDate(vehicle.maintenanceSchedule)}
      </div>

      <div className="mx-auto my-auto flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(vehicle.vehicleId)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(vehicle.vehicleId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableRow>
  );

  return (
    <Table
      headers={[
        "STT",
        "Plate Number",
        "Type",
        "Status",
        "Capacity",
        "Maintenance Schedule",
        "Actions",
      ]}
    >
      {displayedVehicles.map(renderTableRow)}
    </Table>
  );
};

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false); // Add state for add modal

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await getAllVehicle();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleEdit = async (vehicleId) => {
    const vehicleToEdit = await getVehicleById(vehicleId);
    setEditingVehicle(vehicleToEdit);
  };

  const handleSaveVehicle = async (updatedVehicle) => {
    const { vehicleId, ...vehicleWithoutId } = updatedVehicle;
    try {
      await updateVehicle(vehicleId, vehicleWithoutId);
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle.vehicleId === vehicleId
            ? { ...vehicle, ...vehicleWithoutId }
            : vehicle,
        ),
      );

      Swal.fire({
        title: "Success!",
        text: "Vehicle updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the vehicle.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteVehicle(vehicleId);
        setVehicles((prevVehicles) =>
          prevVehicles.filter((vehicle) => vehicle.vehicleId !== vehicleId),
        );

        Swal.fire("Deleted!", "Your vehicle has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        Swal.fire(
          "Error!",
          "An error occurred while deleting the vehicle.",
          "error",
        );
      }
    }
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
  };

  const filteredVehicles = useVehicleSearchFilter(
    vehicles,
    searchTerm,
    statusFilter,
  );

  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search..."
            className="border-0 bg-white pl-10 ring-1 ring-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex h-10 items-center gap-2 border-0 bg-white px-4 ring-1 ring-gray-200"
          onClick={() =>
            setStatusFilter(statusFilter === "active" ? "busy" : "active")
          }
        >
          <Filter className="h-4 w-4" />
          {statusFilter === "active" ? "Show Busy" : "Show Active"}
        </Button>
      </div>

      <Card>
        <div className="space-y-1.5 px-6 pt-5">
          <p className="text-lg font-semibold leading-none tracking-tight">
            Vehicles History
          </p>
        </div>
        <CardContent>
          {/* Show No Vehicles Found if no filtered vehicles */}
          {filteredVehicles.length === 0 && (
            <div className="text-center text-gray-500">No vehicles found</div>
          )}

          <VehiclesTable
            vehicles={filteredVehicles}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onEdit={handleEdit}
            onDelete={handleDeleteVehicle}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </CardContent>

        {editingVehicle && (
          <EditVehicleModal
            vehicle={editingVehicle}
            onClose={handleCloseModal}
            onSave={handleSaveVehicle}
          />
        )}
        {showAddModal && (
          <AddVehicleModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            existingVehicles={vehicles}
          />
        )} {/* Add AddVehicleModal */}
      </Card>
    </div>
  );
};

export default VehiclesTab;

