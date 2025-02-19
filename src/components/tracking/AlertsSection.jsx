import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const AlertsSection = ({ trucks }) => (
  <Card className="bg-red-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="w-5 h-5" />
        Delay Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      {trucks
        .filter((truck) => truck.delayStatus === "delayed")
        .map((truck) => (
          <Alert key={truck.id} variant="destructive" className="mb-2">
            <AlertTitle className="font-semibold">{truck.name}</AlertTitle>
            <AlertDescription>
              Delayed by {truck.delayDuration} minutes at {truck.currentStop}
            </AlertDescription>
          </Alert>
        ))}
    </CardContent>
  </Card>
);
