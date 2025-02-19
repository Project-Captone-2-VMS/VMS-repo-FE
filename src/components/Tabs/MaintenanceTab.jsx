import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableRow } from '../Table';
import Pagination from '../Pagination';

const MaintenanceTable = ({ maintenanceRecords, currentPage, itemsPerPage }) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedRecords = maintenanceRecords.slice(startIndex, endIndex);

  return (
    <Table 
      headers={[
        'Vehicle ID',
        'Vehicle',
        'Date',
        'Type',
        'Description',
        'Cost',
        'Status'
      ]}
    >
      {displayedRecords.map((record, index) => (
        <TableRow key={index}>
          <div className="font-medium">{record.vehicleId}</div>
          <div>
            <div className="font-medium">{record.plateNumber}</div>
            <div className="text-sm text-gray-500">{record.vehicleModel}</div>
          </div>
          <div>{record.date}</div>
          <div>{record.type}</div>
          <div>{record.description}</div>
          <div>${record.cost}</div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              record.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {record.status}
            </span>
          </div>
        </TableRow>
      ))}
    </Table>
  );
};

const MaintenanceTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const maintenanceRecords = [
    { vehicleId: 'VHOO1', plateNumber: 'ABC-123', vehicleModel: 'Toyota Hino 300', date: '2024-03-15', type: 'Routine', description: 'Oil change and general inspection', cost: 250, status: 'Completed' },
    { vehicleId: 'VH002', plateNumber: 'DEF-456', vehicleModel: 'Ford Transit', date: '2024-04-01', type: 'Repair', description: 'Brake system overhaul', cost: 500, status: 'In Progress' },
    { vehicleId: 'TRK001', plateNumber: 'ABC-123', vehicleModel: 'Toyota Hino 300', date: '2024-03-15', type: 'Routine', description: 'Oil change and general inspection', cost: 250, status: 'Completed' },];
  const totalPages = Math.ceil(maintenanceRecords.length / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Maintenance History</CardTitle>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <MaintenanceTable 
          maintenanceRecords={maintenanceRecords}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
};

export default MaintenanceTab;