import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ShipmentTable from './ShipmentTable';
import { useNavigate } from "react-router-dom";
import { getAllShipmentItems, deleteShipmentItem } from "../../services/apiRequest";
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

export default function ShipmentManage() {
  const navigate = useNavigate();
  const [shipmentItems, setShipmentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShipmentItems();
  }, []);

  const fetchShipmentItems = async () => {
    try {
      setLoading(true);
      const data = await getAllShipmentItems();
      setShipmentItems(data);
    } catch (error) {
      console.log('Failed to fetch shipment items:', error);
      toast.error('Failed to fetch shipment items');
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDelete function
  const handleDelete = async (routeId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        const data = await getAllShipmentItems();
        const itemsToDelete = data.filter(item => item.route?.routeId === routeId);
        
        // Delete all items associated with the route
        for (const item of itemsToDelete) {
          await deleteShipmentItem(item.shipmentItemId);
        }
        
        toast.success('Shipment items deleted successfully');
        // Refresh the shipment items data after deletion
        fetchShipmentItems();
      } catch (error) {
        console.error('Failed to delete shipment items:', error);
        toast.error('Failed to delete shipment items');
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shipment Management</h1>
          <Link to="/ship/newallocation">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New Allocation
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shipment items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ShipmentTable
              shipmentItems={shipmentItems}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}