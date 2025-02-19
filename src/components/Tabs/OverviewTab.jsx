import React from 'react';
import { Car, Settings, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from '@/components/StatCard';
import StatusItem from '@/components/StatusItem';

const OverviewTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Vehicles"
        value="15"
        icon={Car}
        trend={{ type: 'up', value: '+2 from last month' }}
      />
      <StatCard
        title="Vehicles in Maintenance"
        value="3"
        icon={Settings}
        trend={{ type: 'down', value: '-1 from last week' }}
      />
      <StatCard
        title="Scheduled Maintenance"
        value="5"
        icon={Calendar}
        trend={{ type: 'up', value: '+3 upcoming' }}
      />
      <StatCard
        title="Total Distance"
        value="125,000 km"
        icon={Car}
        trend={{ type: 'up', value: '+12% this month' }}
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusItem
            icon={Car}
            color="green"
            title="Active Vehicles"
            description="12 vehicles ready for operation"
          />
          <StatusItem
            icon={Settings}
            color="yellow"
            title="Under Maintenance"
            description="3 vehicles currently being serviced"
          />
          <StatusItem
            icon={Car}
            color="red"
            title="Out of Service"
            description="1 vehicle requires immediate attention"
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OverviewTab;