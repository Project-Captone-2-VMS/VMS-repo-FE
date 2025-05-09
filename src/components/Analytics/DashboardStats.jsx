import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    inactiveVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    inactiveDrivers: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    inactiveRoutes: 0,
    earliestRouteDate: '',
    latestRouteDate: ''
  });

  useEffect(() => {
    axios.get('http://localhost:8080/api/dashboard/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching dashboard stats:', error);
      });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle, Driver & Route Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Total Vehicles" value={stats.totalVehicles} />
        <DashboardCard title="Active Vehicles" value={stats.activeVehicles} />
        <DashboardCard title="Inactive Vehicles" value={stats.inactiveVehicles} />
        <DashboardCard title="Total Drivers" value={stats.totalDrivers} />
        <DashboardCard title="Active Drivers" value={stats.activeDrivers} />
        <DashboardCard title="Inactive Drivers" value={stats.inactiveDrivers} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <DashboardCard title="Total Routes" value={stats.totalRoutes} />
        <DashboardCard title="Active Routes" value={stats.activeRoutes} />
        <DashboardCard title="Inactive Routes" value={stats.inactiveRoutes} />
        <DashboardCard title="Earliest Route Date" value={formatDate(stats.earliestRouteDate)} />
        <DashboardCard title="Latest Route Date" value={formatDate(stats.latestRouteDate)} />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4 text-center">
    <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    <p className="text-2xl font-bold text-blue-600">{value}</p>
  </div>
);

export default DashboardStats;
