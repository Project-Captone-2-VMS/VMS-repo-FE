import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Package, Users, TrendingUp,Warehouse } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import orders  from "../data.js";
import Map from "../components/Map/map";
import { totalDrivers,totalWarehouses,totalVehicles,totalProducts } from "../services/apiRequest.js";


const Dashboard = () => {
  const [totalDriver, setTotalDriver] = useState(0); 
  const [totalWarehouse, setTotalWarehouse] = useState(0);  
  const [totalVehicle, setTotalVehicle] = useState(0);
  const [totalProduct, setTotalProduct] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const result = await totalDrivers(); 
      setTotalDriver(result);  // Cập nhật giá trị totalDriver
    }
    
    fetchData();  // Gọi hàm fetchData để lấy dữ liệu
  }, []);  // Chạy lần đầu tiên khi component được render

  useEffect(() => {
    async function fetchData() {
      const result = await totalWarehouses(); 
      setTotalWarehouse(result);  
    }
    
    fetchData(); 
  }, []);  
  useEffect(() => {
    async function fetchData() {
      const result = await totalVehicles(); 
      setTotalVehicle(result);  // 
    }
    
    fetchData();  
  }, []);  

  useEffect(() => {
    async function fetchData() {
      const result = await totalProducts(); 
      setTotalProduct(result);  // 
    }
    
    fetchData();  
  }, []); 


  const statsData = [
    { name: "Total Vehicles", value: totalVehicle, icon: Truck, color: "text-blue-500" },
    { name: "Total Driver", value: totalDriver, icon: Users, color: "text-green-500" },  // Đảm bảo lấy đúng giá trị từ state
    { name: "Total Warehouse", value: totalWarehouse, icon: Warehouse, color: "text-purple-500" },  // Đảm bảo lấy đúng giá trị từ state
    { name: "Total Product", value: totalProduct, icon: Package, color: "text-yellow-500" },
  ];

  const deliveryData = [
    { name: "Mon", deliveries: 10 },
    { name: "Tue", deliveries: 30 },
    { name: "Wed", deliveries: 25 },
    { name: "Thu", deliveries: 40 },
    { name: "Fri", deliveries: 35 },
    { name: "Sat", deliveries: 15 },
    { name: "Sun", deliveries: 10 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Realtime Tracking Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color} mr-4`} />
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Live Tracking Map</h2>
          <Map />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Delivery Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="deliveries" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            See All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
