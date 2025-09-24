import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Calendar } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";

export interface IncomeStreamData {
  id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly";
  lastPaidDate: Date;
}

interface IncomeStreamProps {
  stream: IncomeStreamData;
  onEdit: (stream: IncomeStreamData) => void;
  onDelete: (id: string) => void;
}

export const IncomeStream = ({ stream, onEdit, onDelete }: IncomeStreamProps) => {
  // Calculate next pay date based on frequency
  const getNextPayDate = (lastPaid: Date, frequency: string): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today for comparison
    
    // Create a new date from lastPaid to avoid timezone issues
    let nextPayDate = new Date(lastPaid.getTime());
    
    // Add the appropriate interval
    switch (frequency) {
      case "weekly":
        nextPayDate = addDays(nextPayDate, 7);
        break;
      case "biweekly":
        nextPayDate = addDays(nextPayDate, 14);
        break;
      case "monthly":
        nextPayDate = addMonths(nextPayDate, 1);
        break;
      default:
        nextPayDate = addMonths(nextPayDate, 1);
    }
    
    // If the calculated date is still in the past, keep adding intervals
    while (nextPayDate <= today) {
      switch (frequency) {
        case "weekly":
          nextPayDate = addDays(nextPayDate, 7);
          break;
        case "biweekly":
          nextPayDate = addDays(nextPayDate, 14);
          break;
        case "monthly":
          nextPayDate = addMonths(nextPayDate, 1);
          break;
        default:
          nextPayDate = addMonths(nextPayDate, 1);
      }
    }
    
    return nextPayDate;
  };

  const nextPayDate = getNextPayDate(stream.lastPaidDate, stream.frequency);
  const isUpcoming = nextPayDate.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000; // Within 7 days

  return (
    <Card className="p-4 shadow-card hover:shadow-soft transition-all duration-300 border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-lg">{stream.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-income text-lg">
              ${stream.amount.toLocaleString()}
            </span>
            <span className="capitalize">{stream.frequency}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Next: {format(nextPayDate, "MMM dd, yyyy")}
            </span>
            {isUpcoming && (
              <span className="text-xs bg-income/20 text-income px-2 py-1 rounded-full font-medium">
                Upcoming
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(stream)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Edit3 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(stream.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};