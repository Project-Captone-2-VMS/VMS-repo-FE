import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Edit, Trash2, Filter } from "lucide-react";
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
import AddVehicleModal from "../../../components/Modals/AddVehicleModal";

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
    <TableRow
      key={vehicle.vehicleId}
      className={`transition-all duration-300 hover:bg-gray-50 hover:scale-[1.01] group ${
        index % 2 === 0 ? "bg-white" : "bg-gray-100/50"
      }`}
    >
      <div className="my-auto border-r p-3 text-sm font-medium text-gray-700">
        {startIndex + index + 1}
      </div>
      <div className="my-auto border-r p-3 text-sm font-medium text-gray-700">
        {vehicle.licensePlate}
      </div>
      <div className="my-auto border-r p-3 text-sm font-medium text-gray-700">
        {vehicle.type}
      </div>
      <div
        className={`my-auto border-r py-2 px-4 text-center rounded-lg transition-colors duration-200 ${
          !vehicle.status
            ? "bg-green-100 text-green-800 group-hover:bg-green-200"
            : "bg-red-100 text-red-800 group-hover:bg-red-200"
        }`}
      >
        <p className="text-sm font-semibold">
          {vehicle.status ? "Busy (On Delivery)" : "Active (Available)"}
        </p>
      </div>
      <div className="my-auto border-r p-3 text-sm font-medium text-gray-700">
        {vehicle.capacity}
      </div>
      <div className="my-auto border-r p-3 text-sm font-medium text-gray-700">
        {formatDate(vehicle.maintenanceSchedule)}
      </div>
      <div className="mx-auto my-auto flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="border-gray-300 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
          onClick={() => onEdit(vehicle.vehicleId)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="bg-red-500 hover:bg-red-600 transition-all duration-200"
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
      className="rounded-xl shadow-md bg-white/90 backdrop-blur-md"
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
  const [showAddModal, setShowAddModal] = useState(false);

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
            : vehicle
        )
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
          prevVehicles.filter((vehicle) => vehicle.vehicleId !== vehicleId)
        );
        Swal.fire("Deleted!", "Your vehicle has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        Swal.fire(
          "Error!",
          "An error occurred while deleting the vehicle.",
          "error"
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
    statusFilter
  );

  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse">
        Loading vehicles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Search and Filter Section */}
      <div className="mb-6 flex items-center gap-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200" />
          <Input
            placeholder="Search vehicles..."
            className="pl-10 py-6 bg-white border-0 ring-1 ring-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-10 px-4 bg-white ring-1 ring-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 rounded-lg"
          onClick={() =>
            setStatusFilter(statusFilter === "active" ? "busy" : "active")
          }
        >
          <Filter className="h-4 w-4" />
          {statusFilter === "active" ? "Show Busy" : "Show Active"}
        </Button>
      </div>

      {/* Card Section */}
      <Card className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Vehicles History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredVehicles.length === 0 ? (
            <div className="text-center text-gray-500 py-6 animate-fade-in">
              No vehicles found
            </div>
          ) : (
            <>
              <VehiclesTable
                vehicles={filteredVehicles}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onEdit={handleEdit}
                onDelete={handleDeleteVehicle}
              />
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  className="transition-all duration-300"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
      )}
    </div>
  );
};

export default VehiclesTab; 