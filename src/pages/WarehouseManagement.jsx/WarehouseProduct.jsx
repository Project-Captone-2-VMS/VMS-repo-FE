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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

const WarehouseProduct = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
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
      });
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
      });
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add product.",
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
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the product.",
        });
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 hover:bg-gray-100 transition-colors duration-200"
        onClick={() => navigate("/warehouse")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Warehouse
      </Button>

      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Warehouse className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {warehouse.warehouseName}
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">
                  {warehouse.location}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge
                variant={
                  warehouse.status === "active" ? "success" : "secondary"
                }
                className="capitalize px-3 py-1"
              >
                {warehouse.status}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Last updated: {warehouse.lastUpdated}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Layers className="h-5 w-5" />
                <p>Total Capacity</p>
              </div>
              <p className="font-semibold text-gray-800">
                {warehouse.capacity.toLocaleString()} units
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Package className="h-5 w-5" />
                <p>Current Stock</p>
              </div>
              <p className="font-semibold text-gray-800">
                {warehouse.currentStock.toLocaleString()} units
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <PercentSquare className="h-5 w-5" />
                <p>Space Utilization</p>
              </div>
              <p className="font-semibold text-gray-800">
                {warehouse.utilizationRate}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-500" />
              <CardTitle>Products</CardTitle>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Link to={`/warehouse/${warehouseId}/invoices`}>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoices
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </CardContent>
      </Card>

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
    </div>
  );
};

export default WarehouseProduct;
