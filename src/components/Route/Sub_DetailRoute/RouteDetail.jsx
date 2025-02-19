import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  getWayPoint,
  getInterConnections,
  updateEstimateTime,
} from "../../services/apiRequest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Swal from "sweetalert2";
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from "../../components/ui/timeline";

const RouteItem = ({
  routeId,
  loading,
  totalTime,
  totalDistance,
  start,
  licensePlate,
  status,
  end,
  first_name,
}) => {
  const [timeByInterconnection, setTimeByInterconnection] = useState({});
  const [interconnect, setInterconnect] = useState([]);
  const [wayPoints, setWayPoints] = useState([]);
  const apiKey = import.meta.env.VITE_HERE_MAP_API_KEY;

  function convertM(distance) {
    return `${(distance / 1000).toFixed(1)} km`;
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `about ${hours}h ${minutes}m`;
  };


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

      const payload = {
        routeId: id,
        hours: time.hours || 0,
        minutes: time.minutes || 0,
      };

      const timeE = payload.hours * 3600 + payload.minutes * 60;


      //Kiểm tra estimate vs timepoint => chuyển đổi về (s)
      const interconnection = interconnect.find(
        (item) => item.interconnectionId === id
      );

      console.log("interconnection :", interconnection)
      if (interconnection && (timeE - interconnection.timeWaypoint)>=1800) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Your estimated time should not exceed 30 minutes with Time Waypoint (Currently exceeding approx ${formatTime((timeE - interconnection.timeWaypoint)-1740)})`,
        });
        return;
      }
      else if (interconnection && timeE === 0 ) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: `You must enter an estimated time.`,
        });
        return;
      }
      else if (interconnection && timeE  <= ((interconnection.timeWaypoint) - 900))  {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Your estimated time should not be late 15 minutes with Time Waypoint (Currently lated approx ${formatTime(-(timeE - interconnection.timeWaypoint))})`,
        });
        return;
      }


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
    const fetchData = async (id) => {
      try {
        const response = await getInterConnections(id);
        setInterconnect(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(routeId);
  }, [getInterConnections]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="item-1"
        className="cursor-pointer rounded-lg border-2 bg-white px-2 no-underline hover:border-blue-400 hover:bg-slate-100"
      >
        <AccordionTrigger className="no-underline">
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between">
              <div className="flex flex-col text-start">
                <p>{first_name}</p>
                <p className="text-[0.8vw]">Start: {start}</p>
                <p className="text-[0.8vw]">End: {end}</p>
              </div>
              <p className="text-[0.8vw] font-extrabold text-blue-600">
                {status === "false" ? "INACTIVE" : "ACTIVE"}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-start text-[0.8vw] text-gray-500">
                <p className=" "> Distance : {convertM(totalDistance)}</p>
                <p className=""> Time : {formatTime(totalTime)}</p>
                <p className=""> License Plate : {licensePlate}</p>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Timeline>
            {wayPoints.slice(0, -1).map((route, index) => (
              <TimelineItem
                key={index}
                className="text-start"
              >
                <TimelineHeader>
                  <TimelineTitle>
                    {route.locationName} -{" "}
                    {wayPoints[index + 1].locationName}{" "}
                  </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                  Distance:{" "}
                  {interconnect[index]
                    ? convertM(interconnect[index].distance)
                    : ""}
                </TimelineDescription>
                <TimelineDescription>
                  Time Waypoint:{" "}
                  {interconnect[index]
                    ? formatTime(interconnect[index].timeWaypoint)
                    : ""}
                </TimelineDescription>
                <TimelineDescription>
                  Time Estimate:{" "}
                  {interconnect[index]
                    ? formatTime(interconnect[index].timeEstimate)
                    : ""}
                </TimelineDescription>
                <TimelineDescription>
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
                        handleChange(e, interconnect[index]?.interconnectionId)
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
                        handleChange(e, interconnect[index]?.interconnectionId)
                      } 
                      placeholder="MM"
                      className="w-12 rounded border border-gray-300 px-2 py-2 text-center"
                      min="0"
                      max="59"
                    />
                    <button
                      onClick={() =>
                        handleUpdate(interconnect[index]?.interconnectionId)
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
                </TimelineDescription>
              </TimelineItem>
            ))}
          </Timeline>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RouteItem;
