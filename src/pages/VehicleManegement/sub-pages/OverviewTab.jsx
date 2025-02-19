import React, { useState, useEffect } from 'react';
import { Car, Settings, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { totalDelays, totalVehicles,totalMechanicals,totalAccidents } from "../../../services/apiRequest"; 

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <Card>
      <CardContent className="w-full">
        <div className="flex items-center justify-between py-2">
          <div className="rounded-lg bg-blue-300 p-4">
            <Icon className="h-6 w-6 text-blue-700" />
          </div>
          <div className="flex flex-col justify-between text-end">
            <p className="text-sm text-text-Comment">{title}</p>
            <h3 className="text-base font-bold lg:text-2xl">{value}</h3>
            {trend && (
              <p
                className={`mt-2 text-sm ${
                  trend.type === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusItem = ({ icon: Icon, color, title, description }) => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
      <div className="flex items-center space-x-4">
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Button variant="outline">View Details</Button>
    </div>
  );
};

const OverviewTab = () => {
  const [totalVehicle, setTotalVehicle] = useState(0);
  const [totalAccident, setTotalAccident] = useState(0);
  const [totalDelay, setTotalDelay] = useState(0);
  const [totalMechanical, setTotalMechanical] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicleData = await totalVehicles(); // Gọi API để lấy tổng số xe
        setTotalVehicle(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    }
    fetchData();
  }, []); 

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicleData = await totalAccidents(); // Gọi API để lấy tổng số xe accident
        setTotalAccident(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    }
    fetchData();
  }, []); 

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicleData = await totalDelays(); // Gọi API để lấy tổng số xe accident
        setTotalDelay(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    }
    fetchData();
  }, []); 

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicleData = await totalMechanicals(); // Gọi API để lấy tổng số xe accident
        setTotalMechanical(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    }
    fetchData();
  }, []); 

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-7 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Vehicles" value={totalVehicle} icon={Car} />
        <StatCard title="Total Accidents" value={totalAccident} icon={Settings} />
        <StatCard title="Total Delay" value={totalDelay} icon={Car} />
        <StatCard title="Total Mechanical" value={totalMechanical} icon={Car} />
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
};

export default OverviewTab;
