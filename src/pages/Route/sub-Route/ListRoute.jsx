import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Truck, Clock, Menu, X, User } from "lucide-react";
import { Button, Modal } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import {
  getWayPoint,
  getInterConnections,
  getAllRoute,
  getAllDrivers,
} from "../../../services/apiRequest";

const ListRoute = () => {
  // Thêm/sửa các states
  const [routes, setRoutes] = useState([]);
  const [wayPoints, setWayPoints] = useState([]);
  const [interconnect, setInterconnect] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [map, setMap] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [firebaseDriverLocations, setFirebaseDriverLocations] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const routePolylines = useRef([]);
  const markers = useRef([]);
  const mapRef = useRef(null);
  const markersRef = useRef([]); // Thêm dòng này
  const polylineRef = useRef(null); // Thêm dòng này nếu chưa có
  const token = localStorage.getItem("jwtToken");
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

  const convertGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        "https://revgeocode.search.hereapi.com/v1/revgeocode",
        {
          params: {
            at: `${lat},${lng}`,
            lang: "en-US",
            apiKey: apiKey,
          },
        },
      );

      if (
        response.data &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        const addr = response.data.items[0].address;
        return {
          street: addr.street || "",
          houseNumber: addr.houseNumber || "",
          district: addr.district || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.countryName || "",
          postalCode: addr.postalCode || "",
          label: response.data.items[0].title || "",
        };
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  // Helper functions
  const convertM = (distance) => `${(distance / 1000).toFixed(1)} km`;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  // Initialize map
  useEffect(() => {
    if (window.H && !mapRef.current) {
      const platformInstance = new H.service.Platform({ apikey: apiKey });
      const defaultLayers = platformInstance.createDefaultLayers();

      const mapInstance = new window.H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
          center: { lat: 10.8231, lng: 106.6297 },
          zoom: 12,
          pixelRatio: window.devicePixelRatio || 1,
        },
      );

      // Thêm các control và behavior cho map
      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(mapInstance),
      );
      window.H.ui.UI.createDefault(mapInstance, defaultLayers);

      mapRef.current = mapInstance;
      setMap(mapInstance);

      // Xử lý resize map
      window.addEventListener("resize", () =>
        mapInstance.getViewPort().resize(),
      );

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
      try {
        const listRoute = await getAllRoute();
        if (listRoute && Array.isArray(listRoute) && listRoute.length > 0) {
          const validRoutes = listRoute.filter(
            (route) =>
              !isNaN(route.startLat) &&
              !isNaN(route.startLng) &&
              !isNaN(route.endLat) &&
              !isNaN(route.endLng),
          );

          const routeAddressPromises = validRoutes.map(async (route) => {
            const { startLat, startLng, endLat, endLng } = route;
            const startAddress = await convertGeocode(startLat, startLng);
            const endAddress = await convertGeocode(endLat, endLng);
            return { ...route, startAddress, endAddress };
          });

          const routeAddresses = await Promise.all(routeAddressPromises);
          setRoutes(routeAddresses);
          setFilteredRoutes(routeAddresses);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
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
          route.vehicle.licensePlate
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
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
      markersRef.current.forEach((marker) =>
        mapRef.current.removeObject(marker),
      );
      markersRef.current = [];
    }

    // Create all driver markers with different colors based on status
    filteredRoutes.forEach((route) => {
      const driverLocation = firebaseDriverLocations.find(
        (loc) => loc.driverId === route.driver.id,
      );

      if (driverLocation) {
        let markerColor;
        switch (route.status) {
          case "Active":
            markerColor = "#22c55e"; // green
            break;
          case "Idle":
            markerColor = "#3b82f6"; // blue
            break;
          case "Break":
            markerColor = "#f59e0b"; // amber
            break;
          default:
            markerColor = "#6b7280"; // gray
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
          anchor: { x: 16, y: 16 },
        });

        const marker = new window.H.map.Marker(
          { lat: driverLocation.lat, lng: driverLocation.lng },
          { icon: icon },
        );

        // Add data to marker for info window
        marker.setData({
          name: `${route.driver.firstName} ${route.driver.lastName}`,
          licensePlate: route.vehicle.licensePlate,
          status: route.status,
          timestamp: driverLocation.timestamp,
          speed: driverLocation.speed,
          routeInfo: route,
        });

        // Add event listener to marker
        marker.addEventListener("tap", (evt) => {
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
                <div style="color: ${data.status === "Active" ? "green" : data.status === "Break" ? "orange" : "blue"};">
                  Trạng thái: ${data.status}
                </div>
              </div>
            `,
          });

          // Add info bubble to UI
          mapRef.current.getViewModel().setLookAtData(
            {
              position: { lat: driverLocation.lat, lng: driverLocation.lng },
              zoom: 15,
            },
            true,
          );
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
        (loc) => loc.driverId === selectedDriver.driver.id,
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
        routePoints.forEach((point) => {
          lineString.pushPoint(point);
        });

        const routeLine = new window.H.map.Polyline(lineString, {
          style: {
            lineWidth: 5,
            strokeColor: "#22c55e",
            lineTailCap: "arrow-tail",
            lineHeadCap: "arrow-head",
          },
        });

        mapRef.current.addObject(routeLine);
        polylineRef.current = routeLine;

        // Zoom to show the whole route
        mapRef.current.getViewModel().setLookAtData({
          bounds: routeLine.getBoundingBox(),
          padding: 100,
        });
      }
    }
  }, [selectedDriver]);

  const clearMap = () => {
    routePolylines.current.forEach((polyline) => {
      mapRef.current.removeObject(polyline);
    });
    routePolylines.current = [];
    markers.current.forEach((marker) => {
      mapRef.current.removeObject(marker);
    });
    markers.current = [];
  };

  // Sửa lại hàm showRouteOnMap
  const showRouteOnMap = async (route, waypoints = null) => {
    if (!map) return;

    // Clear existing routes and markers
    clearMap();

    try {
      let response;

      if (waypoints) {
        // If waypoints are provided, use the local API
        response = await axios.get(
          "http://localhost:8080/api/route/findRoute",
          {
            params: {
              originLat: waypoints[0].lat,
              originLng: waypoints[0].lng,
              destinationLat: waypoints[waypoints.length - 1].lat,
              destinationLng: waypoints[waypoints.length - 1].lng,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else if (route?.startLocation && route?.endLocation) {
        // Check if route and its properties exist before splitting
        const startPoint = route.startLocation.split(",");
        const endPoint = route.endLocation.split(",");

        response = await axios.get("https://router.hereapi.com/v8/routes", {
          params: {
            transportMode: "car",
            origin: `${startPoint[0]},${startPoint[1]}`,
            destination: `${endPoint[0]},${endPoint[1]}`,
            return: "polyline,summary",
            apikey: apiKey,
          },
        });
      } else {
        throw new Error("Invalid route data: Missing start or end location");
      }

      if (response.data.routes?.[0]) {
        const routeData = response.data.routes[0];
        const section = routeData.sections[0];
        const polylineData = section.polyline;
        const routeLine = H.geo.LineString.fromFlexiblePolyline(polylineData);

        const routePolyline = new window.H.map.Polyline(routeLine, {
          style: { strokeColor: "blue", lineWidth: 5 },
        });

        map.addObject(routePolyline);
        routePolylines.current.push(routePolyline);

        // Add markers
        if (waypoints) {
          // Add waypoint markers
          waypoints.forEach((point, index) => {
            const marker = new window.H.map.Marker({
              lat: point.lat,
              lng: point.lng,
            });
            map.addObject(marker);
            markers.current.push(marker);
          });
        } else {
          // Add start/end markers
          const startPoint = route.startLocation.split(",");
          const endPoint = route.endLocation.split(",");

          const startMarker = new window.H.map.Marker({
            lat: parseFloat(startPoint[0]),
            lng: parseFloat(startPoint[1]),
          });
          const endMarker = new window.H.map.Marker({
            lat: parseFloat(endPoint[0]),
            lng: parseFloat(endPoint[1]),
          });

          map.addObjects([startMarker, endMarker]);
          markers.current.push(startMarker, endMarker);
        }

        // Fit map to show the route
        map.getViewModel().setLookAtData({
          bounds: routePolyline.getBoundingBox(),
          padding: { top: 50, left: 50, bottom: 50, right: 50 },
        });
      }
    } catch (error) {
      console.error("Error showing route:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load route on map. Missing route coordinates.",
      });
    }
  };

  const handleRouteClick = (route) => {
    // Sửa lại hàm handleRouteClick
    const handleRouteClick = (route) => {
      if (!route?.startLocation || !route?.endLocation) {
        Swal.fire({
          icon: "warning",
          title: "Missing Data",
          text: "Route coordinates are not available",
        });
        return;
      }
      setSelectedDriver(route);
      showRouteOnMap(route);
    };

    handleRouteClick(route);
  };

  const handleDriverClick = async (driverId, routeId) => {
    try {
      const res = await getWayPoint(routeId);
      setMapWayPoints(res);

      const resInter = await getInterConnections(routeId);
      setMapInters(resInter);
      setLoading(true);
      clearMap();

      for (const [index, wayPoint] of res.entries()) {
        const marker = new window.H.map.Marker({
          lat: wayPoint.lat,
          lng: wayPoint.lng,
        });

        const address = await convertGeocode(wayPoint.lat, wayPoint.lng);
        let label =
          index === 0
            ? "Start"
            : index === res.length - 1
              ? "End"
              : `Waypoint ${index}`;

        if (address) {
          label += `: ${address.label}`;
        }

        marker.setData(label);
        mapRef.current.addObject(marker);
        markers.current.push(marker);

        marker.addEventListener("tap", (e) => {
          const content = marker.getData();
          Swal.fire({
            title: content,
            timer: 5000,
            showConfirmButton: false,
            showCloseButton: true,
            timerProgressBar: true,
          });
        });
      }

      // Show route on map
      await showRouteOnMap(null, res);
    } catch (error) {
      console.error("Error showing driver route:", error);
    }
  };

  // Thêm hàm renderRoute
  const renderRoute = (route) => {
    const section = route.sections[0];
    const polylineData = section.polyline;
    const routeLine =
      window.H.geo.LineString.fromFlexiblePolyline(polylineData);

    // Create route polylines
    const outlinePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "gray", lineWidth: 8 },
    });
    const routePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "rgba(0, 128, 255, 0.7)", lineWidth: 5 },
    });

    mapRef.current.addObject(outlinePolyline);
    mapRef.current.addObject(routePolyline);
    routePolylines.current.push(outlinePolyline, routePolyline);

    // Fit map to show the route
    mapRef.current.getViewModel().setLookAtData({
      bounds: routePolyline.getBoundingBox(),
      padding: { top: 50, left: 50, bottom: 50, right: 50 },
    });
  };

  // Thêm hàm xử lý view route
  const handleViewRoute = async (route) => {
    try {
      setLoading(true);

      // Get waypoints
      const res = await getWayPoint(route.routeId);
      if (!res || res.length === 0) {
        throw new Error("No waypoints found");
      }

      setWayPoints(res);
      clearMap();

      // Add markers for each waypoint with locationName from DB
      for (const [index, wayPoint] of res.entries()) {
        const marker = new window.H.map.Marker({
          lat: wayPoint.lat,
          lng: wayPoint.lng,
        });

        // Lấy tên điểm dừng từ DB
        let label;
        if (index === 0) {
          label = `Start: ${wayPoint.locationName || ""}`;
        } else if (index === res.length - 1) {
          label = `End: ${wayPoint.locationName || ""}`;
        } else {
          label = `Stop ${index}: ${wayPoint.locationName || ""}`;
        }

        marker.setData(label);
        mapRef.current.addObject(marker);
        markers.current.push(marker);

        // Add click event to marker
        marker.addEventListener("tap", (evt) => {
          const content = evt.target.getData();
          Swal.fire({
            title: content,
            timer: 5000,
            showConfirmButton: false,
            showCloseButton: true,
            timerProgressBar: true,
          });
        });
      }

      // Get route data
      const response = await axios.get(
        "http://localhost:8080/api/route/findRoute",
        {
          params: {
            originLat: res[0].lat,
            originLng: res[0].lng,
            destinationLat: res[res.length - 1].lat,
            destinationLng: res[res.length - 1].lng,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.routes?.[0]) {
        renderRoute(response.data.routes[0]);
      }

      // Get interconnections
      const resInter = await getInterConnections(route.routeId);
      setInterconnect(resInter);
    } catch (error) {
      console.error("Error viewing route:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load route details",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusButtons = [
    {
      status: "",
      label: "All",
      color: "bg-gradient-to-r from-blue-400 to-green-400",
      text: "text-white",
      border: "border-blue-400",
    },
    {
      status: "Active",
      label: "Active",
      color: "bg-green-500",
      text: "text-white",
      border: "border-green-500",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-full bg-white p-2 text-gray-700 shadow-lg focus:outline-none lg:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Driver Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-40 flex h-full w-full flex-col overflow-hidden bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:w-96 lg:translate-x-0`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h2 className="flex items-center text-2xl font-bold">
            <Truck className="mr-2" size={24} />
            Driver Monitoring
          </h2>
          <p className="mt-1 text-blue-100">Online Tracking System</p>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver, license plate..."
              className="w-full rounded-lg border py-2 pl-10 pr-4 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap justify-center gap-2 border-b p-4">
          {statusButtons.map((button) => (
            <button
              key={button.status}
              className={`rounded-full border-2 px-5 py-2 font-semibold shadow transition-all duration-200 ${statusFilter === button.status ? `${button.color} ${button.text} ${button.border}` : "border-transparent bg-gray-100 text-gray-700"} hover:scale-105 hover:shadow-lg`}
              onClick={() => setStatusFilter(button.status)}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredRoutes.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <User size={48} strokeWidth={1} />
              <p className="mt-2">No drivers found</p>
            </div>
          ) : (
            filteredRoutes.map((route) => {
              // Find driver location from Firebase data
              const driverLocation = firebaseDriverLocations.find(
                (loc) => loc.driverId === route.driver.id,
              );

              return (
                <div
                  key={route.routeId}
                  className={`mx-4 my-3 cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                    selectedDriver?.routeId === route.routeId
                      ? "scale-105 border-blue-400 bg-gradient-to-r from-blue-100 to-green-100 shadow-xl"
                      : "border-gray-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:shadow-lg"
                  } group`}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const start = route.startLocationName;
                    const end = route.endLocationName;

                    // Lấy waypoint từ API
                    let waypoints = [];
                    try {
                      waypoints = await getWayPoint(route.routeId);
                    } catch (err) {
                      waypoints = [];
                    }

                    // Tạo HTML cho danh sách waypoint
                    const waypointHtml =
                      waypoints && waypoints.length > 0
                        ? `<div style="margin-top:8px">
                          <b style="color:#0ea5e9">Waypoints:</b>
                          <ul style="padding-left:18px;margin:0">
                            ${waypoints
                              .map(
                                (wp, idx) =>
                                  `<li style="margin-bottom:2px">
                                <span style="color:#6366f1;font-weight:bold">•</span> ${wp.locationName || `${wp.lat},${wp.lng}`}
                              </li>`,
                              )
                              .join("")}
                          </ul>
                        </div>`
                        : "";

                    Swal.fire({
                      title: `<span style="color:#2563eb">${route.driver.firstName} ${route.driver.lastName}</span>`,
                      html: `
                        <div style="text-align:left">
                          <b style="color:#22c55e">Start:</b> ${start || "N/A"}<br/>
                          <b style="color:#ef4444">End:</b> ${end || "N/A"}
                          ${waypointHtml}
                        </div>
                      `,
                      showCloseButton: true,
                      width: 500,
                    });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow ${route.status === "Active" ? "bg-green-500" : "bg-gray-400"} transition-transform duration-200 group-hover:scale-110`}
                      >
                        {route.driver.firstName.charAt(0)}
                        {route.driver.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-700 group-hover:underline">
                          {route.driver.firstName} {route.driver.lastName}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Truck size={14} className="mr-1 text-blue-400" />
                          <span className="font-semibold text-gray-700">
                            {route.vehicle.licensePlate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-green-600">
                        Distance: {convertM(route.totalDistance)}
                      </div>
                      <div className="font-semibold text-blue-600">
                        Time: {formatTime(route.totalTime)}
                      </div>
                      {route.status === "Active" && (
                        <div className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 shadow">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRoute(route);
                      }}
                      className="rounded-full border border-green-400 bg-white px-4 py-1 text-sm font-semibold text-green-700 shadow transition hover:bg-green-50"
                    >
                      View Route
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary footer */}
        <div className="border-t bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Drivers: {routes.length}</span>
            <span>
              Active: {routes.filter((r) => r.status === "Active").length}
            </span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="relative flex-1">
        <div id="mapContainer" className="h-full w-full"></div>

        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 z-10 rounded-lg bg-white p-3 text-sm shadow-lg">
          <div className="mb-2 font-medium">Legend:</div>
          <div className="mb-1 flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Idle</span>
          </div>
        </div>
      </div>

      {/* Route Detail Modal */}
      <Modal
        title="Route Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={950}
      >
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">
                  Route Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Start Point:</p>
                    <p>{wayPoints[0]?.address || "Loading..."}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Point:</p>
                    <p>
                      {wayPoints[wayPoints.length - 1]?.address || "Loading..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Waypoints</h3>
                <div className="space-y-2">
                  {wayPoints.map((point, index) => (
                    <div key={index} className="rounded bg-gray-50 p-2">
                      <p className="font-medium">Stop {index + 1}</p>
                      <p className="text-sm text-gray-600">{point.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {interconnect && interconnect.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Connections</h3>
                  <div className="space-y-2">
                    {interconnect.map((conn, index) => (
                      <div key={index} className="rounded bg-blue-50 p-2">
                        <p>From: {conn.fromLocation}</p>
                        <p>To: {conn.toLocation}</p>
                        <p>Distance: {convertM(conn.distance)}</p>
                        <p>Time: {formatTime(conn.time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ListRoute;
