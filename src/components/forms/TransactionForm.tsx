import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Upload, Image } from "lucide-react";
import { TransactionData } from "@/hooks/useTransactions";
import { CategoryData } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onSubmit: (transaction: Omit<TransactionData, 'id' | 'user_id'>) => void;
  onCancel: () => void;
  editingTransaction?: TransactionData;
  categories: CategoryData[];
  userId: string;
  fixedType?: 'income' | 'expense'; // New prop to fix the type
}

export const TransactionForm = ({ 
  onSubmit, 
  onCancel, 
  editingTransaction,
  categories,
  userId,
  fixedType
}: TransactionFormProps) => {
  const [name, setName] = useState(editingTransaction?.name || "");
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || "");
  const [type, setType] = useState<'income' | 'expense'>(fixedType || editingTransaction?.type || 'expense');
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(editingTransaction?.notes || "");
  const [categoryId, setCategoryId] = useState(editingTransaction?.category_id || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState(editingTransaction?.receipt_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleReceiptUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);
      
      setReceiptUrl(publicUrl);
      toast({
        title: "Success",
        description: "Receipt uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      name,
      amount: parseFloat(amount),
      type,
      date,
      notes: notes || undefined,
      category_id: categoryId || undefined,
      receipt_url: receiptUrl || undefined,
    });
  };

  return (
    <Card className="p-6 mb-6 shadow-card border-border/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Transaction Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!fixedType && (
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="receipt">Receipt</Label>
          <div className="space-y-2">
            {receiptUrl && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Image size={16} />
                <span className="text-sm">Receipt attached</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReceiptUrl("")}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            <Input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setReceiptFile(file);
                  handleReceiptUpload(file);
                }
              }}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload size={16} className="animate-pulse" />
                Uploading receipt...
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this transaction"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {editingTransaction ? "Update Transaction" : "Add Transaction"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};