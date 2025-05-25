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

  // Format price without decimals
  const formatPrice = (price) => {
    return `$${Math.round(price)}`;
  };

  // Render a single item row
  const renderItemRow = (item, isGrouped = false) => (
    <TableRow key={item.shipmentItemId} className={isGrouped ? "border-t-0" : ""}>
      <TableCell className="w-1/8">{item.shipmentItemName}</TableCell>
      <TableCell className="w-1/12 text-center">{item.quantity}</TableCell>
      <TableCell className="w-1/8 text-right">{formatPrice(item.price)}</TableCell>
      <TableCell className="w-1/2">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            Route: {item.route?.routeId || "N/A"}
          </div>
          <div className="text-xs text-gray-600">
            {item.route?.startLocationName} → {item.route?.endLocationName}
          </div>
          <div className="text-xs text-gray-500">
            Driver: {item.route?.driver ? `${item.route.driver.firstName} ${item.route.driver.lastName}` : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            Vehicle: {item.route?.vehicle?.licensePlate || "N/A"}
          </div>
        </div>
      </TableCell>
      <TableCell className="w-1/8 text-center">
        <Badge className={item.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {item.status ? "Complete" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell className="w-1/12 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(item.shipmentItemId)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  // Render total row for a group
  const renderGroupTotal = (group) => (
    <TableRow key={`total-${group.routeId}`} className="bg-blue-50 font-semibold">
      <TableCell colSpan={2} className="text-right">Total:</TableCell>
      <TableCell className="text-right">{formatPrice(group.totalPrice)}</TableCell>
      <TableCell colSpan={3}></TableCell>
    </TableRow>
  );

  // Render a group of items
  const renderGroup = (group) => (
    <React.Fragment key={`group-${group.routeId}`}>
      <TableRow className="bg-gray-100">
        <TableCell colSpan={6} className="font-semibold text-blue-700 py-3">
          📍 Route Group: {group.routeId} ({group.routeInfo.startLocationName} → {group.routeInfo.endLocationName})
        </TableCell>
      </TableRow>
      {group.items.map((item) => renderItemRow(item, true))}
      {renderGroupTotal(group)}
    </React.Fragment>
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/8">Product</TableHead>
            <TableHead className="w-1/12 text-center">Quantity</TableHead>
            <TableHead className="w-1/8 text-right">Price</TableHead>
            <TableHead className="w-1/2">Route Information</TableHead>
            <TableHead className="w-1/8 text-center">Status</TableHead>
            <TableHead className="w-1/12 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No shipment items found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((entry, index) =>
              entry.type === "group" ? (
                renderGroup(entry)
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