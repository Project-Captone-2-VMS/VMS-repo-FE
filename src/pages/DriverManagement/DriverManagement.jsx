import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllDrivers, deleteDriver } from "../../services/apiRequest";
import Swal from "sweetalert2";
import DriverTable from "../../components/Driver/DriverTable";
import SearchAndFilter from "../../components/Driver/SearchAndFilter";
import Stats from "../../components/Driver/Stats";
import Pagination from "../../components/Pagination";
import getFilteredDrivers from "../../components/Driver/getFilteredDrivers";
import UpdateDriver from "../../components/Modals/UpdateDriver";
import { FILTER_OPTIONS } from "../../components/Driver/FilterOptions";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader, 
  ChevronRight, 
  ArrowUpRight,
  Calendar,
  BarChart2
} from "lucide-react";

const DriverManagement = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // State for filters
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    status: "",
    licenseNumber: "",
    workSchedule: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch drivers data
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllDrivers();
      if (Array.isArray(data)) {
        setDrivers(data);
      } else {
        console.error("Unexpected data format:", data);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Received unexpected data format from server",
          confirmButtonText: "OK",
          confirmButtonColor: '#3E64FF',
          customClass: {
            popup: 'animated-modal'
          }
        });
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch drivers",
        confirmButtonText: "OK",
        confirmButtonColor: '#3E64FF',
        customClass: {
          popup: 'animated-modal'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [refreshKey]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleDeleteDriver = async (driver) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      html: `<div class="font-semibold">Do you want to delete driver <span class="text-blue-600">${driver.firstName} ${driver.lastName}</span>?</div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: '#3E64FF',
      cancelButtonColor: '#d33',
      background: '#fff',
      backdrop: 'rgba(0,0,123,0.4)',
      customClass: {
        popup: 'animated-modal'
      }
    });

    if (confirmResult.isConfirmed) {
      try {
        await deleteDriver(driver.driverId);
        await fetchDrivers();
        await Swal.fire({
          title: "Deleted!",
          text: "The driver has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: '#3E64FF',
          customClass: {
            popup: 'animated-modal'
          }
        });
      } catch (error) {
        console.error("Error deleting driver:", error);
        await Swal.fire({
          title: "Error!",
          text: "Failed to delete the driver.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: '#3E64FF',
          customClass: {
            popup: 'animated-modal'
          }
        });
      }
    }
  };

  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    console.log("Closing update modal...");
    setIsUpdateModalOpen(false);
  };
  
  const handleDriverUpdated = async () => {
    setIsUpdateModalOpen(false);  // Close modal first
    await fetchDrivers();  // Refresh data
  
    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Driver updated successfully.",
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
  };
  
  

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  // Filtered and paginated drivers
  const filteredDrivers = getFilteredDrivers(drivers, searchTerm, filters);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full mx-auto"
      >
        {/* Header Section */}
        <div className="mb-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between"
          >
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center">
                <Users className="mr-3 h-10 w-10 text-blue-600" />
                Driver Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage and monitor all your drivers in one place</p>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-base text-gray-700 shadow-md hover:shadow-lg transition duration-300 border border-gray-200"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/expenses"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-base text-white shadow-md hover:shadow-lg transition duration-300"
                >
                  <Calendar className="h-5 w-5" />
                  Expenses
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
              {/* Thay thế nút Add Driver bằng một nút Analytics với hiệu ứng mới */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to="/analytics"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3 text-base text-white shadow-md hover:shadow-lg transition duration-300 relative overflow-hidden group"
                >
                  <BarChart2 className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Analytics</span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div 
                    className="absolute -right-2 -top-2 w-12 h-12 bg-white opacity-20 rounded-full"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.2, 0.3, 0.2] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Stats drivers={drivers} />
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={FILTER_OPTIONS}
          />
        </motion.div>

        {/* Driver Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader className="h-16 w-16 text-blue-500" />
                </motion.div>
                <p className="mt-5 text-gray-500 text-lg">Loading drivers data...</p>
              </motion.div>
            ) : (
              <>
                <DriverTable
                  drivers={paginatedDrivers}
                  onEditClick={handleEditClick}
                  onDelete={handleDeleteDriver}
                />
                <div className="border-t border-gray-200 p-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredDrivers.length}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedDriver && (
            <UpdateDriver
              isOpen={isUpdateModalOpen}
              onClose={handleCloseUpdateModal}
              driver={selectedDriver}
              onDriverUpdated={handleDriverUpdated}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add CSS for SweetAlert2 Animations */}
      <style jsx global>{`
        .animated-modal {
          animation: modalFadeIn 0.3s;
          border-radius: 16px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .swal2-backdrop-show {
          backdrop-filter: blur(5px);
        }
      `}</style>
    </div>
  );
};

export default DriverManagement;