import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimeFieldProps {
  id: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  description?: string;
}

export const DateTimeField = ({
  id,
  name,
  value,
  onChange,
  description,
}: DateTimeFieldProps) => {
  const date = value ? new Date(value) : new Date();
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    // Keep the time from the current value
    const currentDate = value ? new Date(value) : new Date();
    newDate.setHours(currentDate.getHours());
    newDate.setMinutes(currentDate.getMinutes());
    
    onChange(newDate.toISOString());
  };
  
  const handleHourChange = (hour: string) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(parseInt(hour, 10));
    onChange(newDate.toISOString());
  };
  
  const handleMinuteChange = (minute: string) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setMinutes(parseInt(minute, 10));
    onChange(newDate.toISOString());
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{name}</Label>
      <div className="flex space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={date.getHours().toString().padStart(2, '0')} 
            onValueChange={handleHourChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <SelectItem 
                  key={hour} 
                  value={hour.toString().padStart(2, '0')}
                >
                  {hour.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>:</span>
          <Select 
            value={date.getMinutes().toString().padStart(2, '0')} 
            onValueChange={handleMinuteChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <SelectItem 
                  key={minute} 
                  value={minute.toString().padStart(2, '0')}
                >
                  {minute.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default DateTimeField;
