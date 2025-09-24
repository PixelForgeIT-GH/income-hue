import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { IncomeStreamData } from "./IncomeStream";
import { addDays, addMonths, isSameDay, startOfMonth, endOfMonth, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";

interface PaydayCalendarProps {
  streams: IncomeStreamData[];
}

export const PaydayCalendar = ({ streams }: PaydayCalendarProps) => {
  // Calculate all paydays for the next 3 months
  const getPaydaysInRange = (startDate: Date, endDate: Date) => {
    const paydays: Date[] = [];
    
    streams.forEach((stream) => {
      let currentDate = new Date(stream.lastPaidDate);
      
      // Find the first payday on or after startDate
      while (currentDate < startDate) {
        switch (stream.frequency) {
          case "weekly":
            currentDate = addDays(currentDate, 7);
            break;
          case "biweekly":
            currentDate = addDays(currentDate, 14);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
        }
      }
      
      // Add all paydays within range (including the first one we found)
      while (currentDate <= endDate) {
        paydays.push(new Date(currentDate));
        
        switch (stream.frequency) {
          case "weekly":
            currentDate = addDays(currentDate, 7);
            break;
          case "biweekly":
            currentDate = addDays(currentDate, 14);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
        }
      }
    });
    
    return paydays;
  };

  const today = new Date();
  const rangeEnd = addMonths(today, 3);
  const paydays = getPaydaysInRange(today, rangeEnd);

  return (
    <Card className="p-6 shadow-card border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">Payday Calendar</h3>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative",
              "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            ),
          }}
          modifiers={{
            payday: (date) => paydays.some(payday => isSameDay(date, payday))
          }}
          modifiersClassNames={{
            payday: "relative border-2 border-red-500 rounded-full"
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Red circles indicate upcoming paydays
        </p>
      </div>
    </Card>
  );
};