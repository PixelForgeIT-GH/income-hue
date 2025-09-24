import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { IncomeStreamData } from "@/components/income/IncomeStream";

interface IncomeStreamFormProps {
  stream?: IncomeStreamData;
  onSubmit: (stream: Omit<IncomeStreamData, "id"> & { id?: string }) => Promise<{ error: any } | undefined>;
  onCancel: () => void;
}

export const IncomeStreamForm = ({ stream, onSubmit, onCancel }: IncomeStreamFormProps) => {
  const [name, setName] = useState(stream?.name || "");
  const [amount, setAmount] = useState(stream?.amount?.toString() || "");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly" | "yearly">(stream?.frequency || "monthly");
  const [lastPaidDate, setLastPaidDate] = useState(
    stream?.lastPaidDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || isNaN(Number(amount))) {
      return;
    }

    setLoading(true);
    
    const result = await onSubmit({
      id: stream?.id,
      name: name.trim(),
      amount: Number(amount),
      frequency,
      lastPaidDate: new Date(lastPaidDate),
    });
    
    if (!result?.error) {
      // Reset form on success
      if (!stream) {
        setName("");
        setAmount("");
        setFrequency("monthly");
        setLastPaidDate(new Date().toISOString().split('T')[0]);
      }
    }
    
    setLoading(false);
  };

  return (
    <Card className="p-6 shadow-medium border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        {stream ? "Edit Income Stream" : "Add Income Stream"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
            Stream Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Salary, Freelance Work"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-card-foreground">
            {frequency === "yearly" ? "Annual Salary" : "Amount per Pay"}
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
            Pay Frequency
          </Label>
          <Select value={frequency} onValueChange={(value: "weekly" | "biweekly" | "monthly" | "yearly") => setFrequency(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly (every 2 weeks)</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly (enter annual salary)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lastPaidDate" className="text-sm font-medium text-card-foreground">
            Last Paid Date
          </Label>
          <Input
            id="lastPaidDate"
            type="date"
            value={lastPaidDate}
            onChange={(e) => setLastPaidDate(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium"
            disabled={loading}
          >
            {loading ? "Processing..." : (stream ? "Update Stream" : "Add Stream")}
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