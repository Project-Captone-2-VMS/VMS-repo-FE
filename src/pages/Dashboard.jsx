import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Truck, AlertTriangle, Package, Zap, BarChart2, TrendingUp, Clock, Calendar } from 'lucide-react';

const Dashboard = () => {
  // Demo data
  const vehicleStatusData = [
    { name: 'Đang hoạt động', value: 68, color: '#10B981' },
    { name: 'Đang dừng', value: 15, color: '#F59E0B' },
    { name: 'Bảo trì', value: 10, color: '#6366F1' },
    { name: 'Trễ hạn', value: 7, color: '#EF4444' },
  ];

  const vehicleTypeData = [
    { name: 'Xe tải lớn', value: 45, color: '#3B82F6' },
    { name: 'Xe container', value: 20, color: '#8B5CF6' },
    { name: 'Xe tải nhỏ', value: 25, color: '#EC4899' },
    { name: 'Xe van', value: 10, color: '#14B8A6' },
  ];

  const performanceData = [
    { name: 'T2', onTime: 85, delayed: 15 },
    { name: 'T3', onTime: 88, delayed: 12 },
    { name: 'T4', onTime: 82, delayed: 18 },
    { name: 'T5', onTime: 91, delayed: 9 },
    { name: 'T6', onTime: 84, delayed: 16 },
    { name: 'T7', onTime: 78, delayed: 22 },
    { name: 'CN', onTime: 92, delayed: 8 },
  ];

  const fuelConsumptionData = [
    { name: 'T2', liters: 2400 },
    { name: 'T3', liters: 1980 },
    { name: 'T4', liters: 2800 },
    { name: 'T5', liters: 2200 },
    { name: 'T6', liters: 2500 },
    { name: 'T7', liters: 1800 },
    { name: 'CN', liters: 1400 },
  ];

  const recentAlerts = [
    { id: 1, message: 'Xe BKS 51H-123.45 bị kẹt xe tại Quận 1', severity: 'high', time: '10 phút trước' },
    { id: 2, message: 'Xe BKS 59H-789.01 đang trễ hạn giao hàng', severity: 'medium', time: '25 phút trước' },
    { id: 3, message: 'Xe BKS 61H-246.80 cần bảo trì', severity: 'low', time: '1 giờ trước' },
  ];

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Logistics Realtime</h1>
        <p className="text-gray-500">Tổng quan hoạt động của đội xe</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng phương tiện</p>
              <p className="text-2xl font-semibold text-gray-800">128</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tỷ lệ đúng hẹn</p>
              <p className="text-2xl font-semibold text-gray-800">85.7%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hàng đã giao</p>
              <p className="text-2xl font-semibold text-gray-800">1,248</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-amber-500 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hiệu suất</p>
              <p className="text-2xl font-semibold text-gray-800">+12.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Charts */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Trạng thái phương tiện
            </h2>
            <div className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              Realtime
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col space-y-2">
              {vehicleStatusData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              {vehicleTypeData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Hiệu suất giao hàng theo ngày
            </h2>
            <div className="flex space-x-2">
              <select className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tuần này</option>
                <option>Tuần trước</option>
                <option>Tháng này</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTime" name="Đúng giờ" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delayed" name="Trễ hẹn" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Consumption */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
              Tiêu thụ nhiên liệu
            </h2>
            <div className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
              Tuần này
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={fuelConsumptionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="liters" 
                  name="Lít nhiên liệu"
                  stroke="#6366F1" 
                  strokeWidth={2} 
                  dot={{ fill: '#6366F1', r: 6 }}
                  activeDot={{ fill: '#4F46E5', r: 8, strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Cảnh báo mới nhất
            </h2>
            <div className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
              3 mới
            </div>
          </div>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' : 
                  alert.severity === 'medium' ? 'border-amber-500 bg-amber-50' : 
                  'border-blue-500 bg-blue-50'
                } p-3 rounded-lg`}
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</span>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors duration-200">
              Xem tất cả cảnh báo
            </button>
          </div>
        </div>

        {/* Schedule / Calendar */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-rose-500" />
              Lịch trình hôm nay
            </h2>
            <div className="bg-rose-50 text-rose-700 text-xs font-medium px-3 py-1 rounded-full">
              7 Th3, 2025
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-green-100 text-green-600 rounded-lg p-2 w-12 h-12 flex flex-col items-center justify-center">
                <span className="text-xs font-bold">08:00</span>
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Xe BKS 51H-123.45 xuất phát</p>
                <p className="text-sm text-gray-600">Quận 7 → Quận 1</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2 w-12 h-12 flex flex-col items-center justify-center">
                <span className="text-xs font-bold">09:30</span>
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Xe BKS 59H-789.01 đến kho</p>
                <p className="text-sm text-gray-600">Nhận hàng tại Kho A</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-amber-100 text-amber-600 rounded-lg p-2 w-12 h-12 flex flex-col items-center justify-center">
                <span className="text-xs font-bold">13:15</span>
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Họp đội logistics</p>
                <p className="text-sm text-gray-600">Báo cáo hiệu suất tuần</p>
              </div>
            </div>
            <button className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors duration-200">
              Xem toàn bộ lịch trình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;