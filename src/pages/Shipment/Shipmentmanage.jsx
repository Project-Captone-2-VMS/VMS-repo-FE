import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ShipmentTable from './ShipmentTable';
import { useNavigate } from "react-router-dom";
import { getAllShipments, deleteShipment } from "../../services/apiRequest";
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

export default function ShipmentManage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await getAllShipments();
      // console.log("data",data)
      setShipments(data);
    } catch (error) {
      console.log('Failed to fetch shipments:', error);
      toast.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shipmentId) => {
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
        await deleteShipment(shipmentId);
        await fetchShipments();
        toast.success('Shipment deleted successfully');
      } catch (error) {
        console.error('Failed to delete shipment:', error);
        toast.error('Failed to delete shipment');
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
              placeholder="Search shipments..."
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
              shipments={shipments}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}