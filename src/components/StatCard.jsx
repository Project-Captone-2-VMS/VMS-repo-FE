import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-4 bg-blue-50 rounded-full">
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;