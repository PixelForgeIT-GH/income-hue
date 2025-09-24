import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { IncomeStreamData } from "./IncomeStream";
import { addDays, addMonths, isSameDay, startOfMonth, endOfMonth, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";

interface PaydayCalendarProps {
  streams: IncomeStreamData[];
}

export const PaydayCalendar = ({ streams }: PaydayCalendarProps) => {
  // Calculate all paydays for the calendar's visible range (current month + 2 months before/after)
  const getPaydaysInRange = (startDate: Date, endDate: Date) => {
    const paydays: Date[] = [];
    
    streams.forEach((stream) => {
      let currentDate = new Date(stream.lastPaidDate);
      
      // Go back to ensure we capture all paydays in the visible range
      // Start from a date well before the range to catch all occurrences
      let searchStartDate = new Date(startDate);
      searchStartDate.setMonth(searchStartDate.getMonth() - 6); // Go back 6 months to be safe
      
      // Find paydays starting from well before our range
      while (currentDate > searchStartDate) {
        switch (stream.frequency) {
          case "weekly":
            currentDate = addDays(currentDate, -7);
            break;
          case "biweekly":
            currentDate = addDays(currentDate, -14);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, -1);
            break;
          case "yearly":
            currentDate = addMonths(currentDate, -1);
            break;
        }
      }
      
      // Now move forward and collect all paydays within our range
      while (currentDate <= endDate) {
        if (currentDate >= startDate) {
          paydays.push(new Date(currentDate));
        }
        
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
          case "yearly":
            currentDate = addMonths(currentDate, 1); // For yearly salary, show monthly paydays
            break;
        }
      }
    });
    
    return paydays;
  };

  // Calculate range to cover the calendar's visible months
  const today = new Date();
  const rangeStart = new Date(today.getFullYear(), today.getMonth() - 2, 1); // 2 months before current month
  const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 4, 0); // 3 months after current month
  const paydays = getPaydaysInRange(rangeStart, rangeEnd);

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
            payday: "relative border-2 border-income rounded-full bg-income/10"
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Circles indicate paydays from your income streams
        </p>
      </div>
    </Card>
  );
};