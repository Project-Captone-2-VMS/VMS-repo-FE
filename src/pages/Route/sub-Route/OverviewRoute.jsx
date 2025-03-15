import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Select } from "antd";
import { over } from "stompjs";
import {
  getInterConnections,
  getDriverNoActive,
  getVehicleNoActive,
  findSequence,
  listRouteNoActive,
  getUsernameByDriverId,
  getWayPoint,
  getAllWarehouses,
} from "../../../services/apiRequest";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import SockJS from "sockjs-client";
import Pagination from "@/components/Pagination";

const { Option } = Select;

const Route = () => {
  // Các state không thay đổi, giữ nguyên như mã gốc
  const [routes, setRoutes] = useState([]);
  const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);
  const [wayPoints, setWayPoints] = useState([]);
  const [interconnect, setInterconnect] = useState([]);
  const [formDriver, setFormDriver] = useState([]);
  const [formVehicle, setFormVehicle] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [formDataSendNotification, setFormDataSendNotification] = useState({
    title: "You have a new route",
    content: "Please check your route and estimate the time",
    type: "SYSTEM",
  });

  let socket = null;
  let stompClient = null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const filteredRoutes = routes;
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeDate, setRouteDate] = useState("");
  const [routeTime, setRouteTime] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const token = localStorage.getItem("jwtToken");
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [customOrigin, setCustomOrigin] = useState("");
  const [customDestination, setCustomDestination] = useState("");

  const routePolylines = useRef([]);
  const markers = useRef([]);

  function convertM(distance) {
    return `${(distance / 1000).toFixed(1)} km`;
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverResult = await getDriverNoActive();
        setFormDriver(driverResult);
        const vehicleResult = await getVehicleNoActive();
        setFormVehicle(vehicleResult);
        const listRoute = await listRouteNoActive();
        setRoutes(listRoute);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = async (id) => {
    const res = await getWayPoint(id);
    setWayPoints(res);
    const response = await getInterConnections(id);
    setInterconnect(response);
    setIsDetailModalVisible(true);
  };

  useEffect(() => {
    const platformInstance = new H.service.Platform({ apikey: apiKey });
    const defaultLayers = platformInstance.createDefaultLayers();
    const mapInstance = new H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 16.0583, lng: 108.2210 },
        zoom: 14,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance));
    H.ui.UI.createDefault(mapInstance, defaultLayers);
    setMap(mapInstance);

    mapInstance.addEventListener("tap", async function (evt) {
      const coord = mapInstance.screenToGeo(
        evt.currentPointer.viewportX,
        evt.currentPointer.viewportY
      );
      const clickedMarker = new H.map.Marker({ lat: coord.lat, lng: coord.lng });
      mapInstance.addObject(clickedMarker);
      markers.current.push(clickedMarker);

      const address = await convertGeocode(coord.lat, coord.lng);
      const addressText = address ? address.label : "Địa chỉ không tìm thấy";
      setTextareaValue((prev) => prev + addressText + "\n");
      setSelectedCoordinates((prev) => [...prev, { lat: coord.lat, lng: coord.lng }]);
    });

    return () => {
      mapInstance.dispose();
    };
  }, [apiKey]);

  useEffect(() => {
    const fetchWarehouseLocations = async () => {
      try {
        const warehousesData = await getAllWarehouses();
        setWarehouseLocations(warehousesData);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        toast.error("Failed to fetch warehouse locations");
      }
    };
    fetchWarehouseLocations();
  }, []);

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
        }
      );
      if (response.data && response.data.items && response.data.items.length > 0) {
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
      } else {
        return null;
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setTextareaValue(value);

    markers.current.forEach((marker) => {
      map.removeObject(marker);
    });
    markers.current = [];

    const lines = value.split("\n").filter((line) => line.trim() !== "");
    const newCoordinates = [];
    lines.forEach((line) => {
      const matches = line.match(/([-+]?[0-9]*\.?[0-9]+),\s*([-+]?[0-9]*\.?[0-9]+)/);
      if (matches) {
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        const newMarker = new H.map.Marker({ lat, lng });
        map.addObject(newMarker);
        markers.current.push(newMarker);
        newCoordinates.push({ lat, lng });
      }
    });
    setSelectedCoordinates(newCoordinates);
  };

  const geocode = async (address) => {
    if (!address || !address.trim()) {
      throw new Error("Invalid address. Please enter a valid address.");
    }
    try {
      const response = await axios.get("https://geocode.search.hereapi.com/v1/geocode", {
        params: {
          q: address,
          apikey: apiKey,
        },
      });
      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].position;
      } else {
        throw new Error("No location found");
      }
    } catch (error) {
      console.error("Geocode error:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  // Hàm fetchRoute sửa đổi để gọi trực tiếp HERE Maps API nếu backend không hỗ trợ
  const fetchRoute = async (originCoords, destinationCoords) => {
    setLoading(true);
    setError(null);
    try {
      // Xóa các polyline và marker cũ
      routePolylines.current.forEach((polyline) => map.removeObject(polyline));
      routePolylines.current = [];
      markers.current.forEach((marker) => map.removeObject(marker));
      markers.current = [];

      // Gọi trực tiếp HERE Maps API để lấy 2 tuyến đường
      const response = await axios.get("https://router.hereapi.com/v8/routes", {
        params: {
          origin: `${originCoords.lat},${originCoords.lng}`,
          destination: `${destinationCoords.lat},${destinationCoords.lng}`,
          transportMode: "car",
          alternatives: 2, // Yêu cầu 1 tuyến thay thế (tổng cộng 2 tuyến)
          return: "polyline,summary",
          apikey: apiKey,
        },
      });

      console.log("HERE API Response:", response.data);

      if (response.data.routes && response.data.routes.length > 0) {
        const routesData = response.data.routes.slice(0, 3); // Lấy tối đa 2 tuyến
        setRoutes(routesData);

        // Tìm tuyến ngắn nhất
        let minIndex = 0;
        let minDistance = routesData[0].sections[0].summary.length;
        for (let i = 1; i < routesData.length; i++) {
          if (routesData[i].sections[0].summary.length < minDistance) {
            minDistance = routesData[i].sections[0].summary.length;
            minIndex = i;
          }
        }
        setSelectedRouteIndex(minIndex);

        // Vẽ các tuyến đường lên bản đồ
        routesData.forEach((route, index) => {
          const section = route.sections[0];
          const polylineData = section.polyline; // Polyline từ HERE API
          const routeLine = H.geo.LineString.fromFlexiblePolyline(polylineData);
          const strokeColor = index === minIndex ? "red" : index === 0 ? "blue" : "green";
          const routePolyline = new H.map.Polyline(routeLine, {
            style: { strokeColor, lineWidth: 5 },
          });
          map.addObject(routePolyline);
          routePolylines.current.push(routePolyline);

          if (index === minIndex) {
            map.getViewModel().setLookAtData({ bounds: routePolyline.getBoundingBox() });
          }
        });

        // Thêm marker cho điểm xuất phát và điểm đến
        const originMarker = new H.map.Marker({ lat: originCoords.lat, lng: originCoords.lng });
        const destinationMarker = new H.map.Marker({ lat: destinationCoords.lat, lng: destinationCoords.lng });
        map.addObjects([originMarker, destinationMarker]);
        markers.current.push(originMarker, destinationMarker);
      } else {
        setError("No routes found.");
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setError("Failed to fetch route. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const validateDateTime = () => {
    const now = new Date();
    const selectedDateTime = new Date(`${routeDate}T${routeTime}`);
    if (selectedDateTime < now) {
      setError("Route date and time must be in the future");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setOrigin("");
    setDestination("");
    setSelectedDriver("");
    setSelectedVehicle("");
    setRouteDate("");
    setRouteTime("");
    setTextareaValue("");
    setSelectedCoordinates([]);
  };

  const handleFindSequence = async () => {
    if (!validateDateTime()) return;
    if (selectedCoordinates.length < 2) {
      setError("Please select at least two points.");
      return;
    }
    if (!routeDate || !routeTime) {
      setError("Please select both date and time for the route.");
      return;
    }
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
    try {
      const originCoords = await geocode(origin);
      const destinationCoords = await geocode(destination);
      const destinations = selectedCoordinates.map((coord) => `${coord.lat},${coord.lng}`).join(",");

      const formData = {
        startLat: originCoords.lat,
        startLng: originCoords.lng,
        destinations: destinations,
        endLat: destinationCoords.lat,
        endLng: destinationCoords.lng,
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
        startDate: formatDate(routeDate),
        startTime: `${routeTime}:00`,
      };

      const headers = {
        Authorization: `Bearer ${token}`, // Sử dụng token thực tế
      };

      const results = await findSequence({ ...formData, headers });
      console.log("results", results);

      const findUserNameByDriverId = await getUsernameByDriverId(formData.driverId);
      console.log("findUserNameByDriverId", findUserNameByDriverId);
      if (stompClient !== null && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("Đã ngắt kết nối socket cũ!");
        });
      } else {
        socket = new SockJS("http://localhost:8080/ws");
        stompClient = over(socket);
        stompClient.connect({}, () => {
          stompClient.send(
            `/app/chat/${findUserNameByDriverId}`,
            {},
            JSON.stringify(formDataSendNotification)
          );
          toast.success("Successfully created!");
          console.log("Notification Sent:", formDataSendNotification);
          window.location.reload();
        });
      }
      resetForm();
    } catch (error) {
      if (error.response && error.response.data) {
        setError(`Error: ${error.response.data.message}`);
      } else {
        setError("Failed to fetch sequence. Please try again later.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const originCoords = await geocode(origin);
      const destinationCoords = await geocode(destination);
      await fetchRoute(originCoords, destinationCoords);
    } catch (error) {
      setError("Failed to geocode location. Please check the addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routes.length > 0 && routePolylines.current.length > 0) {
      routePolylines.current.forEach((polyline, index) => {
        polyline.setStyle({
          strokeColor:
            index.toString() === selectedRouteIndex.toString() ? "red" : index === 0 ? "blue" : "green",
          lineWidth: 5,
        });
      });
    }
  }, [selectedRouteIndex, routes]);

  // Phần JSX giữ nguyên như mã gốc
  return (
    <div>
      <div className="flex justify-between">
        <Toaster />
        <div
          className="map-container rounded-lg border bg-white p-3"
          style={{ width: "71%", height: "700px" }}
          ref={mapRef}
        ></div>
        <div className="gap-3 rounded-lg border bg-white px-3 py-2" style={{ width: "28%" }}>
          <div className="form-container">
            <h2 className="mb-4 text-2xl font-bold">Route on HERE Map</h2>
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  Start:
                  <Select
                    className="mt-1 w-full"
                    value={origin}
                    onChange={(value) => {
                      setOrigin(value);
                      if (value === destination) {
                        setDestination("");
                      }
                    }}
                    onSearch={(value) => setCustomOrigin(value)}
                    showSearch
                    allowClear
                    mode="combobox"
                    placeholder="Select or enter start location"
                    filterOption={false}
                  >
                    {warehouseLocations.map((warehouse) => (
                      <Option key={warehouse.warehouseId} value={warehouse.location}>
                        {warehouse.warehouseName} - {warehouse.location}
                      </Option>
                    ))}
                    {customOrigin && (
                      <Option key="custom" value={customOrigin}>
                        {customOrigin}
                      </Option>
                    )}
                  </Select>
                </label>
              </div>
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  End:
                  <Select
                    className="mt-1 w-full"
                    value={destination}
                    onChange={(value) => setDestination(value)}
                    onSearch={(value) => setCustomDestination(value)}
                    showSearch
                    allowClear
                    mode="combobox"
                    placeholder="Select or enter end location"
                    filterOption={false}
                  >
                    {warehouseLocations
                      .filter((warehouse) => warehouse.location !== origin)
                      .map((warehouse) => (
                        <Option key={warehouse.warehouseId} value={warehouse.location}>
                          {warehouse.warehouseName} - {warehouse.location}
                        </Option>
                      ))}
                    {customDestination && (
                      <Option key="custom" value={customDestination}>
                        {customDestination}
                      </Option>
                    )}
                  </Select>
                </label>
              </div>
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  Driver:
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
                  >
                    <option value="" disabled>
                      Select a driver
                    </option>
                    {formDriver && formDriver.length > 0 ? (
                      formDriver.map((driver) => (
                        <option key={driver.id} value={driver.driverId}>
                          {driver.lastName} {driver.firstName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading drivers...</option>
                    )}
                  </select>
                </label>
              </div>
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  Select Vehicle:
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
                  >
                    <option value="" disabled>
                      Select a vehicle
                    </option>
                    {formVehicle && formVehicle.length > 0 ? (
                      formVehicle.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.vehicleId}>
                          {vehicle.licensePlate}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading vehicles...</option>
                    )}
                  </select>
                </label>
              </div>
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  Route Date:
                  <Input
                    type="date"
                    value={routeDate}
                    onChange={(e) => setRouteDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </label>
              </div>
              <div className="mb-4 px-1">
                <label className="block text-sm font-medium text-gray-700">
                  Route Time:
                  <Input
                    type="time"
                    value={routeTime}
                    onChange={(e) => setRouteTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300"
                  />
                </label>
              </div>
              {routes.length > 0 && (
                <div className="mb-4 px-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Route:
                    <select
                      value={selectedRouteIndex}
                      onChange={(e) => setSelectedRouteIndex(parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
                    >
                      {routes.map((route, index) => {
                        const distance = route.sections?.[0]?.summary
                          ? convertM(route.sections[0].summary.length)
                          : "N/A";
                        return (
                          <option key={index} value={index}>
                            Route {index + 1} - {distance}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
              )}
              <div className="w-full" style={{ width: "100%", padding: "10px" }}>
                <h3 className="text-lg font-semibold">Coordinate Information</h3>
                <textarea
                  value={textareaValue}
                  onChange={handleTextareaChange}
                  rows={4}
                  className="mt-4 w-full rounded-md border border-gray-300"
                />
              </div>
              <div className="flex w-full items-center justify-between gap-5 px-3 text-10 font-semibold">
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700"
                >
                  Get Route
                </button>
                <button
                  type="button"
                  onClick={handleFindSequence}
                  className="w-full rounded-md bg-green-600 p-3 text-white hover:bg-green-700"
                >
                  Find Sequence
                </button>
              </div>
            </form>
            {loading && <p>Loading route...</p>}
            {error && <p className="text-red-600">{error}</p>}
          </div>
        </div>
      </div>

      <div className="relative mt-2 overflow-x-auto bg-white p-4 shadow-md sm:rounded-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Information List Route</h2>
        <table className="w-full rounded-lg text-left text-sm font-normal text-black">
          <thead className="bg-gray-50 text-xs uppercase text-black">
            <tr>
              <th scope="col" className="px-6 py-3">Start</th>
              <th scope="col" className="px-6 py-3">End</th>
              <th scope="col" className="px-6 py-3">Time</th>
              <th scope="col" className="px-6 py-3">Distance</th>
              <th scope="col" className="px-6 py-3">Fullname Driver</th>
              <th scope="col" className="px-6 py-3">License Plate</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Time</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoutes.map((route) => (
              <tr key={route.routeId} className="border-b bg-white hover:bg-gray-50">
                <td className="px-6 py-4">{route.startLocationName}</td>
                <td className="px-6 py-4">{route.endLocationName}</td>
                <td className="px-6 py-4">{formatTime(route.totalTime)}</td>
                <td className="px-6 py-4">{convertM(route.totalDistance)}</td>
                <td className="px-6 py-4">{route.driverId} {route.driver?.firstName || ""} {route.driver?.lastName || ""}</td>
                <td className="px-6 py-4">{route.vehicle?.licensePlate || ""}</td>
                <td className="px-6 py-4">{new Date(route.routeDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{route.startTime}</td>
                <td className="px-2 py-4">
                  <Button type="link" onClick={() => handleViewDetails(route.routeId)}>
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRoutes.length}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <Modal
        title="Route Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div className="space-y-6">
          {selectedRouteDetails && (
            <div>
              <div className="rounded-lg bg-gray-200 p-4">
                <h3 className="mb-4 text-lg font-semibold">Route Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Distance</h4>
                    <p className="text-lg text-black">{selectedRouteDetails.route?.routeId} meters</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Time</h4>
                    <p className="text-lg"></p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-gray-200 p-4">
                <h3 className="mb-4 text-lg font-semibold">Assignment Details</h3>
              </div>
            </div>
          )}
          <div className="rounded-lg bg-gray-200 p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500">From</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500">To</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500">Distance</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500">Time Waypoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {wayPoints.map(
                    (wayPoint, index) =>
                      index < wayPoints.length - 1 && (
                        <tr key={wayPoint.waypointId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{wayPoint.locationName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{wayPoints[index + 1].locationName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {interconnect[index] ? convertM(interconnect[index].distance) : ""}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {interconnect[index] ? formatTime(interconnect[index].timeWaypoint) : ""}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Route;