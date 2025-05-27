import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Truck, Package, Users, TrendingUp, MapPin, Navigation } from 'lucide-react';
import { dashboardService } from '../services/apiRequest';
import db1  from "../assets/images/dashboard1.png";
import db2 from "../assets/images/dashboard2.png";
import db3 from "../assets/images/dashboard3.jpg";
import db4 from "../assets/images/dashboard4.png";
import db5 from "../assets/images/dashboard5.jpg";
// Logistics Image Carousel Component
const LogisticsImageCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Five logistics-themed images
  const logisticsImages = [
    {
      src: db1, 
      alt: "Global Transportation",
      title: "Integrated Logistics",
      description: "Multi-modal transportation and global supply chain solutions",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      src: db2, // Line of red and blue trucks
      alt: "Fleet Management",
      title: "Fleet Operations",
      description: "Modern fleet management and vehicle tracking systems",
      gradient: "from-green-600 to-emerald-700",
    },
    {
      src: db3, // Network map with icons
      alt: "Network Operations",
      title: "Network Management",
      description: "Intelligent routing and network optimization",
      gradient: "from-purple-600 to-pink-700",
    },
    {
      src: db4, // Supply chain map with icons
      alt: "Supply Chain",
      title: "Supply Chain Analytics",
      description: "End-to-end visibility and supply chain intelligence",
      gradient: "from-amber-600 to-orange-700",
    },
    {
      src: db5 , // Container port aerial view
      alt: "Container Operations",
      title: "Container Management",
      description: "Efficient container handling and port operations",
      gradient: "from-teal-600 to-cyan-700",
    },
  ];

  // Auto-rotate through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % logisticsImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[500px] rounded-xl relative overflow-hidden shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-r ${logisticsImages[currentImageIndex].gradient} transition-opacity duration-1000 animate-fade-in`}>
        <img
          src={logisticsImages[currentImageIndex].src}
          alt={logisticsImages[currentImageIndex].alt}
          className="w-full h-full object-cover opacity-75 transition-transform duration-1000 hover:scale-105"
          style={{ maxHeight: '500px' }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black bg-opacity-30">
          <div className="text-white text-center animate-slide-in">
            <h3 className="text-3xl font-bold mb-4">{logisticsImages[currentImageIndex].title}</h3>
            <p className="text-lg opacity-90 max-w-2xl">{logisticsImages[currentImageIndex].description}</p>
          </div>
        </div>
      </div>
      {/* Carousel indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
        {logisticsImages.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transition-all ${
              index === currentImageIndex ? "w-8 bg-white" : "w-3 bg-white/50"
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Map Carousel Component (Updated with animations and larger text)
const MapCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const mapImages = [
    {
      title: "Fleet Overview",
      description: "Current distribution of delivery vehicles",
      gradient: "from-blue-600 to-indigo-700",
      icon: <MapPin className="h-8 w-8 text-white" />,
    },
    {
      title: "Route Analytics",
      description: "Optimized delivery paths and traffic conditions",
      gradient: "from-green-600 to-emerald-700",
      icon: <Navigation className="h-8 w-8 text-white" />,
    },
    {
      title: "Delivery Heatmap",
      description: "High-demand areas and coverage analysis",
      gradient: "from-amber-600 to-orange-700",
      icon: <Truck className="h-8 w-8 text-white" />,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % mapImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-80 rounded-xl relative overflow-hidden shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-r ${mapImages[currentImageIndex].gradient} flex items-center justify-center p-6 transition-opacity duration-1000 animate-fade-in`}>
        <div className="text-white text-center animate-slide-in">
          <div className="bg-white/20 p-4 rounded-full inline-flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
            {mapImages[currentImageIndex].icon}
          </div>
          <h3 className="text-2xl font-bold mb-3">{mapImages[currentImageIndex].title}</h3>
          <p className="text-base opacity-90 max-w-md">{mapImages[currentImageIndex].description}</p>
          <div className="mt-6 relative h-16">
            <div className="absolute top-2 left-1/4 h-3 w-3 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="absolute bottom-4 right-1/3 h-2 w-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute top-6 right-1/4 h-4 w-4 bg-white rounded-full animate-ping opacity-90" style={{ animationDelay: "1.2s" }}></div>
            <div className="absolute bottom-2 left-1/3 h-3 w-3 bg-white rounded-full animate-ping opacity-75" style={{ animationDelay: "0.7s" }}></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {mapImages.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalRoutes: 0,
    completedRoutes: 0,
    activeRoutes: [],
    vehicleStatus: { active: 0, inactive: 0 },
    driverStatus: { active: 0, inactive: 0 }, 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [
          totalVehicles,
          totalDrivers,
          totalRoutes,
          completedRoutes,
          activeRoutes,
          vehicleStats,
          driverStats, 
        ] = await Promise.all([
          dashboardService.getTotalVehicles(),
          dashboardService.getTotalDrivers(),
          dashboardService.getTotalRoutes(),
          dashboardService.getCompletedRoutes(),
          dashboardService.getActiveRoutes(),
          dashboardService.getVehicleStats(),
          dashboardService.getDriverStats(), // Thêm dòng này
        ]);

        setDashboardData({
          totalVehicles,
          totalDrivers,
          totalRoutes,
          completedRoutes,
          activeRoutes,
          vehicleStatus: vehicleStats,
          driverStatus: driverStats, // Thêm dòng này
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const convertM = (distance) => `${(distance / 1000).toFixed(1)} km`;
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  const vehicleStatusData = [
    { name: 'Active', value: dashboardData.vehicleStatus.active, color: '#10B981' },
    { name: 'Inactive', value: dashboardData.vehicleStatus.inactive, color: '#EF4444' },
  ];

  const driverStatusData = [
    { name: 'Active', value: dashboardData.driverStatus.active, color: '#10B981' },
    { name: 'Inactive', value: dashboardData.driverStatus.inactive, color: '#EF4444' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-gray-900">Logistics Realtime Dashboard</h1>
        <p className="text-base text-gray-600 mt-2">Overview of vehicle fleet and driver operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Truck, label: 'Total Vehicles', value: dashboardData.totalVehicles, color: 'blue', bg: 'blue-100', border: 'blue-600' },
          { icon: Users, label: 'Total Drivers', value: dashboardData.totalDrivers, color: 'green', bg: 'green-100', border: 'green-600' },
          { icon: Package, label: 'Total Trips', value: dashboardData.totalRoutes, color: 'purple', bg: 'purple-100', border: 'purple-600' },
          { icon: TrendingUp, label: 'Completed Trips', value: dashboardData.completedRoutes, color: 'amber', bg: 'amber-100', border: 'amber-600' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl shadow-lg p-5 border-l-4 border-${stat.border} transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center">
              <div className={`bg-${stat.bg} rounded-lg p-3`}>
                <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Charts */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Truck className="h-6 w-6 mr-2 text-blue-600" />
              Vehicle Status
            </h2>
            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Realtime
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-vehicle-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverStatusData} // Sửa lại thành driverStatusData
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {driverStatusData.map((entry, index) => (
                      <Cell key={`cell-driver-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-gray-700 text-base">Vehicles</h3>
              {vehicleStatusData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-base text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-gray-700 text-base">Drivers</h3>
              {vehicleStatusData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-base text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Carousel */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
              Vehicle Distribution Map
            </h2>
            <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              Realtime
            </div>
          </div>
          <MapCarousel />
        </div>
      </div>

      {/* New Logistics Image Carousel Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl animate-slide-in mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-7 w-7 mr-3 text-purple-600" />
            Logistics Highlights
          </h2>
          <div className="bg-purple-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-full">
            Visual Insights
          </div>
        </div>
        <LogisticsImageCarousel />
      </div>
    </div>
  );
};

export default Dashboard;