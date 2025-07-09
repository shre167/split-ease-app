import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { type Expense } from "@/lib/firebase";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members: GroupMember[];
  onUpdate: (expenseId: string, updated: Partial<Expense>) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>;
}

const ExpenseDetailModal = ({ isOpen, onClose, expense, members, onUpdate, onDelete }: ExpenseDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [splits, setSplits] = useState<Record<string, string>>({});
  const [splitType, setSplitType] = useState<'equal' | 'manual'>('equal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "General", "Food", "Transport", "Entertainment", "Shopping", 
    "Bills", "Healthcare", "Education", "Travel", "Other"
  ];

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setSplits(Object.fromEntries(Object.entries(expense.splits).map(([k, v]) => [k, v.toString()])));
      setSplitType('equal');
      setError("");
    }
  }, [expense]);

  if (!expense) return null;

  const handleSave = async () => {
    setError("");
    setLoading(true);

    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError("Please enter a valid amount");
        setLoading(false);
        return;
      }

      const parsedSplits: Record<string, number> = {};
      let totalSplit = 0;
      for (const id in splits) {
        const value = parseFloat(splits[id]);
        if (isNaN(value) || value < 0) {
          setError("Please enter valid split amounts");
          setLoading(false);
          return;
        }
        parsedSplits[id] = value;
        totalSplit += value;
      }
      
      if (Math.abs(totalSplit - numericAmount) > 0.01) {
        setError("The split amounts must total the expense amount");
        setLoading(false);
        return;
      }

      await onUpdate(expense.id, {
        description,
        amount: numericAmount,
        category,
        splits: parsedSplits,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      setError("Failed to update expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onDelete(expense.id);
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError("Failed to delete expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEqualSplit = () => {
    const total = parseFloat(amount);
    if (isNaN(total) || total <= 0) {
      setError("Please enter a valid amount first");
      return;
    }
    
    const splitAmount = total / members.length;
    const newSplits: Record<string, string> = {};
    members.forEach((member) => {
      newSplits[member.id] = splitAmount.toFixed(2);
    });
    setSplits(newSplits);
    setError("");
  };

  const handleClose = () => {
    if (loading) return; // Don't close if loading
    
    setIsEditing(false);
    setDescription("");
    setAmount("");
    setCategory("General");
    setSplits({});
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isEditing ? (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                min="0.01" 
                step="0.01" 
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Split Among Members</label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={handleEqualSplit}
                  disabled={loading}
                >
                  Split equally
                </Button>
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex justify-between items-center">
                    <span>{member.name}</span>
                    <Input
                      type="number"
                      value={splits[member.id] || ""}
                      onChange={e => setSplits(prev => ({ ...prev, [member.id]: e.target.value }))}
                      className="w-24 p-2 border rounded"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{expense.description}</h2>
                <p className="text-gray-600">Paid by {expense.paidByName} • {new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">₹{expense.amount.toFixed(2)}</span>
                <Badge variant="secondary" className="ml-2">{expense.category}</Badge>
              </div>
            </div>
            
            {expense.memo && (
              <div>
                <h3 className="font-semibold mb-2">Memo</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{expense.memo}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">Split</h3>
              <ul className="space-y-1">
                {Object.entries(expense.splits).map(([id, value]) => {
                  const member = members.find(m => m.id === id);
                  return (
                    <li key={id} className="flex justify-between">
                      <span>{member?.name || id}</span>
                      <span>₹{value.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)} 
                className="flex-1"
                disabled={loading}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailModal; 