import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const MapSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Live Map
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Map will be displayed here</p>
      </div>
    </CardContent>
  </Card>
);
