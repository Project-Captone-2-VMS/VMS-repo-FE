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
import { getAllShipmentItems } from "../../services/apiRequest";
import Pagination from "@/components/Pagination";

const ShipmentTable = ({ onDelete }) => {
  const [shipmentItems, setShipmentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchShipmentItems();
  }, []);

  const fetchShipmentItems = async () => {
    try {
      setLoading(true);
      const data = await getAllShipmentItems();
      console.log("Fetched shipment items:", data); // Log dữ liệu để kiểm tra
      setShipmentItems(data);
    } catch (error) {
      console.error("Error fetching shipment items:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(shipmentItems.length / itemsPerPage);
  const paginatedItems = shipmentItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm định dạng thời gian (totalTime tính theo giây)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  return (
    <div>
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
                Loading...
              </TableCell>
            </TableRow>
          ) : paginatedItems.length > 0 ? (
            paginatedItems.map((item) => {
              // Lấy thông tin qua dot-notation
              const shipmentItemId = item.shipmentItemId;
              const shipmentItemName = item.shipmentItemName;
              const price = item.price;
              const quantity = item.quantity;
              const status = item.status;
              const routeId = item.route?.routeId ?? "N/A";
              const startLocationName = item.route?.startLocationName ?? "N/A";
              const endLocationName = item.route?.endLocationName ?? "N/A";
              const totalTime = item.route?.totalTime;
              const driverFirstName = item.route?.driver?.firstName ?? "";
              const driverLastName = item.route?.driver?.lastName ?? "";
              const licensePlate = item.route?.vehicle?.licensePlate ?? "N/A";

              console.log("Route details for item:", item.route); // Log dữ liệu route để kiểm tra

              return (
                <TableRow key={shipmentItemId}>
                  {/* Route Details */}
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm">
                        <strong>From:</strong> {startLocationName}
                      </div>
                      <div className="text-sm">
                        <strong>To:</strong> {endLocationName}
                      </div>
                      <div className="text-sm">
                        <strong>Route ID:</strong> {routeId}
                      </div>
                    </div>
                  </TableCell>

                  {/* Driver / Vehicle */}
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-1" />
                        <span>
                          {driverFirstName} {driverLastName}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Truck className="h-4 w-4 mr-1" />
                        <span>{licensePlate}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Item Details */}
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="border-b pb-2 last:border-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            {shipmentItemName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">
                            Quantity: {quantity}
                          </span>
                          <span className="text-sm text-gray-600">
                            Price: ${price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right text-sm text-blue-600 mt-1">
                          Subtotal: ${(price * quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Route Info */}
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div>
                        <Badge variant={status ? "success" : "secondary"}>
                          {status ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {totalTime ? formatTime(totalTime) : ""}
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(shipmentItemId)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No shipment items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={shipmentItems.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ShipmentTable;