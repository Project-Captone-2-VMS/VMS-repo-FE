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
import { Trash } from "lucide-react";
import { getAllShipmentItems, deleteShipmentItem } from "../../services/apiRequest";
import Pagination from "@/components/Pagination";

const ShipmentTable = ({ onDelete, onUpdateStatus }) => {
  const [shipmentItems, setShipmentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch shipment items
  useEffect(() => {
    fetchShipmentItems();
  }, []);

  const fetchShipmentItems = async () => {
    setLoading(true);
    try {
      const data = await getAllShipmentItems();
      setShipmentItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setShipmentItems([]);
      console.error("Error fetching shipment items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group non-completed items by routeId
  const groupItemsByRoute = () => {
    const grouped = {};
    const completedItems = [];

    shipmentItems.forEach((item) => {
      if (item.status) {
        // Completed items are not grouped
        completedItems.push(item);
      } else {
        // Non-completed items are grouped by routeId
        const routeId = item.route?.routeId || "no-route";
        if (!grouped[routeId]) {
          grouped[routeId] = [];
        }
        grouped[routeId].push(item);
      }
    });

    // Convert grouped object to array of groups for rendering
    const groupedArray = Object.entries(grouped).map(([routeId, items]) => ({
      routeId,
      items,
      routeInfo: items[0]?.route || {}, // Assuming all items in the group share the same route info
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));

    return { groupedArray, completedItems };
  };

  // Pagination logic
  const { groupedArray, completedItems } = groupItemsByRoute();
  const allItemsForPagination = [
    ...groupedArray.map((group) => ({
      type: "group",
      routeId: group.routeId,
      items: group.items,
      routeInfo: group.routeInfo,
      totalPrice: group.totalPrice,
    })),
    ...completedItems.map((item) => ({ type: "single", item })),
  ];

  const totalPages = Math.ceil(allItemsForPagination.length / itemsPerPage);
  const paginatedItems = allItemsForPagination.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteShipmentItem(id);
      fetchShipmentItems();
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Render a single item row
  const renderItemRow = (item, isGrouped = false) => (
    <TableRow key={item.shipmentItemId} className={isGrouped ? "border-t-0" : ""}>
      <TableCell>{item.shipmentItemName}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>${item.price?.toFixed(2)}</TableCell>
      <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
      <TableCell>
        <Badge className={item.status ? "Complete" : "No Complete"}>
          {item.status ? "Complete" : "No Complete"}
        </Badge>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-semibold">{item.warehouse?.warehouseName}</div>
          <div className="text-xs text-gray-500">{item.warehouse?.location}</div>
        </div>
      </TableCell>
      <TableCell>
        {item.route?.driver
          ? `${item.route.driver.firstName} ${item.route.driver.lastName}`
          : ""}
      </TableCell>
      <TableCell>{item.route?.vehicle?.licensePlate || ""}</TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => handleDelete(item.shipmentItemId)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  // Render a group of items
  const renderGroup = (group) => (
    <TableRow className="bg-gray-50">
      <TableCell colSpan={9} className="p-0">
        <div className="border-l-4 border-blue-500 bg-gray-100 p-4">
          <div className="font-semibold mb-2">
            Route: {group.routeId} ({group.routeInfo.startLocationName} →{" "}
            {group.routeInfo.endLocationName}) - Total: ${group.totalPrice.toFixed(2)}
          </div>
          <Table>
            <TableBody>
              {group.items.map((item) => renderItemRow(item, true))}
            </TableBody>
          </Table>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                No shipment items found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((entry, index) =>
              entry.type === "group" ? (
                <React.Fragment key={`group-${entry.routeId}`}>
                  {renderGroup(entry)}
                </React.Fragment>
              ) : (
                <React.Fragment key={`single-${entry.item.shipmentItemId}`}>
                  {renderItemRow(entry.item)}
                </React.Fragment>
              )
            )
          )}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={allItemsForPagination.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShipmentTable;