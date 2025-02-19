export const DeliveryTimeline = ({ stops }) => {
  return (
    <div className="space-y-4">
      {stops.map((stop, index) => (
        <div key={index} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                stop.status === "completed"
                  ? "bg-green-500"
                  : stop.status === "current"
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            />
            {index < stops.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 absolute top-3" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{stop.location}</div>
                <div className="text-sm text-gray-500">
                  Planned: {stop.plannedTime}
                </div>
                {stop.actualTime && (
                  <div className="text-sm text-gray-500">
                    Actual: {stop.actualTime}
                  </div>
                )}
              </div>
              {stop.delay !== null && (
                <div
                  className={`text-sm font-medium ${
                    stop.delay > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {stop.delay > 0 ? `+${stop.delay} min` : "On time"}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
