import React, { useState } from 'react';
import { Search, ChevronDown, Edit, Settings, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableRow } from '../Table';
import Pagination from '../Pagination';
import EditDriverModal from '../Modals/EditVehicleModal';

const VehiclesTable = ({ vehicles, currentPage, itemsPerPage, onEdit }) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVehicles = vehicles.slice(startIndex, endIndex);

  return (
    <Table 
      headers={[
        'Vehicle ID',
        'Plate Number',
        'Vehicle Details',
        'Status',
        'Location',
        'Next Maintenance',
        'Actions'
      ]}
    >
      {displayedVehicles.map((vehicle, index) => (
        <TableRow key={index}>
          <div className="font-medium">{vehicle.id}</div>
          <div className="font-medium">{vehicle.plateNumber}</div>
          <div>
            <div>{vehicle.model}</div>
            <div className="text-sm text-gray-500">{vehicle.type} • {vehicle.year}</div>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {vehicle.status}
            </span>
          </div>
          <div>{vehicle.location}</div>
          <div>
            <div>{vehicle.nextMaintenance}</div>
            <div className="text-sm text-gray-500">Last: {vehicle.lastMaintenance}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(vehicle)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableRow>
      ))}
    </Table>
  );
};

const VehiclesTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editingVehicle, setEditingVehicle] = useState(null);

  const vehicles = [
    { id: 'VH001', plateNumber: 'ABC-123', model: 'Toyota Hino 300', type: 'Truck', year: '2022', status: 'Active', location: 'Warehouse A', nextMaintenance: '2024-04-15', lastMaintenance: '2024-03-15' },
    { id: 'VH002', plateNumber: 'DEF-456', model: 'Ford Transit', type: 'Van', year: '2021', status: 'Maintenance', location: 'Service Center', nextMaintenance: '2024-05-01', lastMaintenance: '2024-02-28' },
    { id: 'TR001', plateNumber: 'DEF-456', model: 'Ford Transit', type: 'Van', year: '2021', status: 'Maintenance', location: 'Service Center', nextMaintenance: '2024-05-01', lastMaintenance: '2024-02-28' },
  ];

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleSaveVehicle = () => {
    alert('Vehicle updated successfully!');
    setEditingVehicle(null);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vehicle List</CardTitle>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vehicles..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <ChevronDown className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <VehiclesTable 
          vehicles={vehicles}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
        />
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </CardContent>

      {/* Edit Vehicle Modal */}
      <EditDriverModal
        vehicle={editingVehicle}
        onClose={handleCloseModal}
        onSave={handleSaveVehicle}
      />
    </Card>
  );
};

export default VehiclesTab;
