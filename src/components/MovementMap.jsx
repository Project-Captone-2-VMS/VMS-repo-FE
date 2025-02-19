import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getInterConnections, updateActualTime } from "../services/apiRequest";

const MovementMap = () => {
  const [position, setPosition] = useState({ lat: 10.8231, lng: 106.6297 });
  const [isMoving, setIsMoving] = useState(false);
  const [path, setPath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });
  const [elapsedTime, setElapsedTime] = useState(0);
  const markers = useRef([]);
  const routePolylines = useRef([]);
  const movingMarker = useRef(null);
  const mapRef = useRef(null);
  const token = localStorage.getItem("jwtToken");
  const routeId = "1";
  const [waypoints, setWaypoints] = useState([]);
  const [interConnections, setInterConnections] = useState([]);

  const [startPoint, setStartPoint] = useState({ lat: "", lng: "" });
  const [endPoint, setEndPoint] = useState({ lat: "", lng: "" });

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
          center: { lat: position.lat, lng: position.lng },
          zoom: 13,
        }
      );
      const behavior = new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(mapInstance)
      );
      const ui = window.H.ui.UI.createDefault(mapInstance, defaultLayers);
      mapRef.current = mapInstance;

      mapInstance.addEventListener("resize", () =>
        mapInstance.getViewPort().resize()
      );
    }
  }, []);

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
        }
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

        const distance = section.summary.length;
        const duration = section.summary.duration;

        setRouteInfo({
          distance: `${(distance / 1000).toFixed(2)} km`,
          duration: `${Math.floor(duration / 60)} minutes`,
        });

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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `About ${hours}h ${minutes}m`;
  };

  const startMovement = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/waypoint/route/${routeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const waypointsData = response.data;
      setWaypoints(waypointsData);

      if (!waypointsData || waypointsData.length < 2) {
        console.log("Không đủ waypoints để xác định điểm đầu và điểm cuối");
        return;
      }

      // Di chuyển tuần tự qua các cặp waypoints
      let i = 0;

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
            }
          );
          const route = response.data.routes[0];
          const section = route.sections[0];
          const distance = section.summary.length; //Quảng đường ước tính đơn vị m
          const travelTime = ((distance / 100) * 100).toFixed(0); //Dựa vào quảng đường ước tính đi để tính ra thời gian fake 0,1s sẽ là 100m
          console.log(travelTime);
          const s = (distance / 1000).toFixed(2); //Quảng đường ước tính đơn vị km
          console.log(s);
          const v = 45; //Vân tốc dự tính một xe đi trung bình là 45km/h
          console.log(`${((s / v) * 60).toFixed(2)} m`);
          const t = Math.ceil((s / v) * 3600);
          console.log(t);

          const resInterConnections = await getInterConnections(routeId);
          const interData = resInterConnections;
          setInterConnections(interData);
          const idInter = interData[i].interconnectionId;
          const timeWaypoint = interData[i].timeWaypoint;
          console.log(timeWaypoint);
          const formDataInter = {
            timeActual: t,
          };

          await updateActualTime(idInter, formDataInter);

          // Cập nhật vị trí hiện tại
          setPosition({ lat: waypointsData[i].lat, lng: waypointsData[i].lng });
          setIsMoving(true);
          setStepIndex(0);
          setElapsedTime(0);

          if (i === 0) {
            alert("Bắt đầu chặng 1");
          } else {
            alert("Bắt đầu chặng " + (i + 1));
          }

          // Tăng chỉ số lên và di chuyển tới waypoint tiếp theo sau khi hoàn thành
          i++;

          // Đợi cho đến khi di chuyển xong waypoint hiện tại mới tiếp tục
          setTimeout(moveToNextWaypoint, travelTime); // 3 giây để di chuyển sang waypoint tiếp theo (có thể thay đổi thời gian)
        } else {
          setIsMoving(false); // Khi hết waypoint thì kết thúc di chuyển
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">GPS Movement with HERE Map</h2>
      <div className="mb-4">
        <button
          onClick={startMovement}
          disabled={isMoving || loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isMoving
            ? "Movement Started"
            : loading
            ? "Loading..."
            : "Start GPS Movement"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {routeInfo.distance && routeInfo.duration && (
        <div className="mb-4">
          <p>Distance: {routeInfo.distance}</p>
          <p>Estimated Duration: {routeInfo.duration}</p>
        </div>
      )}
      {/* Display elapsed time */}
      {isMoving && (
        <div className="mb-4">
          <p>Elapsed Time: {elapsedTime} seconds</p>
        </div>
      )}
      <div
        id="mapContainer"
        style={{ width: "100%", height: "500px" }}
        className="rounded-lg shadow-lg"
      ></div>
    </div>
  );
};

export default MovementMap;
