import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowLeft,
  Warehouse,
  MapPin,
  User,
  Package,
  Layers,
  PercentSquare,
  Calendar,
  FileText,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { AddProduct } from "../../components/Modals/AddProduct";
import { EditProduct } from "../../components/Modals/EditProduct";
import { ProductTable } from "../../components/Warehouse/ProductTable";
import {
  getAllProducts,
  deleteProduct,
  getWarehouseById,
} from "../../services/apiRequest";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const WarehouseProduct = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [warehouse, setWarehouse] = useState({
    warehouseName: "",
    location: "",
    capacity: 0,
    currentStock: 0,
    status: "inactive",
    utilizationRate: 0,
    lastUpdated: new Date().toISOString().split("T")[0],
  });

  const fetchWarehouseData = async (warehouseId) => {
    setIsLoading(true);
    try {
      const data = await getWarehouseById(warehouseId);
      const utilizationRate =
        data.capacity > 0
          ? ((data.currentStock / data.capacity) * 100).toFixed(1)
          : 0;

      setWarehouse({
        ...data,
        utilizationRate: Number(utilizationRate),
        status: data.currentStock < data.capacity ? "active" : "full",
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch warehouse information.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsPageLoaded(true);
      }, 300); // Đợi một chút trước khi bắt đầu animation
    }
  };

  const fetchProducts = async (warehouseId) => {
    try {
      const data = await getAllProducts(warehouseId);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch products.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    }
  };

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseData(warehouseId);
      fetchProducts(warehouseId);
    }
  }, [warehouseId]);

  const handleAddProduct = async (product) => {
    try {
      setIsAddProductOpen(false);
      await fetchWarehouseData(warehouseId);
      await fetchProducts(warehouseId);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product added successfully.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add product.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    }
  };

  const handleEditProduct = (product) => {
    if (product && product.productId) {
      setEditingProduct(product);
      setIsEditProductOpen(true);
      fetchProducts(warehouseId);
    } else {
      console.error("Invalid product data:", product);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Invalid product data for editing.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    }
  };

  const handleUpdateProduct = (updatedProduct) => {
    setIsEditProductOpen(false);
    setEditingProduct(null);
    Promise.all([
      fetchWarehouseData(warehouseId),
      fetchProducts(warehouseId)
    ]).then(() => {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product updated successfully.",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button',
        },
      });
    });
  };

  const handleDeleteProduct = async (productId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        confirmButton: 'swal-custom-confirm-button',
        cancelButton: 'swal-custom-cancel-button',
      },
    });

    if (confirmResult.isConfirmed) {
      try {
        await deleteProduct(productId);
        await fetchWarehouseData(warehouseId);
        await fetchProducts(warehouseId);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Product deleted successfully.",
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm-button',
          },
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the product.",
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm-button',
          },
        });
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUtilizationColor = (rate) => {
    if (rate < 50) return "bg-emerald-500";
    if (rate < 80) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full mx-auto"
      >
        <Button
          variant="outline"
          className={`mb-6 border-2 border-indigo-100 hover:bg-indigo-50 transition-all duration-300 rounded-full text-indigo-600 font-medium ${
            isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
          }`}
          style={{ animationDelay: "100ms" }}
          onClick={() => navigate("/warehouse")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Warehouse
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <Card 
                className={`mb-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-none rounded-xl bg-white ${
                  isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                }`}
                style={{ animationDelay: "300ms" }}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-full">
                        <Warehouse className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800 font-sans">
                          {warehouse.warehouseName}
                        </CardTitle>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm mt-1">
                          <MapPin className="h-4 w-4" />
                          <p>{warehouse.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant="outline"
                        className={`capitalize px-3 py-1.5 text-sm font-medium ${
                          warehouse.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        } rounded-full`}
                      >
                        {warehouse.status === "active" ? "Active & Ready" : "Full Capacity"}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Updated: {warehouse.lastUpdated}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card 
                      className={`border-none shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                        isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                      }`}
                      style={{ animationDelay: "500ms" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Layers className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="font-medium">Total Capacity</p>
                          </div>
                        </div>
                        <p className="font-bold text-2xl text-gray-800 mt-2">
                          {warehouse.capacity.toLocaleString()} <span className="text-sm font-normal text-gray-500">units</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`border-none shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                        isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                      }`}
                      style={{ animationDelay: "700ms" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="font-medium">Current Stock</p>
                          </div>
                        </div>
                        <p className="font-bold text-2xl text-gray-800 mt-2">
                          {warehouse.currentStock.toLocaleString()} <span className="text-sm font-normal text-gray-500">units</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`border-none shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                        isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                      }`}
                      style={{ animationDelay: "900ms" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-pink-500"></div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <div className="bg-pink-100 p-2 rounded-full">
                              <PercentSquare className="h-5 w-5 text-pink-600" />
                            </div>
                            <p className="font-medium">Space Utilization</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-bold text-2xl text-gray-800">{warehouse.utilizationRate}%</p>
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getUtilizationColor(warehouse.utilizationRate)} transition-all duration-1000`}
                              style={{ 
                                width: isPageLoaded ? `${warehouse.utilizationRate}%` : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* ...existing stats cards... */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <Card 
                className={`shadow-xl border-none rounded-xl bg-white overflow-hidden ${
                  isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                }`}
                style={{ animationDelay: "1100ms" }}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>
                <CardHeader className="border-b border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Package className="h-6 w-6 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">Products Management</CardTitle>
                    </div>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                      <div 
                        className={`relative flex-grow md:flex-grow-0 md:w-64 group ${
                          isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                        }`}
                        style={{ animationDelay: "1300ms" }}
                      >
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                        <Input
                          placeholder="Search products..."
                          className="pl-10 w-full border-2 border-gray-200 focus:border-indigo-500 rounded-full transition-all duration-200"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => setIsAddProductOpen(true)}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                          isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                        }`}
                        style={{ animationDelay: "1500ms" }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                      <Link to={`/warehouse/${warehouseId}/invoices`}>
                        <Button
                          className={`bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-200 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                            isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                          }`}
                          style={{ animationDelay: "1700ms" }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Invoices
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    className={`p-6 ${
                      isPageLoaded ? "animate-fade-in opacity-100" : "opacity-0"
                    }`}
                    style={{ animationDelay: "1900ms" }}
                  >
                    {products.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
                        <Button
                          onClick={() => setIsAddProductOpen(true)}
                          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 rounded-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Product
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-staggered-fade-in">
                        <ProductTable
                          products={filteredProducts}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                {products.length > 0 && (
                  <CardFooter 
                    className={`bg-gray-50 p-4 border-t border-gray-100 ${
                      isPageLoaded ? "animate-slide-in opacity-100" : "opacity-0"
                    }`}
                    style={{ animationDelay: "2100ms" }}
                  >
                    <div className="w-full flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Showing {filteredProducts.length} of {products.length} products
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
                          <span>Updated regularly</span>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
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
                    <p className="mt-5 text-gray-500 text-lg">Loading products...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {/* ...existing products table... */}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AddProduct
              isOpen={isAddProductOpen}
              onClose={() => setIsAddProductOpen(false)}
              onSubmit={handleAddProduct}
              onSelect={() => navigate(`/warehouse/${warehouse.warehouseId}`)}
              warehouseId={warehouseId}
            />

            {editingProduct && (
              <EditProduct
                isOpen={isEditProductOpen}
                onClose={() => {
                  setIsEditProductOpen(false);
                  setEditingProduct(null);
                }}
                onSubmit={handleUpdateProduct}
                product={editingProduct}
                warehouseId={warehouseId}
              />
            )}
          </>
        )}

        {/* Thêm các keyframe animation */}
        <style jsx="true">{`
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-slide-in {
            animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          
          .animate-staggered-fade-in {
            opacity: 0;
            animation: fadeIn 0.8s ease-out forwards;
            animation-delay: 2000ms;
          }
          
          @keyframes progressBarAnimation {
            from { width: 0%; }
            to { width: 100%; }
          }
          
          .swal-custom-popup {
            border-radius: 16px;
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            border: none;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          .swal-custom-title {
            font-weight: 700;
            font-size: 1.5rem;
            color: #1e293b;
          }
          
          .swal-custom-confirm-button {
            background-color: #4f46e5 !important;
            border-radius: 9999px !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3) !important;
          }
          
          .swal-custom-cancel-button {
            background-color: #f3f4f6 !important;
            color: #4b5563 !important;
            border-radius: 9999px !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default WarehouseProduct;