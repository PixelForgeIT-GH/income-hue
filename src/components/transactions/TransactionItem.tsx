import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Image, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { TransactionData } from "@/hooks/useTransactions";
import { CategoryData } from "@/hooks/useCategories";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: TransactionData;
  categories: CategoryData[];
  onEdit: (transaction: TransactionData) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem = ({ 
  transaction, 
  categories,
  onEdit, 
  onDelete 
}: TransactionItemProps) => {
  const category = categories.find(cat => cat.id === transaction.category_id);
  
  return (
    <Card className="p-4 shadow-soft border-border/50 hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-1 rounded-full ${
              transaction.type === 'income' 
                ? 'bg-income/20 text-income' 
                : 'bg-expense/20 text-expense'
            }`}>
              {transaction.type === 'income' 
                ? <ArrowUpCircle size={16} /> 
                : <ArrowDownCircle size={16} />
              }
            </div>
            <div>
              <h4 className="font-medium text-foreground">{transaction.name}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-semibold ${
              transaction.type === 'income' ? 'text-income' : 'text-expense'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
            
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            
            {transaction.receipt_url && (
              <Badge variant="outline" className="text-xs">
                <Image size={12} className="mr-1" />
                Receipt
              </Badge>
            )}
          </div>
          
          {transaction.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              {transaction.notes}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(transaction)}
            className="h-8 w-8 p-0"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};