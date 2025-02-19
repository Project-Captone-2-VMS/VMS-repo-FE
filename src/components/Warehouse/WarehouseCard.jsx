import React, { memo, useEffect } from 'react';
import { Edit, Trash2, Warehouse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

export const WarehouseCard = memo(({ warehouse, onSelect, onEdit, onDelete }) => {
  useEffect(() => {
  }, [warehouse]);

  const capacity = warehouse?.capacity || 0;
  const currentStock = warehouse?.currentStock || 0;
  const warehouseId = warehouse?.warehouseId;
  const warehouseName = warehouse?.warehouseName || 'Unnamed Warehouse';
  const utilizationRate = capacity > 0 ? ((currentStock / capacity) * 100).toFixed(1) : 0;

  const handleEdit = (e) => {
      e.stopPropagation();
      onEdit(warehouse);
  };

  const handleDelete = (e) => {
      e.stopPropagation();
      onDelete(warehouseId);
  };

  const handleSelect = () => onSelect(warehouse);

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Warehouse className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>{warehouseName}</CardTitle>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-100 rounded-full text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent onClick={handleSelect}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium">{warehouse?.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Capacity</p>
            <p className="font-medium">{capacity.toLocaleString()} units</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="font-medium">{currentStock.toLocaleString()} units</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilization</span>
            <span>{utilizationRate}%</span>
          </div>
          <Progress 
            value={Number(utilizationRate)}
          />
        </div>
      </CardContent>
    </Card>
  );
});

export default WarehouseCard;