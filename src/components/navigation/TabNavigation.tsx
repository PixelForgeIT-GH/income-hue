import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, PieChart, CreditCard, Receipt, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "income", label: "Income", icon: DollarSign },
  { id: "dashboard", label: "Dashboard", icon: PieChart },
  { id: "expenses", label: "Expenses", icon: CreditCard },
  { id: "transactions", label: "Transactions", icon: Receipt },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-2 shadow-medium bg-card/95 backdrop-blur-sm border-border/50">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-300",
                "hover:bg-muted/50 active:scale-95",
                isActive
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mb-1 transition-colors",
                  isActive ? "text-primary-foreground" : "text-current"
                )} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};