import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ETAStatus } from "../tracking/ETAStatus";
import { DeliveryTimeline } from "./DeliveryTimeline";

export const TimelineSection = ({ selectedTruck }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Delivery Timeline
      </CardTitle>
    </CardHeader>
    <CardContent>
      {selectedTruck ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                Route: {selectedTruck.route}
              </h3>
              <p className="text-sm text-gray-500">
                Current Stop: {selectedTruck.currentStop}
              </p>
            </div>
            <ETAStatus
              status={selectedTruck.delayStatus}
              delay={selectedTruck.delayDuration}
            />
          </div>
          <DeliveryTimeline stops={selectedTruck.stops} />
        </div>
      ) : (
        <p className="text-gray-500">
          Select a vehicle to view delivery timeline
        </p>
      )}
    </CardContent>
  </Card>
);
