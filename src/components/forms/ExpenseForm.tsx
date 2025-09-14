import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ExpenseData } from "@/components/expenses/ExpenseItem";

interface ExpenseFormProps {
  expense?: ExpenseData;
  onSubmit: (expense: Omit<ExpenseData, "id"> & { id?: string }) => void;
  onCancel: () => void;
}

export const ExpenseForm = ({ expense, onSubmit, onCancel }: ExpenseFormProps) => {
  const [name, setName] = useState(expense?.name || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(expense?.frequency || "monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || isNaN(Number(amount))) {
      return;
    }

    onSubmit({
      id: expense?.id,
      name: name.trim(),
      amount: Number(amount),
      frequency,
    });
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

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-secondary hover:opacity-90 text-secondary-foreground font-medium"
          >
            {expense ? "Update" : "Add"} Expense
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