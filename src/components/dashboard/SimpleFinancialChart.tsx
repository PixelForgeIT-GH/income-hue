import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";

interface SimpleFinancialChartProps {
  income: number;
  expenses: number;
  transactions: number;
}

export const SimpleFinancialChart = ({ income, expenses, transactions }: SimpleFinancialChartProps) => {
  const data = [
    {
      name: "Income",
      value: income,
      color: "hsl(var(--income))",
    },
    {
      name: "Expenses", 
      value: expenses,
      color: "hsl(var(--expense))",
    },
    {
      name: "Transactions",
      value: transactions,
      color: "hsl(220 91% 56%)", // Blue color
    },
  ].filter(item => item.value > 0); // Only show items with values

  const COLORS = ["hsl(var(--income))", "hsl(var(--expense))", "hsl(220 91% 56%)"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="font-medium text-card-foreground">{data.name}</p>
          <p className="text-lg font-semibold" style={{ color: data.payload.color }}>
            ${data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6 shadow-card border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
        Monthly Overview
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};