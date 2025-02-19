import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Modal } from "antd";

import {
  getWayPoint,
  getInterConnections,
  getRouteByUserName,
  getUserByUsername,
  getAlRouteByUsername,
} from "../../services/apiRequest";

import axios from "axios";
import Swal from "sweetalert2";

export default function RealtimeTrackingDashboard() {
  const [position, setPosition] = useState({ lat: 10.8231, lng: 106.6297 });
  const [routes, setRoutes] = useState([]);
  const [wayPoints, setWayPoints] = useState([]);
  const [error, setError] = useState(null);
  const [interconnect, setInterconnect] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [mapWayPoints, setMapWayPoints] = useState([]);
  const [mapInter, setMapInters] = useState([]);
  const [loading, setLoading] = useState(false);
  const routePolylines = useRef([]);
  const movingMarker = useRef(null);
  const markers = useRef([]);
  const mapRef = useRef(null);
  const usernameLocal = localStorage.getItem("username");
  const token = localStorage.getItem("jwtToken");
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

  const [time, setTime] = useState({ hours: "", minutes: "" });
  const [timeByInterconnection, setTimeByInterconnection] = useState({});
  const [interConnections, setInterConnections] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [path, setPath] = useState([]);
  const [startPoint, setStartPoint] = useState({ lat: "", lng: "" });
  const [endPoint, setEndPoint] = useState({ lat: "", lng: "" });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userData, setUserData] = useState(null);
  const [fullNameUser, setFullNameUser] = useState("");

  const handleChange = (e, interconnectionId) => {
    const { name, value } = e.target;

    setTimeByInterconnection((prevTime) => {
      const updatedTime = {
        ...(prevTime[interconnectionId] || { hours: 0, minutes: 0 }),
        [name]: value,
      };
      return {
        ...prevTime,
        [interconnectionId]: { ...updatedTime },
      };
    });
  };
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
      } else {
        return null;
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  useEffect(() => {
    if (window.H && !mapRef.current) {
      const platform = new window.H.service.Platform({
        apikey: "z4fTmSQepmcgYJASTEaHBjS9zsw4TccWd2oKbT5ubcQ",
      });
      const defaultLayers = platform.createDefaultLayers();
      const mapInstance = new window.H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
          center: { lat: 16.0583, lng: 108.221 },
          zoom: 13,
        },
      );

      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(mapInstance),
      );
      window.H.ui.UI.createDefault(mapInstance, defaultLayers);
      mapRef.current = mapInstance;

      mapInstance.addEventListener("resize", () =>
        mapInstance.getViewPort().resize(),
      );
    }
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const res = await getWayPoint(id);
      if (res && Array.isArray(res) && res.length > 0) {
        const validWaypoints = res.filter(
          (waypoint) => !isNaN(waypoint.lat) && !isNaN(waypoint.lng),
        );

        const waypointAddresses = [];
        for (const waypoint of validWaypoints) {
          const { lat, lng } = waypoint;
          const address = await convertGeocode(lat, lng);
          waypointAddresses.push({ ...waypoint, address });
        }

        setWayPoints(waypointAddresses);
        setError("");
      } else {
        setError("No waypoints found for the given ID.");
        setWayPoints([]);
      }
      const response = await getInterConnections(id);
      setInterconnect(response);
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleViewDetailsInMap = async (id) => {
    try {
      const res = await getWayPoint(id);
      setMapWayPoints(res);

      const resInter = await getInterConnections(id);
      setMapInters(resInter);
      setLoading(true);
      clearMap();

      for (const [index, wayPoint] of res.entries()) {
        const marker = new window.H.map.Marker({
          lat: wayPoint.lat,
          lng: wayPoint.lng,
        });

        const address = await convertGeocode(wayPoint.lat, wayPoint.lng);
        console.log("address", address);
        let label;

        if (address) {
          label = `Waypoint ${index}: ${address.label}`;
        } else {
          label = `Waypoint ${index}: (${wayPoint.lat.toFixed(4)}, ${wayPoint.lng.toFixed(4)})`;
        }

        if (index === 0) {
          label = `Start: ${address ? address.label : `(${wayPoint.lat.toFixed(4)}, ${wayPoint.lng.toFixed(4)})`}`;
        } else if (index === res.length - 1) {
          label = `End: ${address ? address.label : `(${wayPoint.lat.toFixed(4)}, ${wayPoint.lng.toFixed(4)})`}`;
        }

        marker.setData(label);
        mapRef.current.addObject(marker);
        markers.current.push(marker);

        marker.addEventListener("tap", function (e) {
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

      if (response.data.routes?.length > 0) {
        const route = response.data.routes[0];
        renderRoute(route);
      } else {
        setError("No routes found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    } finally {
      setLoading(false);
    }
  };

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
    const section = route.sections[0];
    const polylineData = section.polyline;
    const routeLine =
      window.H.geo.LineString.fromFlexiblePolyline(polylineData);

    const outlinePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "gray", lineWidth: 8 },
    });
    const routePolyline = new window.H.map.Polyline(routeLine, {
      style: { strokeColor: "rgba(173, 216, 230, 0.8)", lineWidth: 5 },
    });

    mapRef.current.addObject(outlinePolyline);
    mapRef.current.addObject(routePolyline);
    routePolylines.current.push(outlinePolyline, routePolyline);

    mapRef.current
      .getViewModel()
      .setLookAtData({ bounds: routePolyline.getBoundingBox() });

    const originMarker = new window.H.map.Marker({
      lat: routeWayPoints[0].lat,
      lng: routeWayPoints[0].lng,
    });
    const destinationMarker = new window.H.map.Marker({
      lat: routeWayPoints[routeWayPoints.length - 1].lat,
      lng: routeWayPoints[routeWayPoints.length - 1].lng,
    });

    mapRef.current.addObject(originMarker);
    mapRef.current.addObject(destinationMarker);
    markers.current.push(originMarker, destinationMarker);
  };

  function convertM(distance) {
    return `${(distance / 1000).toFixed(1)} km`;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const responseUsername = await getUserByUsername(usernameLocal);
        const fullName =
          responseUsername.result.firstName +
          " " +
          responseUsername.result.lastName;
        setFullNameUser(fullName);
        setUserData(responseUsername.result);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [usernameLocal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listRoute = await getAlRouteByUsername(usernameLocal);
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
          console.log(routeAddresses);
          setRoutes(routeAddresses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [usernameLocal]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  const fetchRoute = async (start, end) => {
    setLoading(true);
    try {
      routePolylines.current.forEach((polyline) => {
        mapRef.current.removeObject(polyline);
      });
      routePolylines.current = [];
      markers.current.forEach((marker) => {
        mapRef.current.removeObject(marker);
      });
      markers.current = [];

      const response = await axios.get(
        "http://localhost:8080/api/route/findRoute",
        {
          params: {
            originLat: start.lat,
            originLng: start.lng,
            destinationLat: end.lat,
            destinationLng: end.lng,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const section = route.sections[0];
        const polylineData = section.polyline;
        const routeLine =
          window.H.geo.LineString.fromFlexiblePolyline(polylineData);

        const outlinePolyline = new window.H.map.Polyline(routeLine, {
          style: {
            strokeColor: "gray",
            lineWidth: 8,
          },
        });

        const routePolyline = new window.H.map.Polyline(routeLine, {
          style: {
            strokeColor: "rgba(173, 216, 230, 0.8)",
            lineWidth: 5,
          },
        });

        mapRef.current.addObject(outlinePolyline);
        mapRef.current.addObject(routePolyline);
        routePolylines.current.push(outlinePolyline, routePolyline);

        if (mapRef.current) {
          mapRef.current
            .getViewModel()
            .setLookAtData({ bounds: routePolyline.getBoundingBox() });
        }

        // console.log(`${(distance / 1000).toFixed(2)} km`)

        const originMarker = new window.H.map.Marker({
          lat: start.lat,
          lng: start.lng,
        });
        mapRef.current.addObject(originMarker);
        markers.current.push(originMarker);

        const destinationMarker = new window.H.map.Marker({
          lat: end.lat,
          lng: end.lng,
        });
        mapRef.current.addObject(destinationMarker);
        markers.current.push(destinationMarker);

        setPath(routeLine.getLatLngAltArray());
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

  useEffect(() => {
    let intervalId;
    if (isMoving && path.length > 0 && mapRef.current) {
      intervalId = setInterval(() => {
        if (stepIndex < path.length - 2) {
          const lat = path[stepIndex];
          const lng = path[stepIndex + 1];
          setPosition({ lat, lng });
          setStepIndex((prevIndex) => prevIndex + 90); // điều chỉnh kích thước lộ trình

          if (movingMarker.current) {
            mapRef.current.removeObject(movingMarker.current);
          }
          movingMarker.current = new window.H.map.Marker({ lat, lng: lng });
          mapRef.current.addObject(movingMarker.current);
          mapRef.current.setCenter({ lat, lng: lng });

          // cập nhật thời gian
          setElapsedTime((prevTime) => prevTime + 1);
        } else {
          setIsMoving(false);
          clearInterval(intervalId);
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isMoving, stepIndex, path]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{`Route list by driver ${fullNameUser}`}</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <div
          id="mapContainer"
          style={{ width: "100%", height: "500px" }}
          className="rounded-lg shadow-lg"
        ></div>

        <table className="w-full rounded-lg text-left text-sm font-normal text-black dark:text-black rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-black dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {[
                "Start",
                "End",
                "Time",
                "Distance",
                "License Plate",
                "Status",
                "Action",
              ].map((header) => (
                <th key={header} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr
                key={route.routeId}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-white dark:hover:bg-gray-200"
              >
                <td className="px-6 py-4">
                  {route.startAddress?.label || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {route.endAddress?.label || "N/A"}
                </td>

                <td className="px-6 py-4">{formatTime(route.totalTime)}</td>
                <td className="px-6 py-4">{convertM(route.totalDistance)}</td>
                <td className="px-6 py-4">{route.vehicle.licensePlate}</td>
                <td className="px-6 py-4">
                  {route.status === true ? "Complete" : "No Complete"}
                </td>
                <td className="px-2 py-4">
                  <Button
                    type="link"
                    onClick={() => handleViewDetails(route.routeId)}
                  >
                    Detail
                  </Button>
                  <Button
                    type="link"
                    onClick={() => handleViewDetailsInMap(route.routeId)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        width={950}
      >
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-200 p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "From",
                      "To",
                      "Distance",
                      "Time Waypoint",
                      "Estimate Time",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-start text-xs font-medium text-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {wayPoints.map(
                    (wayPoint, index) =>
                      index < wayPoints.length - 1 && (
                        <tr
                          key={wayPoint.waypointId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {wayPoint.address.label}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {wayPoints[index + 1].address.label}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {interconnect[index]
                              ? convertM(interconnect[index].distance)
                              : ""}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {interconnect[index]
                              ? formatTime(interconnect[index].timeWaypoint)
                              : ""}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {interconnect[index]
                              ? formatTime(interconnect[index].timeEstimate)
                              : ""}
                          </td>
                        </tr>
                      ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
