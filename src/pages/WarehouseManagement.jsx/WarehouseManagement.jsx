import React, { useState, useEffect } from "react";
import { Plus, Package, MapPin, BarChart2, Search, Filter, Warehouse, Archive, LayoutGrid } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <CardContent className="w-full p-0">
        <div className={`flex items-center p-4 border-l-4 ${color}`}>
          <div className={`rounded-full ${bgColor} p-3 mr-4`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex flex-col justify-between">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
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
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
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
        background: "#fff",
        showClass: {
          popup: `animate__animated animate__fadeInUp animate__faster`
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutDown animate__faster`
        }
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
          background: "#fff",
          iconColor: "#4ade80",
          showClass: {
            popup: `animate__animated animate__fadeInUp animate__faster`
          },
          hideClass: {
            popup: `animate__animated animate__fadeOutDown animate__faster`
          }
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
        background: "#fff",
        iconColor: "#ef4444",
        showClass: {
          popup: `animate__animated animate__fadeInUp animate__faster`
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutDown animate__faster`
        }
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
          background: "#fff",
          iconColor: "#4ade80",
          showClass: {
            popup: `animate__animated animate__fadeInUp animate__faster`
          },
          hideClass: {
            popup: `animate__animated animate__fadeOutDown animate__faster`
          }
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
        background: "#fff",
        iconColor: "#ef4444",
        showClass: {
          popup: `animate__animated animate__fadeInUp animate__faster`
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutDown animate__faster`
        }
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
      background: "#fff",
      iconColor: "#eab308",
      buttonsStyling: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      showClass: {
        popup: `animate__animated animate__fadeInUp animate__faster`
      },
      hideClass: {
        popup: `animate__animated animate__fadeOutDown animate__faster`
      }
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
          background: "#fff",
          iconColor: "#4ade80",
          showClass: {
            popup: `animate__animated animate__fadeInUp animate__faster`
          },
          hideClass: {
            popup: `animate__animated animate__fadeOutDown animate__faster`
          }
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
          background: "#fff",
          iconColor: "#ef4444",
          showClass: {
            popup: `animate__animated animate__fadeInUp animate__faster`
          },
          hideClass: {
            popup: `animate__animated animate__fadeOutDown animate__faster`
          }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-md rounded-b-2xl mb-8"
        >
          <div className="max-w-8xl mx-auto px-6 py-8">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div className="animate-fadeIn">
                <h1 className="flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  <Warehouse className="h-8 w-8 text-indigo-600" strokeWidth={2.5} />
                  Warehouse Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600 pl-1">
                  Manage your warehouses and inventory efficiently
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Warehouse
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Warehouses"
            value={totalWarehouse}
            icon={Warehouse}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            title="Capacity over 10000"
            value={totalOver}
            icon={BarChart2}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Capacity less than 10000"
            value={totalLess}
            icon={BarChart2}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            title="Active Locations"
            value={totalLocation}
            icon={MapPin}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-8xl mx-auto px-6 py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-80 transition-all duration-300 focus-within:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-all duration-300"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                className={`border border-gray-200 ${showFilters ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'} rounded-xl transition-all duration-300`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`mr-2 h-4 w-4 ${showFilters ? 'text-blue-600' : 'text-gray-500'}`} />
                Filters
              </Button>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <Button
                  variant="ghost"
                  className={`px-3 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className={`px-3 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                >
                  <Archive className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 animate-slideDown">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilization Rate</label>
                  <select
                    name="utilizationRate"
                    value={filters.utilizationRate}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="">All</option>
                    <option value="high">High (&gt; 80%)</option>
                    <option value="medium">Medium (50-80%)</option>
                    <option value="low">Low (&lt; 50%)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="capacityGreaterThan10000"
                    type="checkbox"
                    name="capacityGreaterThan10000"
                    checked={filters.capacityGreaterThan10000}
                    onChange={handleFilterChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="capacityGreaterThan10000" className="ml-2 text-sm font-medium text-gray-700">
                    Capacity &gt; 10,000
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="capacityLessThan10000"
                    type="checkbox"
                    name="capacityLessThan10000"
                    checked={filters.capacityLessThan10000}
                    onChange={handleFilterChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="capacityLessThan10000" className="ml-2 text-sm font-medium text-gray-700">
                    Capacity &lt; 10,000
                  </label>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center p-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={viewMode === 'grid' ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"
              }
            >
              {filteredWarehouses.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No warehouses found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <div key={warehouse.warehouseId} className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <WarehouseCard
                      key={warehouse.warehouseId}
                      warehouse={warehouse}
                      onSelect={() => navigate(`/warehouse/${warehouse.warehouseId}`)}
                      onEdit={handleEditWarehouse}
                      onDelete={() => handleDeleteWarehouse(warehouse.warehouseId)}
                      disabled={isLoading}
                      viewMode={viewMode}
                    />
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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