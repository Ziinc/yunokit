
import type { ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface MapFieldProps {
  id: string;
  name: string;
  value: { lat: number; lng: number } | undefined;
  onChange: (value: { lat: number; lng: number }) => void;
  description?: string;
  mapConfig?: {
    defaultZoom?: number;
    defaultCenter?: [number, number]; // [latitude, longitude]
  };
}

export const MapField = ({
  id,
  name,
  value,
  onChange,
  description,
  mapConfig,
}: MapFieldProps) => {
  const defaultValue = value || {
    lat: mapConfig?.defaultCenter?.[0] || 40.7128,
    lng: mapConfig?.defaultCenter?.[1] || -74.0060,
  };

  const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) {
      onChange({ ...defaultValue, lat });
    }
  };

  const handleLngChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) {
      onChange({ ...defaultValue, lng });
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{name}</Label>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="w-1/2">
            <Label htmlFor={`${id}-lat`} className="text-xs">Latitude</Label>
            <Input
              id={`${id}-lat`}
              value={defaultValue.lat.toString()}
              onChange={handleLatChange}
              type="number"
              step="0.000001"
            />
          </div>
          <div className="w-1/2">
            <Label htmlFor={`${id}-lng`} className="text-xs">Longitude</Label>
            <Input
              id={`${id}-lng`}
              value={defaultValue.lng.toString()}
              onChange={handleLngChange}
              type="number"
              step="0.000001"
            />
          </div>
        </div>
        
        <Card className="aspect-video bg-muted relative flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Map preview would appear here</p>
            <p className="text-xs mt-1">Lat: {defaultValue.lat.toFixed(6)}, Lng: {defaultValue.lng.toFixed(6)}</p>
          </div>
        </Card>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default MapField;
