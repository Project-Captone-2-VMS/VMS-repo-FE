import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
// import "./HereMapComponent.css";

const Map = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });
  const [suggestions, setSuggestions] = useState([]);
  const routePolylines = useRef([]);
  const markers = useRef([]);
  const [textareaValue, setTextareaValue] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);

  const apiKey = "jlBGGMAGg54YwZpieijupQwJpNMeGd9uwXDfRbjf-ag";

  useEffect(() => {
    const platformInstance = new H.service.Platform({ apikey: apiKey });
    const defaultLayers = platformInstance.createDefaultLayers();
    const mapInstance = new H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 52.5308, lng: 13.3847 },
        zoom: 14,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    const behavior = new H.mapevents.Behavior(
      new H.mapevents.MapEvents(mapInstance)
    );
    H.ui.UI.createDefault(mapInstance, defaultLayers);
    setMap(mapInstance);

    const setUpClickListener = (map) => {
      map.addEventListener("tap", function (evt) {
        const coord = map.screenToGeo(
          evt.currentPointer.viewportX,
          evt.currentPointer.viewportY
        );
        const clickedMarker = new H.map.Marker({
          lat: coord.lat,
          lng: coord.lng,
        });
        map.addObject(clickedMarker);
        markers.current.push(clickedMarker);

        const coordinatesText = `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(
          4
        )}`;
        setTextareaValue((prev) => prev + coordinatesText + "\n");
        setSelectedCoordinates((prev) => [
          ...prev,
          { lat: coord.lat, lng: coord.lng },
        ]);
      });
    };

    setUpClickListener(mapInstance);

    return () => {
      mapInstance.dispose();
    };
  }, [apiKey]);

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
      const matches = line.match(
        /([-+]?[0-9]*\.?[0-9]+),\s*([-+]?[0-9]*\.?[0-9]+)/
      );
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
    try {
      const response = await axios.get(
        "https://geocode.search.hereapi.com/v1/geocode",
        {
          params: {
            q: address,
            apikey: apiKey,
          },
        }
      );
      if (response.data.items.length > 0) {
        return response.data.items[0].position;
      } else {
        throw new Error("No location found");
      }
    } catch (error) {
      console.error("Geocode error:", error.message);
      throw error;
    }
  };

  const fetchRoute = async (originCoords, destinationCoords) => {
    setLoading(true);
    try {
      routePolylines.current.forEach((polyline) => {
        map.removeObject(polyline);
      });
      routePolylines.current = [];
      markers.current.forEach((marker) => {
        map.removeObject(marker);
      });
      markers.current = [];

      const response = await axios.get("http://localhost:8080/route", {
        params: {
          originLat: originCoords.lat,
          originLng: originCoords.lng,
          destinationLat: destinationCoords.lat,
          destinationLng: destinationCoords.lng,
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const section = route.sections[0];
        const polylineData = section.polyline;
        const routeLine = H.geo.LineString.fromFlexiblePolyline(polylineData);
        const outlinePolyline = new H.map.Polyline(routeLine, {
          style: { strokeColor: "gray", lineWidth: 8 },
        });
        const routePolyline = new H.map.Polyline(routeLine, {
          style: { strokeColor: "rgba(173, 216, 230, 0.8)", lineWidth: 5 },
        });

        map.addObject(outlinePolyline);
        map.addObject(routePolyline);
        routePolylines.current.push(outlinePolyline, routePolyline);

        if (map) {
          map
            .getViewModel()
            .setLookAtData({ bounds: routePolyline.getBoundingBox() });
        }

        const distance = section.summary.length;
        const duration = section.summary.duration;

        setRouteInfo({ distance, duration });

        const originMarker = new H.map.Marker({
          lat: originCoords.lat,
          lng: originCoords.lng,
        });
        map.addObject(originMarker);
        markers.current.push(originMarker);

        const destinationMarker = new H.map.Marker({
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        });
        map.addObject(destinationMarker);
        markers.current.push(destinationMarker);
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

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:8080/search-suggestions",
        {
          params: {
            query,
            lat: 52.5308,
            lng: 13.3847,
          },
        }
      );
      setSuggestions(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  };

  const findSequence = async () => {
    if (selectedCoordinates.length < 2) {
      setError("Please select at least two points.");
      return;
    }

    try {
      const originCoords = await geocode(origin);
      const destinationCoords = await geocode(destination);
      const intermediatePoints = selectedCoordinates;

      const destinations = intermediatePoints
        .map((coord) => `${coord.lat},${coord.lng}`)
        .join(",");

      const params = {
        startLat: originCoords.lat,
        startLng: originCoords.lng,
        destinations: destinations,
        endLat: destinationCoords.lat,
        endLng: destinationCoords.lng,
      };

      const headers = {
        Authorization: `Bearer  eyJhbGciOiJSUzUxMiIsImN0eSI6IkpXVCIsImlzcyI6IkhFUkUiLCJhaWQiOiJZcDgxNk96UkI4M1BWTHM5UzZYZiIsImlhdCI6MTczMDk5MjM1MSwiZXhwIjoxNzMxMDc4NzUxLCJraWQiOiJqMSJ9.ZXlKaGJHY2lPaUprYVhJaUxDSmxibU1pT2lKQk1qVTJRMEpETFVoVE5URXlJbjAuLjcyeFN6anVVem42TDBiMThvOHRNM0EuTHNsRzNRU2dtZUJiM2VYdHZXRWRaT1pYa19xTDhkTG9BT2R4WWJmRXFLbXE5QlBJRjloSzN5ZGx3THU5ZU1xMVgyeTRXOXE3SUQ1R2VKZl9fSFB5OUVaNnZyYTAwZktORnNQd2w1QXVNZFdidXhPOWZTU2gtVjNzWWhHekV2cXB3bklYMnBtQUg3YV91NGQ2S2J1LURlSk0yeDlveVNsYks1Y1h2aVJZZUhFLmkyQ0w2RkRGUkk0c2hLZW9FODVCSHZPLVlReGY2VFJwejJPclZmbWZ1ZEk.SoG2xAly9ZnCDODbE-eaSTn7CxmpGZi83qrqMiZWQ0I4r1IvpMB74P0m9H9Jbu7ilm5kfwglSL87UbdJIIt9LtioCbZsEQECmNSGfxDG5Tm0k7CZTWJ1ZxEdyEUA8y5GW8sntTW86QaGeRpfLtDH2LAPp-MiLjkJzua9dzZzakFlsTkOm8U_cKTwQAuog7xdFD-ikTiJQp9NqlEPF1eYiXISKNCGim8n6SKxPDpexgGD9fqxv5lc1gmAJSko74D494DjQyXAX3rpgd1d8bV6_NXUZLb6w11DJxPXbihi91ch0ffU7Tx6hFLg5u_wemQZlzEIAebXcB6TWFqmvaXUfA`,
      };

      const response = await axios.get("http://localhost:8080/find-sequence", {
        params,
        headers,
      });

      const results = response.data;
    } catch (error) {
      console.error("Failed to fetch sequence:", error);
      setError("Failed to fetch sequence. Please try again later.");
    }
  };

  return (
    <div className="flex">
      <div
        className="map-container"
        style={{ width: "100%", height: "500px" }}
        ref={mapRef}
      ></div>
    </div>
  );
};

export default Map;
