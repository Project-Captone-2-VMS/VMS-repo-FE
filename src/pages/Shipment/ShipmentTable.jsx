import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, User, Trash } from "lucide-react";
import { getAllShipmentItems, getAllRoute, getAllWarehouses, deleteShipmentItem } from "../../services/apiRequest";
import Pagination from "@/components/Pagination";
import { toast } from "react-hot-toast";

const ShipmentTable = ({ onDelete }) => {
  const [shipmentItems, setShipmentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const [routes, setRoutes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Update the fetchShipmentItems function
  const fetchShipmentItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllShipmentItems();
      
      if (!data) {
        throw new Error('No data received from server');
      }

      // Validate each item has required fields based on ShipmentItemDTO
      const validItems = data.filter(item => {
        const isValid = item && 
          item.shipmentItemId && 
          item.shipmentItemName &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          typeof item.warehouseId === 'number' &&
          typeof item.routeId === 'number';
          
        if (!isValid) {
          console.warn('Invalid item data:', item);
        }
        return isValid;
      });

      setShipmentItems(validItems);
    } catch (error) {
      console.error("Error fetching shipment items:", error);
      setError(error.message);
      toast.error(`Failed to load shipment items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDelete function
  const handleDelete = async (id) => {
    try {
      await deleteShipmentItem(id);
      toast.success('Shipment item deleted successfully');
      await fetchShipmentItems(); // Refresh the list after successful deletion
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };

  // Add refreshing on mount and periodically
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [shipmentData, routeData, warehouseData] = await Promise.all([
          getAllShipmentItems(),
          getAllRoute(),
          getAllWarehouses()
        ]);
        console.log('shipmentData:', shipmentData);
        setRoutes(routeData);
        setWarehouses(warehouseData);

        const validItems = shipmentData.filter(item => {
          const isValid = item &&
            item.shipmentItemId &&
            item.shipmentItemName &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            typeof item.warehouseId === 'number' &&
            typeof item.routeId === 'number';
          return isValid;
        });
        setShipmentItems(validItems);
      } catch (error) {
        setError(error.message);
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Thêm hàm format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRouteById = (id) => routes.find(r => r.routeId === id);
  const getWarehouseById = (id) => warehouses.find(w => w.warehouseId === id);

  const totalPages = Math.ceil(shipmentItems.length / itemsPerPage);
  const paginatedItems = shipmentItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
        <Button
          onClick={fetchShipmentItems}
          className="ml-2 bg-blue-500 hover:bg-blue-600"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route Details</TableHead>
            <TableHead>Driver / Vehicle</TableHead>
            <TableHead>Item Details</TableHead>
            <TableHead>Route Info</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedItems.length > 0 ? (
            paginatedItems.map((item) => {
              const route = getRouteById(item.routeId);
              const warehouse = getWarehouseById(item.warehouseId);
              return (
                <TableRow key={item.shipmentItemId}>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm">
                        <strong>From:</strong> {route?.startLocationName || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>To:</strong> {route?.endLocationName || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <strong>Route ID:</strong> {route?.routeId || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {route?.driver
                            ? `${route.driver.firstName} ${route.driver.lastName}`
                            : 'No Driver Assigned'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Truck className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{route?.vehicle?.licensePlate || 'No Vehicle Assigned'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium">{item.shipmentItemName}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: {formatCurrency(item.price)}
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        Total: {formatCurrency(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Warehouse: {warehouse?.warehouseName || item.warehouseId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status ? "success" : "secondary"}
                      className="mb-2"
                    >
                      {item.status ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.shipmentItemId)}
                      className="hover:bg-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No shipment items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {paginatedItems.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={shipmentItems.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ShipmentTable;