import React from 'react';
import { Button } from "@/components/ui/button";

const StatusItem = ({ icon: Icon, color, title, description }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-4">
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <Button variant="outline">View Details</Button>
  </div>
);

export default StatusItem;