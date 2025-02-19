import React, { useState, useEffect } from "react";
import { Plus, Package, MapPin, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { WarehouseCard } from "../../components/Warehouse/WarehouseCard";
import { AddWarehouse } from "../../components/Modals/AddWarehouse";
import EditWarehouse from "../../components/Modals/EditWarehouse";
import SearchAndFilter from "../../components/Warehouse/SearchAndFilter";
import getFilteredWarehouses from "../../components/Warehouse/getFilteredWarehouses";
import { Card, CardContent } from "../../components/ui/card";
import {
  getAllWarehouses,
  deleteWarehouse,
  createWarehouse,
  updateWarehouse,
  totalWarehouses,
  totalLocations,
  totalOvers,
  totalLesss,
} from "../../services/apiRequest";
import Swal from "sweetalert2";

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <Card>
      <CardContent className="w-full">
        <div className="flex items-center justify-between py-2">
          <div className="rounded-lg bg-blue-300 p-4">
            <Icon className="h-6 w-6 text-blue-700" />
          </div>
          <div className="flex flex-col justify-between text-end">
            <p className="text-sm text-text-Comment">{title}</p>
            <h3 className="text-xl font-bold">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WarehouseManagement = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [totalWarehouse, setTotalWarehouse] = useState(0);
  const [totalLocation, setTotalLocation] = useState(0);
  const [totalOver, setTotalOver] = useState(0);
  const [totalLess, setTotalLess] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    utilizationRate: "",
    capacityGreaterThan10000: false,
    capacityLessThan10000: false,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Get filtered warehouses based on search and filters
  const filteredWarehouses = getFilteredWarehouses(
    warehouses,
    searchTerm,
    filters,
  );

  // Fetch warehouses data
  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const data = await getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.log("Error fetching warehouses:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch warehouses. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Load initial data
  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Fetch warehouse stats
  useEffect(() => {
    async function fetchData() {
      const result = await totalWarehouses();
      setTotalWarehouse(result);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const result = await totalLocations();
      setTotalLocation(result);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const result = await totalOvers();
      setTotalOver(result);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const result = await totalLesss();
      setTotalLess(result);
    }

    fetchData();
  }, []);

  // Handle Add Warehouse
  const handleAddWarehouse = async (warehouseData) => {
    try {
      setIsLoading(true);
      const response = await createWarehouse(warehouseData);
      if (response) {
        setIsAddModalOpen(false);
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Warehouse added successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchWarehouses(); // Refresh warehouses
        await fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error adding warehouse:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to add warehouse. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit Button Click
  const handleEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setIsEditModalOpen(true);
  };

  // Handle Update Warehouse
  const handleUpdateWarehouse = async (updatedWarehouse) => {
    try {
      setIsLoading(true);
      // Make the API call to update the warehouse
      const response = await updateWarehouse(
        updatedWarehouse.warehouseId,
        updatedWarehouse,
      );
      console.log(updatedWarehouse);

      if (response) {
        // Close modal and clear editing state first
        setIsEditModalOpen(false);
        setEditingWarehouse(null);

        // Show success message
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Warehouse information updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refresh the warehouses list
        await fetchWarehouses();
      }
    } catch (error) {
      console.error("Error updating warehouse:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to update warehouse information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Warehouse
  const handleDeleteWarehouse = async (warehouseId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete warehouse ${warehouseId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });
  
    if (confirmResult.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteWarehouse(warehouseId);
  
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Warehouse deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
  
        await fetchWarehouses(); // Refresh warehouses
        await fetchStats(); // Refresh stats
      } catch (error) {
        console.error("Error deleting warehouse:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text:
            error.response?.data?.message ||
            "Failed to delete the warehouse. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    const totalWarehouseResult = await totalWarehouses();
    setTotalWarehouse(totalWarehouseResult);
  
    const totalLocationResult = await totalLocations();
    setTotalLocation(totalLocationResult);
  
    const totalOverResult = await totalOvers();
    setTotalOver(totalOverResult);
  
    const totalLessResult = await totalLesss();
    setTotalLess(totalLessResult);
  };

  useEffect(() => {
    fetchWarehouses();
    fetchStats(); // Fetch stats initially
  }, []);

  return (
    <div className="min-h-screen">
      <div className="shadow-sm">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                {/* <Package className="h-8 w-8 text-blue-600" /> */}
                Warehouse Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your warehouses and inventory efficiently
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                className="bg-black text-white shadow-lg transition-all duration-200 hover:bg-slate-800"
                onClick={() => setIsAddModalOpen(true)}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mx-auto py-6">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="mb-8 grid grid-cols-2 gap-7 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Warehouses"
            value={totalWarehouse}
            icon={Package}
          />
          <StatCard
            title="Capacity over 10000"
            value={totalOver}
            icon={BarChart2}
          />
          <StatCard
            title="Capacity less than 10000"
            value={totalLess}
            icon={BarChart2}
          />
          <StatCard
            title="Active Locations"
            value={totalLocation}
            icon={MapPin}
          />
        </div>

        {/* Warehouse Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse.warehouseId}
              warehouse={warehouse}
              onSelect={() => navigate(`/warehouse/${warehouse.warehouseId}`)}
              onEdit={handleEditWarehouse}
              onDelete={() => handleDeleteWarehouse(warehouse.warehouseId)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Add Warehouse Modal */}
      <AddWarehouse
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWarehouse}
        isLoading={isLoading}
      />

      {/* Edit Warehouse Modal */}
      {editingWarehouse && (
        <EditWarehouse
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingWarehouse(null);
          }}
          onUpdate={handleUpdateWarehouse}
          warehouse={editingWarehouse}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default WarehouseManagement;
