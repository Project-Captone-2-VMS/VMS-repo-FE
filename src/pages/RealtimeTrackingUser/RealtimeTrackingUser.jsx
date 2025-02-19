import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Modal } from "antd";

import {
  getRouteById,
  getWayPoint,
  updateEstimateTime,
  getInterConnections,
  getRouteByUserName,
  updateActualTime,
  updateRoute,
} from "../../services/apiRequest";

import axios from "axios";
import Swal from "sweetalert2";
import { over } from "stompjs";
import SockJS from "sockjs-client";

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
  let socket = null;
  let stompClient = null;

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

  const handleUpdate = async (id) => {
    try {
      const time = timeByInterconnection[id] || {
        hours: 0,
        minutes: 0,
      };

      console.log(timeByInterconnection);

      const payload = {
        routeId: id,
        hours: time.hours || 0,
        minutes: time.minutes || 0,
      };

      const timeE = payload.hours * 3600 + payload.minutes * 60;
      const formData = {
        timeEstimate: timeE,
      };

      const res = await updateEstimateTime(payload.routeId, formData);
      setInterconnect((prev) =>
        prev.map((item) =>
          item.interconnectionId === id
            ? { ...item, timeEstimate: timeE }
            : item,
        ),
      );

      if (res != null) {
        Swal.fire("Success!", "Time updated successfully.", "success");
      }

      setTimeByInterconnection((prevTime) => {
        return {
          ...prevTime,
          [id]: { hours: 0, minutes: 0 },
        };
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật thời gian:", error);
    }
  };

  useEffect(() => {
    if (window.H && !mapRef.current) {
      const platform = new window.H.service.Platform({
        apikey: "ZQAqfjj5fxNGAZxkQqTnqyX4jz5AUJ6Nul0AJDuYbrg",
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
    const fetchData = async () => {
      try {
        const listRoute = await getRouteByUserName(usernameLocal);
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

  const startMovement = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/waypoint/route/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const waypointsData = response.data;
      setWayPoints(waypointsData);

      if (!waypointsData || waypointsData.length < 2) {
        console.log("Không đủ waypoints để xác định điểm đầu và điểm cuối");
        return;
      }

      // Di chuyển tuần tự qua các cặp waypoints
      let i = 0;

      const getRoute = await getRouteById(id);
      console.log(getRoute.vehicle.licensePlate);
      console.log(getRoute.driver.firstName + " " + getRoute.driver.lastName);

      // Hàm di chuyển tới waypoint tiếp theo
      const moveToNextWaypoint = async () => {
        if (i < waypointsData.length - 1) {
          setStartPoint({
            lat: waypointsData[i].lat,
            lng: waypointsData[i].lng,
          });

          setEndPoint({
            lat: waypointsData[i + 1].lat,
            lng: waypointsData[i + 1].lng,
          });

          // Lấy lộ trình giữa 2 điểm và cập nhật bản đồ
          await fetchRoute(waypointsData[i], waypointsData[i + 1]);

          const response = await axios.get(
            "http://localhost:8080/api/route/findRoute",
            {
              params: {
                originLat: waypointsData[i].lat,
                originLng: waypointsData[i].lng,
                destinationLat: waypointsData[i + 1].lat,
                destinationLng: waypointsData[i + 1].lng,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const route = response.data.routes[0];
          const section = route.sections[0];
          const distance = section.summary.length; //Quảng đường ước tính đơn vị m
          const travelTime = ((distance / 100) * 100).toFixed(0); //Dựa vào quảng đường ước tính đi để tính ra thời gian fake 0,1s sẽ là 100m
          const s = (distance / 1000).toFixed(2); //Quảng đường ước tính đơn vị km
          const v = 45; //Vân tốc dự tính một xe đi trung bình là 45km/h
          const t = Math.ceil((s / v) * 3600);

          const resInterConnections = await getInterConnections(id);
          const interData = resInterConnections;
          setInterConnections(interData);
          const idInter = interData[i].interconnectionId;
          const timeEstimate = interData[i].timeEstimate;
          const formDataInter = {
            timeActual: t,
          };

          await updateActualTime(idInter, formDataInter);

          const timeSuccessful = timeEstimate - t; //Thời gian xe đến còn dư
          const timePercent = ((t / timeEstimate) * 100).toFixed(1);

          if (timePercent > 100) {
            const formSend = {
              title: "You have a new warning",
              content: `The vehicle with license plate number ${
                getRoute.vehicle.licensePlate
              } driven by driver ${getRoute.driver.firstName} ${
                getRoute.driver.lastName
              } exceeded the estimated time ${formatTime(-timeSuccessful)}`,
              type: "ALERT",
            };
            sentNoti(formSend);
          } else if (70 < timePercent < 100) {
            const formSend = {
              title: "You have a new notification",
              content: `The vehicle with license plate ${
                getRoute.vehicle.licensePlate
              } driven by driver ${getRoute.driver.firstName} ${
                getRoute.driver.lastName
              } arrived ${formatTime(
                timeSuccessful,
              )} earlier than the expected time`,
              type: "SYSTEM",
            };
            sentNoti(formSend);
          } else {
            const formSend = {
              title: "You have a new notification",
              content: `The vehicle with license plate ${getRoute.vehicle.licensePlate} driven by driver ${getRoute.driver.firstName} ${getRoute.driver.lastName} arrived on time`,
              type: "SYSTEM",
            };
            sentNoti(formSend);
          }

          // Cập nhật vị trí hiện tại
          setPosition({ lat: waypointsData[i].lat, lng: waypointsData[i].lng });
          setIsMoving(true);
          setStepIndex(0);
          setElapsedTime(0);
          if (i === 0) {
            Swal.fire({
              title: "Bắt đầu chặng 1",
              timer: 5000,
              showConfirmButton: false,
              showCloseButton: true,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              title: "Bắt đầu chặng " + (i + 1),
              timer: 5000,
              showConfirmButton: false,
              showCloseButton: true,
              timerProgressBar: true,
            });
          }

          // Tăng chỉ số lên và di chuyển tới waypoint tiếp theo sau khi hoàn thành
          i++;

          // Đợi cho đến khi di chuyển xong waypoint hiện tại mới tiếp tục
          setTimeout(moveToNextWaypoint, travelTime); // giây để di chuyển sang waypoint tiếp theo (có thể thay đổi thời gian)
        } else {
          setIsMoving(false); // Khi hết waypoint thì kết thúc di chuyển
          Swal.fire({
            title: "DONE",
            timer: 5000,
            showConfirmButton: false,
            showCloseButton: true,
            timerProgressBar: true,
          });
          await updateRoute(id);
        }
      };

      moveToNextWaypoint(); // Bắt đầu quá trình di chuyển
    } catch (error) {
      console.log("Lỗi trong get waypoint", error);
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

  const sentNoti = async (formSend) => {
    socket = new SockJS("http://localhost:8080/ws");
    stompClient = over(socket);

    stompClient.connect({}, () => {
      stompClient.send(`/app/chat/admin123`, {}, JSON.stringify(formSend));
      // console.log("Notification Sent:", formSend);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Real-time Vehicle Tracking</h1>
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
                "Fullname Driver",
                "License Plate",
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
                <td className="px-6 py-4">{route.startAddress.label}</td>
                <td className="px-6 py-4">{route.endAddress.label}</td>
                <td className="px-6 py-4">{formatTime(route.totalTime)}</td>
                <td className="px-6 py-4">{convertM(route.totalDistance)}</td>
                <td className="px-6 py-4">{`${route.driver.firstName} ${route.driver.lastName}`}</td>
                <td className="px-6 py-4">{route.vehicle.licensePlate}</td>
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
                  <Button
                    type="link"
                    onClick={() => startMovement(route.routeId)}
                    disabled={isMoving || loading}
                  >
                    Let's go
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
                      "Your Estimate ",
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
                            {wayPoint.address?.label}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {wayPoints[index + 1]?.address?.label}
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
                          <td className="flex items-center gap-2 px-4 py-2 text-[9px] text-gray-900">
                            <input
                              type="number"
                              name="hours"
                              value={
                                timeByInterconnection[
                                  interconnect[index]?.interconnectionId
                                ]?.hours || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  interconnect[index]?.interconnectionId,
                                )
                              }
                              placeholder="HH"
                              className="w-12 rounded border border-gray-300 px-2 py-2 text-center"
                              min="0"
                              max="23"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              name="minutes"
                              value={
                                timeByInterconnection[
                                  interconnect[index]?.interconnectionId
                                ]?.minutes || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  interconnect[index]?.interconnectionId,
                                )
                              }
                              placeholder="MM"
                              className="w-12 rounded border border-gray-300 px-2 py-2 text-center"
                              min="0"
                              max="59"
                            />
                            <button
                              onClick={() =>
                                handleUpdate(
                                  interconnect[index]?.interconnectionId,
                                )
                              }
                              className={`rounded px-2 py-2 text-white ${
                                loading
                                  ? "cursor-not-allowed bg-gray-500"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              disabled={loading}
                            >
                              {loading ? "Đang cập nhật..." : "Update"}
                            </button>
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
