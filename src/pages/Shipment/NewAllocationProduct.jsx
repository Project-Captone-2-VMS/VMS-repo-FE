import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, Plus, MapPin, Clock, User, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllWarehouses, getAllProducts, listRouteNoActive, createShipment, saveItem } from "../../services/apiRequest";
import toast from "react-hot-toast";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

const AllocationProduct = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(''); 
  const [selectedRoute, setSelectedRoute] = useState(''); 
  const [allocations, setAllocations] = useState([]); 
  const [warehouses, setWarehouses] = useState([]); 
  const [products, setProducts] = useState([]); 
  const [routes, setRoutes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouses(); 
    fetchRoutes(); 
  }, []);

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  }

  useEffect(() => {
    if (selectedWarehouse) {
      fetchProducts(selectedWarehouse); 
    } else {
      setProducts([]); 
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true); 
      const data = await getAllWarehouses(); 
      setWarehouses(data); 
    } catch (error) {
      toast.error("Failed to fetch warehouses"); 
      console.error("Error fetching warehouses:", error); 
    } finally {
      setLoading(false); 
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true); 
      const listRoute = await listRouteNoActive();
      setRoutes(listRoute);
    } catch (error) {
      toast.error("Failed to fetch routes"); 
      console.error("Error fetching routes:", error); 
    } finally {
      setLoading(false); 
    }
  };


  const fetchProducts = async (warehouseId) => {
    try {
      setLoading(true); 
      const data = await getAllProducts(warehouseId); 
      setProducts(data); 
    } catch (error) {
      toast.error("Failed to fetch products"); 
      console.error("Error fetching products:", error); 
    } finally {
      setLoading(false); 
    }
  };

  const handleAddAllocation = () => {
    setAllocations([
      ...allocations,
      { productId: '', productName: '', quantity: 0, price: 0 }
    ]);
  };

  const handleAllocationChange = (index, field, value) => {
    const newAllocations = [...allocations];
    const allocation = newAllocations[index];
    
    if (field === 'quantity') {
      const product = products.find(
        (prod) => prod.productId.toString() === allocation.productId
      );
      
      if (product && parseInt(value) > product.quantity) {
        toast.error(`Quantity exceeds available stock (${product.quantity})`);
        return;
      }
      value = parseInt(value) || 0;
    }
    
    if (field === 'price') {
      value = parseFloat(value) || 0;
    }
    
    allocation[field] = value;
    setAllocations(newAllocations);
  };

  const handleRemoveAllocation = (index) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };
  
  const isFormValid = () => {
    const hasWarehouse = Boolean(selectedWarehouse);
    const hasRoute = Boolean(selectedRoute);
    const hasValidAllocations = allocations.length > 0 && 
      allocations.every(allocation => 
        allocation.productId && 
        allocation.productName &&
        Number(allocation.quantity) > 0 && 
        Number(allocation.price) > 0
      );
    
    console.log('Validation:', {
      hasWarehouse,
      hasRoute,
      hasValidAllocations,
      allocations
    });
    
    return hasWarehouse && hasRoute && hasValidAllocations;
  };

  const validateAllocationData = (data) => {
    const errors = {};
    
    if (!data.selectedWarehouse) {
      errors.warehouse = "Warehouse selection is required";
    }
    
    if (!data.selectedRoute) {
      errors.route = "Route selection is required";
    }
    
    if (!data.allocations || data.allocations.length === 0) {
      errors.allocations = "At least one product allocation is required";
    } else {
      data.allocations.forEach((allocation, index) => {
        if (!allocation.productId) {
          errors[`allocation${index}`] = "Product selection is required";
        }
        if (!allocation.quantity || allocation.quantity <= 0) {
          errors[`quantity${index}`] = "Valid quantity is required";
        }
        if (!allocation.price || allocation.price <= 0) {
          errors[`price${index}`] = "Valid price is required";
        }
      });
    }
  
    return errors;
  };
  
  const handleSubmitAllocation = async () => {
    try {
      setIsSubmitting(true);
      
      // Find selected route details
      const selectedRouteData = routes.find(route => route.routeId.toString() === selectedRoute);
      
      // Create shipment with locations
      const shipmentData = {
        status: false,
        warehouse: { warehouseId: parseInt(selectedWarehouse) },
        route: { routeId: parseInt(selectedRoute) },
      };
  
      console.log('Submitting shipment data:', shipmentData);
      
      const createdShipment = await createShipment(shipmentData);
  
      // Create items
      const itemPromises = allocations.map(allocation => {
        const itemRequest = {
          itemName: allocation.productName,
          price: parseFloat(allocation.price),
          quantity: parseInt(allocation.quantity),
          warehouse: { warehouseId: parseInt(selectedWarehouse) },
          shipment: { shipmentId: createdShipment.shipmentId },
        };
        return saveItem(itemRequest);
      });
  
      await Promise.all(itemPromises);
      toast.success("Shipment and items created successfully");
      navigate('/shipment');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Failed to create shipment");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const renderAvailableProducts = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Available Quantity</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.productId}>
            <TableCell>{product.productName}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>${product.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Add navigation handler
  const handleCancel = () => {
    navigate('/shipment');
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Allocate Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 space-y-8 max-w-7xl">
              <h1 className="text-3xl font-bold tracking-tight">Product Allocation</h1>

              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="overflow-visible">
                  <CardHeader>
                    <CardTitle className="text-xl">Select Warehouse and Route</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Warehouse
                        </label>
                        <Select 
                          onValueChange={setSelectedWarehouse}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem 
                                key={warehouse.warehouseId} 
                                value={warehouse.warehouseId.toString()}
                                className="p-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <span>🏡 {warehouse.warehouseName} - {warehouse.location} </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Route
                        </label>
                        <Select 
                          onValueChange={setSelectedRoute}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full min-h-[80px] h-auto whitespace-normal text-left flex items-start p-4">
                            <SelectValue placeholder="Select Route">
                              {selectedRoute && routes.find(r => r.routeId.toString() === selectedRoute) && (
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      Route {selectedRoute}
                                    </span>
                                  </div>
                                  <div className="text-wrap text-gray-600 truncate">
                                   🚗: {routes.find(r => r.routeId.toString() === selectedRoute)?.startLocationName}
                                  </div>
                                  <div className="text-wrap text-gray-600 truncate">
                                  🎯: {routes.find(r => r.routeId.toString() === selectedRoute)?.endLocationName}
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto w-[400px]">
                            {routes.map((route) => (
                              <SelectItem 
                                key={route.routeId} 
                                value={route.routeId.toString()}
                                className="p-4 hover:bg-gray-50 border-b last:border-b-0"
                              >
                                <div className="flex flex-col space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Route {route.routeId}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      route.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {route.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {route.driver?.firstName} {route.driver?.lastName}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Truck className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">{route.vehicle?.licensePlate}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-3 border-t pt-3">
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                                      <span className="text-sm">
                                        From: {route.startLocationName || 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                                      <span className="text-sm">
                                        To: {route.endLocationName || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600 pt-2 border-t">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{formatTime(route.totalTime)}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Available Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto">
                      {renderAvailableProducts()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Allocate Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allocations.map((allocation, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 items-center">
                        <Select
                          onValueChange={(value) => {
                            const product = products.find(p => p.productId.toString() === value);
                            handleAllocationChange(index, 'productId', value);
                            handleAllocationChange(index, 'productName', product?.productName || '');
                            handleAllocationChange(index, 'price', product?.price || 0);
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem
                                key={product.productId}
                                value={product.productId.toString()}
                              >
                                {product.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          className="w-full sm:w-[120px]"
                          value={allocation.quantity}
                          onChange={(e) =>
                            handleAllocationChange(index, 'quantity', e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          className="w-full sm:w-[120px]"
                          value={allocation.price}
                          onChange={(e) =>
                            handleAllocationChange(index, 'price', e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleRemoveAllocation(index)}
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    <Button onClick={handleAddAllocation} variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-[150px]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitAllocation}
                  disabled={!isFormValid() || isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-[150px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit Allocation"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllocationProduct;
