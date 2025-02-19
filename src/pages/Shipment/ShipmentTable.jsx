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
import { Truck, MapPin, User, Package, Trash } from "lucide-react";
import {
  getAllWarehouses,
  getAllRoute,
  getAllItems,
  getAllShipments,
} from "../../services/apiRequest";
import axios from "axios";
import Pagination from "@/components/Pagination";
const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

const ShipmentTable = ({ shipments, onDelete, onUpdateStatus }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 2 items per page
  const [warehousesData, setWarehousesData] = useState({});
  const [routesData, setRoutesData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [shipmentData,setShipmentData] = useState([]);

  // Calculate pagination
  const filteredShipments = shipments; // Add filters if needed
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchRelatedData();
  }, [shipments]);



  const fetchItems = async (routeId) => {
    try {
      const items = await getAllItems(routeId);
      console.log(`Items for warehouse ${routeId}:`, items);
      const dataItems = await getAllItems();
      return items;
    } catch (error) {
      console.error(
        `Error fetching items for warehouse ${routeId}:`,
        error,
      );
      return [];
    }
  };

  const fetchRelatedData = async () => {
    try {
      setLoading(true);
      const shipmentData = await getAllShipments();
      setShipmentData(shipmentData);
    } catch (error) {
      console.error("Error fetching related data:", error);
      toast.error("Failed to fetch complete data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route Details</TableHead>
            <TableHead>Driver Info</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedShipments.map((shipment) => {
            const warehouse = warehousesData[shipment.warehouse?.warehouseId];
            const route = routesData[shipment.route?.routeId];

            return (
              <TableRow key={shipment.shipmentId}>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">
                        🏢 From: {shipment.route?.startLocationName || "Loading..."}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">
                        🎯 To: {shipment.route?.endLocationName || "Loading..."}
                      </span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                      <span>
                        🙎 {shipment.route?.driver?.firstName} {shipment.route?.driver?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        🛻 {shipment.route?.vehicle?.licensePlate}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-2">
                    {/* Items List */}
                    {shipment.items?.map((item) => (
                      <div key={item.itemId} className="border-b pb-2 last:border-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{item.itemName}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                          <span className="text-sm text-gray-600">
                            Price: ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right text-sm text-blue-600 mt-1">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Summary */}
                    {shipment.items && shipment.items.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Total Order:</span>
                          <span className="font-bold text-green-600">
                            ${shipment.items.reduce((sum, item) => 
                              sum + (item.price * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={shipment.status ? "Complete" : "No Complete"}>
                    {shipment.status ? "Complete" : "No Complete"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => onDelete(shipment.shipmentId)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredShipments.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShipmentTable;