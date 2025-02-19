import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ETAStatus } from "../tracking/ETAStatus";

export const VehicleList = ({ trucks, selectedTruck, onSelectTruck }) => (
  <Card>
    <CardHeader>
      <CardTitle>Vehicle List</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {trucks.map((truck) => (
          <div
            key={truck.id}
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              selectedTruck?.id === truck.id ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => onSelectTruck(truck)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck
                  className={`${
                    truck.delayStatus === "ontime"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span className="font-semibold">{truck.name}</span>
              </div>
              <ETAStatus
                status={truck.delayStatus}
                delay={truck.delayDuration}
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>Current Stop: {truck.currentStop}</p>
              <p>ETA: {truck.estimatedArrival}</p>
              <p>Driver: {truck.driver}</p>
              <p>Phone: {truck.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
