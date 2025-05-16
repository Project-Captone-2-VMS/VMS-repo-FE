import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Truck, Clock, Menu, X, User } from 'lucide-react';
import axios from 'axios';
const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY; // Lấy API key từ biến môi trường
//a vũ làm phần lấy tọa độ từ firebase nằm ở trường timestamp(là điểm tọa độ của tài xế) có giờ số giờ update nữa 
//  còn mấy trường lấy từ route đã lấy giống trong DB
// Simulated Firebase driver location data (hardcoded)
const firebaseDriverLocations = [
  { 
    driverId: 1, 
    lat: 10.8231, 
    lng: 106.6297, 
    timestamp: '2025-05-16T20:23:00',
  },
  { 
    driverId: 2, 
    lat: 10.8300, 
    lng: 106.6350, 
    timestamp: '2025-05-16T20:22:00',

  },
  { 
    driverId: 3, 
    lat: 10.8150, 
    lng: 106.6200, 
    timestamp: '2025-05-16T20:21:00',
  },
  { 
    driverId: 4, 
    lat: 10.8350, 
    lng: 106.6400, 
    timestamp: '2025-05-16T20:24:00',

  },
  { 
    driverId: 5, 
    lat: 10.8100, 
    lng: 106.6250, 
    timestamp: '2025-05-16T20:20:00',
  },
];

