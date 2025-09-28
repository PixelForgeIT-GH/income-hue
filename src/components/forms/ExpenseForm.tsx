import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExpenseData } from "@/components/expenses/ExpenseItem";

interface ExpenseFormProps {
  expense?: ExpenseData;
  onSubmit: (expense: Omit<ExpenseData, "id"> & { id?: string }) => Promise<{ error: any } | undefined>;
  onCancel: () => void;
}

export const ExpenseForm = ({ expense, onSubmit, onCancel }: ExpenseFormProps) => {
  const [name, setName] = useState(expense?.name || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(expense?.frequency || "monthly");
  const [startDate, setStartDate] = useState<Date>(
    expense?.start_date ? new Date(expense.start_date) : new Date()
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || isNaN(Number(amount))) {
      return;
    }

    setLoading(true);
    
    const result = await onSubmit({
      id: expense?.id,
      name: name.trim(),
      amount: Number(amount),
      frequency,
      start_date: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    });
    
      // Reset form on success for new expenses
      if (!result?.error) {
        if (!expense) {
          setName("");
          setAmount("");
          setFrequency("monthly");
          setStartDate(new Date());
        }
      }
    
    setLoading(false);
  };

  return (
    <Card className="p-6 shadow-medium border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        {expense ? "Edit Expense" : "Add Expense"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
            Expense Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rent, Groceries, Insurance"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-card-foreground">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="mt-1"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <Label htmlFor="frequency" className="text-sm font-medium text-card-foreground">
            Frequency
          </Label>
          <Select value={frequency} onValueChange={(value: "weekly" | "monthly" | "yearly") => setFrequency(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-card-foreground">
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full mt-1 justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-secondary hover:opacity-90 text-secondary-foreground font-medium"
            disabled={loading}
          >
            {loading ? "Processing..." : (expense ? "Update Expense" : "Add Expense")}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};