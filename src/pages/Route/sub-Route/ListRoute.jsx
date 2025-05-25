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
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../firebase-config";

const ListRoute = () => {
  // Existing state and ref declarations (unchanged)
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
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const token = localStorage.getItem("jwtToken");
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

  // Existing helper functions (unchanged)
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

  const convertM = (distance) => `${(distance / 1000).toFixed(1)} km`;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  // Existing useEffect for map initialization (unchanged)
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

      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(mapInstance),
      );
      window.H.ui.UI.createDefault(mapInstance, defaultLayers);

      mapRef.current = mapInstance;
      setMap(mapInstance);

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

  // Existing useEffect for fetching routes (unchanged)
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

  // Existing useEffect for filtering routes (unchanged)
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

  // Existing updateAllDriverMarkers function (unchanged)
  const updateAllDriverMarkers = () => {
    if (!mapRef.current) return;

    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker) =>
        mapRef.current.removeObject(marker),
      );
      markersRef.current = [];
    }

    filteredRoutes.forEach((route) => {
      const driverLocation = firebaseDriverLocations.find(
        (loc) => loc.driverId === route.driver.id,
      );

      if (driverLocation) {
        let markerColor;
        switch (route.status) {
          case true:
            markerColor = "#22c55e";
            break;
          case false:
            markerColor = "#3b82f6";
            break;
          default:
            markerColor = "#6b7280";
        }

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

        marker.setData({
          name: `${route.driver.firstName} ${route.driver.lastName}`,
          licensePlate: route.vehicle.licensePlate,
          status: route.status,
          timestamp: driverLocation.timestamp,
          speed: driverLocation.speed,
          routeInfo: route,
        });

        marker.addEventListener("tap", (evt) => {
          const data = evt.target.getData();
          setSelectedDriver(data.routeInfo);

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

  // Existing useEffect for updating markers (unchanged)
  useEffect(() => {
    if (filteredRoutes.length > 0 && mapRef.current) {
      updateAllDriverMarkers();
    }
  }, [filteredRoutes]);

  // Existing useEffect for selected driver (unchanged)
  useEffect(() => {
    if (selectedDriver && mapRef.current) {
      const driverLocation = firebaseDriverLocations.find(
        (loc) => loc.driverId === selectedDriver.driver.id,
      );

      if (driverLocation) {
        if (polylineRef.current) {
          mapRef.current.removeObject(polylineRef.current);
          polylineRef.current = null;
        }

        const routePoints = [
          { lat: driverLocation.lat - 0.01, lng: driverLocation.lng - 0.015 },
          { lat: driverLocation.lat - 0.005, lng: driverLocation.lng - 0.01 },
          { lat: driverLocation.lat - 0.002, lng: driverLocation.lng - 0.005 },
          { lat: driverLocation.lat, lng: driverLocation.lng },
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

        mapRef.current.getViewModel().setLookAtData({
          bounds: routeLine.getBoundingBox(),
          padding: 100,
        });
      }
    }
  }, [selectedDriver]);

  // Existing clearMap function (unchanged)
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

  const renderRoute = (route) => {
    const polylineData = route.polyline;
    console.log(route.polyline);
    const routeLine =
      window.H.geo.LineString.fromFlexiblePolyline(polylineData);

    const outlinePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "gray", lineWidth: 8 },
    });
    const routePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "rgba(0, 128, 255, 0.7)", lineWidth: 5 },
    });

    mapRef.current.addObject(outlinePolyline);
    mapRef.current.addObject(routePolyline);
    routePolylines.current.push(outlinePolyline, routePolyline);

    mapRef.current.getViewModel().setLookAtData({
      bounds: routePolyline.getBoundingBox(),
      padding: { top: 50, left: 50, bottom: 50, right: 50 },
    });
  };

  // Modified handleViewRoute function with custom icon for realMarker
  const handleViewRoute = async (route) => {
    try {
      setLoading(true);
      const res = await getWayPoint(route.routeId);
      if (!res || res.length === 0) throw new Error("No waypoints found");
      setWayPoints(res);
      clearMap();

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

      renderRoute(route);

      for (const [index, wayPoint] of res.entries()) {
        let markerIcon;
        let label;

        if (index === 0) {
          // Icon cho điểm đầu (Start) - màu xanh lá
          markerIcon = new window.H.map.Icon(
            `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#22c55e" opacity="0.8"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
            <text x="16" y="20" font-size="12" text-anchor="middle" fill="#22c55e" font-weight="bold">S</text>
          </svg>`,
            { anchor: { x: 16, y: 32 } },
          );
          label = `Start: ${wayPoint.locationName || ""}`;
        } else if (index === res.length - 1) {
          // Icon cho điểm cuối (End) - màu đỏ
          markerIcon = new window.H.map.Icon(
            `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="32" fill="#ef4444" opacity="0.8"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
            <text x="16" y="20" font-size="12" text-anchor="middle" fill="#ef4444" font-weight="bold">E</text>
          </svg>`,
            { anchor: { x: 16, y: 32 } },
          );
          label = `End: ${wayPoint.locationName || ""}`;
        } else {
          // Icon cho waypoint - sử dụng biểu tượng cột mốc
          markerIcon = new window.H.map.Icon(
            "https://img.icons8.com/color/48/000000/marker.png", // Icon cột mốc
            { anchor: { x: 24, y: 48 } },
          );
          label = `Stop ${index}: ${wayPoint.locationName || ""}`;
        }

        const marker = new window.H.map.Marker(
          {
            lat: wayPoint.lat,
            lng: wayPoint.lng,
          },
          { icon: markerIcon },
        );
        marker.setData(label);
        mapRef.current.addObject(marker);
        markers.current.push(marker);

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

      // Lấy vị trí thực tế từ Firestore
      const driverLocation = await getLatestDocumentFromCollection(
        route.routeId,
      );
      console.log(
        "Driver Location:",
        driverLocation?.latitude,
        driverLocation?.longitude,
      );
      if (
        driverLocation &&
        typeof driverLocation.latitude === "number" &&
        typeof driverLocation.longitude === "number"
      ) {
        // Icon xe ô tô cho vị trí thực tế
        const carIcon = new window.H.map.Icon(
          "https://img.icons8.com/color/48/000000/car.png",
          { anchor: { x: 24, y: 48 } },
        );
        const realMarker = new window.H.map.Marker(
          {
            lat: driverLocation.latitude,
            lng: driverLocation.longitude,
          },
          { icon: carIcon },
        );

        const label = `Vị trí thực tế của tài xế`;
        realMarker.setData(label);
        mapRef.current.addObject(realMarker);
        markers.current.push(realMarker);

        realMarker.addEventListener("tap", (evt) => {
          const content = evt.target.getData();
          Swal.fire({
            title: content,
            text: `Lat: ${driverLocation.latitude}, Lng: ${driverLocation.longitude}`,
            icon: "info",
            timer: 5000,
            showConfirmButton: false,
            showCloseButton: true,
            timerProgressBar: true,
          });
        });

        // Cập nhật khung nhìn của bản đồ
        mapRef.current.setCenter({
          lat: driverLocation.latitude,
          lng: driverLocation.longitude,
        });
        mapRef.current.setZoom(15);
      } else {
        // Nếu không có vị trí tài xế, căn giữa bản đồ vào tuyến đường
        if (res.length > 0) {
          mapRef.current.setCenter({
            lat: res[0].lat,
            lng: res[0].lng,
          });
          mapRef.current.setZoom(12);
        }
      }

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
  // Existing statusButtons and getLatestDocumentFromCollection (unchanged)
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

  const getLatestDocumentFromCollection = async (routeId) => {
    if (!routeId) {
      console.error("Error: routeId is null or undefined");
      return null;
    }

    try {
      // Ensure routeId is a string
      const sanitizedRouteId = String(routeId);
      console.log("sanitizedRouteId:", sanitizedRouteId);
      const colRef = collection(db, sanitizedRouteId);
      const q = query(colRef, orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        if (!docData.latitude || !docData.longitude) {
          console.error(
            `Error: Missing latitude or longitude in document for routeId: ${sanitizedRouteId}`,
          );
          return null;
        }
        console.log("Latest document data:", docData);
        return docData;
      } else {
        console.warn(
          `No documents found in collection for routeId: ${sanitizedRouteId}`,
        );
        return null;
      }
    } catch (error) {
      console.error(
        `Error getting latest document for routeId ${routeId}:`,
        error,
      );
      return null;
    }
  };

  // Existing JSX return (unchanged)
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-full bg-white p-2 text-gray-700 shadow-lg focus:outline-none lg:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

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

        <div className="flex-1 overflow-y-auto py-2">
          {filteredRoutes.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <User size={48} strokeWidth={1} />
              <p className="mt-2">No drivers found</p>
            </div>
          ) : (
            filteredRoutes.map((route) => {
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

                    let waypoints = [];
                    try {
                      waypoints = await getWayPoint(route.routeId);
                    } catch (err) {
                      waypoints = [];
                    }

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

        <div className="border-t bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Drivers: {routes.length}</span>
            <span>
              Active: {routes.filter((r) => r.status === "Active").length}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        <div id="mapContainer" className="h-full w-full"></div>

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