// Simulated API service functions
const getAllRoute = async () => {
  try {
    return [
      {
        routeId: 1,
        driver: { firstName: 'John', lastName: 'Smith', id: 1 },
        status: 'Active',
        vehicle: { licensePlate: '51F-123.45' },
        totalTime: 1200,
        totalDistance: 15000,
        startLocationName: 'Warehouse District 1',
        endLocationName: 'Store District 2',
      },
      {
        routeId: 2,
        driver: { firstName: 'Trần', lastName: 'Thị B', id: 2 },
        status: 'Idle',
        vehicle: { licensePlate: '59H-789.10' },
        totalTime: 1800,
        totalDistance: 20000,
        startLocationName: 'Kho Quận 3',
        endLocationName: 'Cửa hàng Quận 4',
      },
      {
        routeId: 3,
        driver: { firstName: 'Lê', lastName: 'Văn C', id: 3 },
        status: 'Active',
        vehicle: { licensePlate: '51D-456.78' },
        totalTime: 900,
        totalDistance: 10000,
        startLocationName: 'Kho Quận 5',
        endLocationName: 'Cửa hàng Quận 6',
      },
      {
        routeId: 4,
        driver: { firstName: 'Phạm', lastName: 'Thị D', id: 4 },
        status: 'Active',
        vehicle: { licensePlate: '59P-246.80' },
        totalTime: 1500,
        totalDistance: 18000,
        startLocationName: 'Kho Quận 7',
        endLocationName: 'Cửa hàng Quận 8',
      },
      {
        routeId: 5,
        driver: { firstName: 'Hoàng', lastName: 'Văn E', id: 5 },
        status: 'Break',
        vehicle: { licensePlate: '51G-357.91' },
        totalTime: 1350,
        totalDistance: 12000,
        startLocationName: 'Kho Quận 9',
        endLocationName: 'Cửa hàng Quận 10',
      },
    ];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

const ListRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const routePolylines = useRef([]);
  const markers = useRef([]);

  // Function to convert distance to km
  const convertM = (distance) => {
    return `${(distance / 1000).toFixed(1)} km`;
  };

  // Function to format duration time
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  // Format timestamp to human-readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize map
  useEffect(() => {
    // Kiểm tra nếu chưa có map và window.H đã được load
    if (!mapRef.current && window.H) {
      // Khởi tạo platform với API key
      const platform = new window.H.service.Platform({
        apikey: apiKey
      });

      // Tạo layer mặc định
      const defaultLayers = platform.createDefaultLayers();

      // Khởi tạo map
      const mapInstance = new window.H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.vector.normal.map,
        {
          center: { lat: 10.8231, lng: 106.6297 }, // Tọa độ trung tâm TP.HCM
          zoom: 12,
          pixelRatio: window.devicePixelRatio || 1
        }
      );

      // Thêm các control và behavior cho map
      const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(mapInstance));
      const ui = window.H.ui.UI.createDefault(mapInstance, defaultLayers);

      // Lưu map instance vào state
      setMap(mapInstance);

      // Xử lý resize map khi thay đổi kích thước màn hình
      window.addEventListener('resize', () => {
        mapInstance.getViewPort().resize();
      });

      // Cleanup function
      return () => {
        if (mapInstance) {
          mapInstance.dispose();
        }
      };
    }
  }, []);

  // Fetch routes
  useEffect(() => {
    const fetchData = async () => {
      const listRoute = await getAllRoute();
      setRoutes(listRoute);
      setFilteredRoutes(listRoute);
    };
    fetchData();
  }, []);

  // Filter routes based on search and status
  useEffect(() => {
    let filtered = routes;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (route) =>
          `${route.driver.firstName} ${route.driver.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          route.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter((route) => route.status === statusFilter);
    }
    
    setFilteredRoutes(filtered);
  }, [routes, searchTerm, statusFilter]);

  // Update markers for all drivers
  const updateAllDriverMarkers = () => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => mapRef.current.removeObject(marker));
      markersRef.current = [];
    }
    
    // Create all driver markers with different colors based on status
    filteredRoutes.forEach(route => {
      const driverLocation = firebaseDriverLocations.find(
        (loc) => loc.driverId === route.driver.id
      );
      
      if (driverLocation) {
        let markerColor;
        switch(route.status) {
          case 'Active':
            markerColor = '#22c55e'; // green
            break;
          case 'Idle':
            markerColor = '#3b82f6'; // blue
            break;
          case 'Break':
            markerColor = '#f59e0b'; // amber
            break;
          default:
            markerColor = '#6b7280'; // gray
        }
        
        // Create custom marker with driver icon
        const svgMarkup = `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${markerColor}" opacity="0.8" />
            <circle cx="16" cy="16" r="8" fill="white" />
            <path d="M16,12 L19,19 L13,19 Z" fill="${markerColor}" 
              transform="rotate(${driverLocation.heading}, 16, 16)" />
          </svg>
        `;
        
        const icon = new window.H.map.Icon(svgMarkup, {
          anchor: { x: 16, y: 16 }
        });
        
        const marker = new window.H.map.Marker(
          { lat: driverLocation.lat, lng: driverLocation.lng },
          { icon: icon }
        );
        
        // Add data to marker for info window
        marker.setData({
          name: `${route.driver.firstName} ${route.driver.lastName}`,
          licensePlate: route.vehicle.licensePlate,
          status: route.status,
          timestamp: driverLocation.timestamp,
          speed: driverLocation.speed,
          routeInfo: route
        });
        
        // Add event listener to marker
        marker.addEventListener('tap', (evt) => {
          const data = evt.target.getData();
          setSelectedDriver(data.routeInfo);
          
          // Create info bubble
          const bubble = new window.H.ui.InfoBubble(evt.target.getGeometry(), {
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${data.name}</div>
                <div>BKS: ${data.licensePlate}</div>
                <div>Tốc độ: ${data.speed} km/h</div>
                <div>Cập nhật: ${formatTime(data.timestamp)}</div>
                <div style="color: ${data.status === 'Active' ? 'green' : data.status === 'Break' ? 'orange' : 'blue'};">
                  Trạng thái: ${data.status}
                </div>
              </div>
            `
          });
          
          // Add info bubble to UI
          mapRef.current.getViewModel().setLookAtData({
            position: { lat: driverLocation.lat, lng: driverLocation.lng },
            zoom: 15
          }, true);
        });
        
        mapRef.current.addObject(marker);
        markersRef.current.push(marker);
      }
    });
  };

  // Update map when routes are loaded or filtered
  useEffect(() => {
    if (filteredRoutes.length > 0 && mapRef.current) {
      updateAllDriverMarkers();
    }
  }, [filteredRoutes]);

  // Update map when a driver is selected
  useEffect(() => {
    if (selectedDriver && mapRef.current) {
      // Find driver location from Firebase data
      const driverLocation = firebaseDriverLocations.find(
        (loc) => loc.driverId === selectedDriver.driver.id
      );

      if (driverLocation) {
        // Remove any existing route line
        if (polylineRef.current) {
          mapRef.current.removeObject(polylineRef.current);
          polylineRef.current = null;
        }
        
        // Create simulated route line (in real app, this would come from your route data)
        const routePoints = [
          // Start point - simulating route from start to current location
          { lat: driverLocation.lat - 0.01, lng: driverLocation.lng - 0.015 },
          { lat: driverLocation.lat - 0.005, lng: driverLocation.lng - 0.01 },
          { lat: driverLocation.lat - 0.002, lng: driverLocation.lng - 0.005 },
          // Current driver location
          { lat: driverLocation.lat, lng: driverLocation.lng },
          // Future route points
          { lat: driverLocation.lat + 0.003, lng: driverLocation.lng + 0.004 },
          { lat: driverLocation.lat + 0.008, lng: driverLocation.lng + 0.01 },
          { lat: driverLocation.lat + 0.015, lng: driverLocation.lng + 0.02 },
        ];
        
        const lineString = new window.H.geo.LineString();
        routePoints.forEach(point => {
          lineString.pushPoint(point);
        });
        
        const routeLine = new window.H.map.Polyline(lineString, {
          style: {
            lineWidth: 5,
            strokeColor: '#22c55e',
            lineTailCap: 'arrow-tail',
            lineHeadCap: 'arrow-head'
          }
        });
        
        mapRef.current.addObject(routeLine);
        polylineRef.current = routeLine;
        
        // Zoom to show the whole route
        mapRef.current.getViewModel().setLookAtData({
          bounds: routeLine.getBoundingBox(),
          padding: 100
        });
      }
    }
  }, [selectedDriver]);

  const showRouteOnMap = async (route) => {
    if (!map) return;
  
    // Clear existing routes and markers
    routePolylines.current.forEach(polyline => map.removeObject(polyline));
    routePolylines.current = [];
    markers.current.forEach(marker => map.removeObject(marker));
    markers.current = [];
  
    try {
      const response = await axios.get("https://router.hereapi.com/v8/routes", {
        params: {
          origin: route.startLocation,
          destination: route.endLocation,
          transportMode: "car",
          return: "polyline,summary",
          apikey: apiKey,
        }
      });
  
      if (response.data.routes && response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        const section = routeData.sections[0];
        const polylineData = section.polyline;
        const routeLine = H.geo.LineString.fromFlexiblePolyline(polylineData);
        
        const routePolyline = new window.H.map.Polyline(routeLine, {
          style: { strokeColor: 'blue', lineWidth: 5 }
        });
  
        map.addObject(routePolyline);
        routePolylines.current.push(routePolyline);
  
        // Add markers for start and end points
        const startMarker = new window.H.map.Marker({
          lat: route.startLocation.split(',')[0],
          lng: route.startLocation.split(',')[1]
        });
        const endMarker = new window.H.map.Marker({
          lat: route.endLocation.split(',')[0],
          lng: route.endLocation.split(',')[1]
        });
  
        map.addObjects([startMarker, endMarker]);
        markers.current.push(startMarker, endMarker);
  
        // Fit map to show the route
        map.getViewModel().setLookAtData({
          bounds: routePolyline.getBoundingBox()
        });
      }
    } catch (error) {
      console.error("Error showing route:", error);
    }
  };

  const handleRouteClick = (route) => {
    setSelectedDriver(route);
    showRouteOnMap(route);
  };

  // Filter status buttons
  const statusButtons = [
    { status: '', label: 'All', color: 'bg-gray-500' },
    { status: 'Active', label: 'Active', color: 'bg-green-500' },
    { status: 'Idle', label: 'Idle', color: 'bg-blue-500' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg text-gray-700 focus:outline-none"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Driver Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out fixed lg:relative z-40 lg:translate-x-0 w-full lg:w-96 h-full bg-white shadow-lg overflow-hidden flex flex-col`}
      >
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <Truck className="mr-2" size={24} />
            Driver Monitoring
          </h2>
          <p className="text-blue-100 mt-1">Online Tracking System</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver, license plate..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="p-4 border-b flex flex-wrap gap-2">
          {statusButtons.map((button) => (
            <button
              key={button.status}
              className={`px-3 py-1 rounded-full text-white text-sm transition ${
                statusFilter === button.status ? button.color : 'bg-gray-300'
              }`}
              onClick={() => setStatusFilter(button.status)}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredRoutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <User size={48} strokeWidth={1} />
              <p className="mt-2">No drivers found</p>
            </div>
          ) : (
            filteredRoutes.map((route) => {
              // Find driver location from Firebase data
              const driverLocation = firebaseDriverLocations.find(
                (loc) => loc.driverId === route.driver.id
              );
              
              return (
                <div
                  key={route.routeId}
                  className={`mx-4 my-2 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedDriver?.routeId === route.routeId
                      ? 'bg-blue-50 border-l-4 border-blue-500 shadow-md'
                      : 'bg-white hover:bg-gray-50 border border-gray-100'
                  }`}
                  onClick={() => handleRouteClick(route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white mr-3 ${
                          route.status === 'Active' ? 'bg-green-500' : 
                          route.status === 'Idle' ? 'bg-blue-500' : 
                          route.status === 'Break' ? 'bg-amber-500' : 'bg-gray-500'
                        }`}
                      >
                        {route.driver.firstName.charAt(0)}{route.driver.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {route.driver.firstName} {route.driver.lastName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Truck size={14} className="mr-1" />
                          {route.vehicle.licensePlate}
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        route.status === 'Idle' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {route.status === 'Active' ? 'Active' : 
                       route.status === 'Idle' ? 'Idle' : route.status}
                    </div>
                  </div>

                  {selectedDriver?.routeId === route.routeId && driverLocation && (
                    <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm animate-fadeIn">
                      <div>
                        <div className="text-gray-600 font-medium mb-1">Route:</div>
                        <div className="text-sm text-gray-800 mb-2">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                            From: {route.startLocationName}
                          </div>
                          <div className="border-l-2 border-gray-300 h-4 ml-1"></div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            To: {route.endLocationName}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-700 mb-1">
                          <Clock size={14} className="mr-1" />
                          <span>Updated: {formatTime(driverLocation.timestamp)}</span>
                        </div>
                        <div className="flex items-center text-gray-700 mb-1">
                          <MapPin size={14} className="mr-1" />
                          <span>Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Summary footer */}
        <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Drivers: {routes.length}</span>
            <span>Active: {routes.filter(r => r.status === 'Active').length}</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <div id="mapContainer" className="w-full h-full"></div>
        
        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10 text-sm">
          <div className="font-medium mb-2">Legend:</div>
          <div className="flex items-center mb-1">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Idle</span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ListRoute;