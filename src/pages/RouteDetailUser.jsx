import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Modal } from "antd";

import RouteItem from "@/components/RouteDetail/RouteItem";

import {
  getRouteById,
  getWayPoint,
  updateEstimateTime,
  getInterConnections,
  getRouteByUserName,
  updateActualTime,
  updateRoute,
} from "../../src/services/apiRequest";
import axios from "axios";
import Swal from "sweetalert2";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { button } from "@material-tailwind/react";

const RouteDetailUser = () => {
  const [position, setPosition] = useState({ lat: 10.8231, lng: 106.6297 });
  const [routes, setRoutes] = useState([]);

  const [wayPoints, setWayPoints] = useState([]);
  const [interconnect, setInterconnect] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const routePolylines = useRef([]);
  const movingMarker = useRef(null);
  const markers = useRef([]);
  const mapRef = useRef(null);
  const usernameLocal = localStorage.getItem("username");
  const token = localStorage.getItem("jwtToken");
  const [interConnections, setInterConnections] = useState([]);
  const [mapWayPoints, setMapWayPoints] = useState([]);
  const [mapInter, setMapInters] = useState([]);
  const [timeByInterconnection, setTimeByInterconnection] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [path, setPath] = useState([]);
  const [startPoint, setStartPoint] = useState({ lat: "", lng: "" });
  const [endPoint, setEndPoint] = useState({ lat: "", lng: "" });
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

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
  function convertM(distance) {
    return `${(distance / 1000).toFixed(1)} km`;
  }
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
          center: position,
          zoom: 10,
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
      setWayPoints(res);

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
    
        let label = `Waypoint ${index}: (${wayPoint.lat.toFixed(
          4,
        )}, ${wayPoint.lng.toFixed(4)})`;
        if (index === 0) {
          label = `Start: (${wayPoint.lat.toFixed(4)}, ${wayPoint.lng.toFixed(
            4,
          )})`;
        } else if (index === res.length - 1) {
          label = `End: (${wayPoint.lat.toFixed(4)}, ${wayPoint.lng.toFixed(
            4,
          )})`;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listRouteTracking = await getRouteByUserName(usernameLocal);
        setRoutes(listRouteTracking);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [usernameLocal]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `about ${hours}h ${minutes}m`;
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
          // const v = 50; //Vân tốc dự tính một xe đi trung bình là 50km/h

          let velocity;
          while (!velocity) {
            const result = await Swal.fire({
              title: `Enter the speed for the leg ${i + 1}`,
              input: "number",
              inputLabel: "Velocity ​​(km/h)",
              inputPlaceholder: "Enter velocity",
              inputAttributes: {
                min: 1,
                step: 1,
              },
              showCancelButton: true,
              validationMessage: "The value must be greater than or equal to 1."
            });

            if (result.isDismissed) {
              console.log(
                "User cancels speed entry. Default velocity set to 45 km/h.",
              );
              velocity = 50; // Giá trị mặc định
              break;
            }

            velocity = parseFloat(result.value);

            if (velocity < 0) {
              await Swal.fire({
                icon: "error",
                title: "Invalid velocity",
                text: "Velocity cannot be negative. Please enter a valid velocity.",
              });
              velocity = null; // Yêu cầu nhập lại
            } else if (velocity > 90) {
              await Swal.fire({
                icon: "error",
                title: "Velocity must not exceed 90 km/h",
                text: "Please enter a valid velocity.",
              });
              velocity = null; // Yêu cầu nhập lại
            }
          }

          console.log("V", velocity);
          const t = Math.ceil((s / velocity) * 3600);

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
              title: "The leg 1",
              timer: 5000,
              showConfirmButton: false,
              showCloseButton: true,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              title: "Start the leg " + (i + 1),
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

          const formSend = {
            title: "You have a new notification about successful delivery",
            content: `The vehicle with license plate number ${
              getRoute.vehicle.licensePlate
            } driven by driver ${getRoute.driver.firstName} ${
              getRoute.driver.lastName
            } complete the shipment`,
            type: "USER",
          };
          sentNoti(formSend);
          await updateRoute(id);
          window.location.reload();
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
  // console.log("routes", routes);

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex w-1/4 flex-col gap-2 rounded-lg border-2 bg-white">
          <div className="flex justify-between rounded-t-lg border-b-2 bg-gray-100 px-4 py-2">
            <p>List Route </p>
          </div>
          <div className="w-full">
          <button
              type="link"
              onClick={() => handleViewDetailsInMap(route.routeId)}
              className="px-2"
            >
            {routes.map((route) => (
          
                <RouteItem
                  key={route.routeId}
                  routeId={route.routeId}
                  loading={loading}
                  totalTime={route.totalTime}
                  totalDistance={route.totalDistance}
                  start={route.startLocationName}
                  end={route.endLocationName}
                  licensePlate={route.vehicle.licensePlate}
                  interconnect={interconnect}
                  status={route.status}
                />
            
            ))}
            </button>
          </div>
          
        </div>

        <div className="w-3/4 rounded-lg border-2 bg-white">
          <div className="mb-2">
            <table className="w-full rounded-lg text-left text-sm font-normal text-black dark:text-black rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-black dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="mb-2 flex justify-between rounded-t-lg border-b-2 bg-gray-100 px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.routeId} className="border-2 bg-white">
                    <td>
                      <Button
                        type="link"
                        onClick={() => handleViewDetailsInMap(route.routeId)}
                        className="w-1/2 border border-gray-700 py-4"
                      >
                        View
                      </Button>
                      <Button
                        type="link"
                        onClick={() => startMovement(route.routeId)}
                        className="w-1/2 border border-gray-700 py-4"
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

          <div className="px-4 text-sm font-bold">
            <div
              id="mapContainer" 
              style={{ width: "100%", height: "500px" }}
              className ="lg:w-full lg:h-[500px]"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailUser;
