import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Expense } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  members: GroupMember[];
  groupId: string;
}

const AddExpenseModal = ({ isOpen, onClose, onSave, members, groupId }: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "manual">("equal");
  const [manualSplits, setManualSplits] = useState<Record<string, number>>({});
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "General", "Food", "Transport", "Entertainment", "Shopping", 
    "Bills", "Healthcare", "Education", "Travel", "Other"
  ];

  const handleSave = async () => {
    console.log('AddExpenseModal: handleSave called');
    console.log('AddExpenseModal: Current state:', {
      description,
      amount,
      paidBy,
      category,
      splitType,
      manualSplits,
      memo,
      members: members.length
    });

    setError("");
    setLoading(true);

    try {
      if (!description.trim() || !amount || !paidBy) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError("Please enter a valid amount");
        setLoading(false);
        return;
      }

      let splits: Record<string, number> = {};
      
      if (splitType === "equal") {
        const equalShare = numAmount / members.length;
        members.forEach(member => {
          splits[member.id] = equalShare;
        });
        console.log('AddExpenseModal: Equal splits calculated:', splits);
      } else {
        // Validate manual splits
        const totalSplit = Object.values(manualSplits).reduce((sum, val) => sum + val, 0);
        if (Math.abs(totalSplit - numAmount) > 0.01) {
          setError("Manual splits must equal the total amount");
          setLoading(false);
          return;
        }
        splits = manualSplits;
        console.log('AddExpenseModal: Manual splits validated:', splits);
      }

      const expenseData: Omit<Expense, 'id' | 'createdAt'> = {
        groupId,
        description: description.trim(),
        amount: numAmount,
        paidBy,
        paidByName: members.find(m => m.id === paidBy)?.name || "Unknown",
        date: new Date(),
        category,
        splits,
        ...(memo.trim() && { memo: memo.trim() }), // Only include memo if it's not empty
      };

      console.log('AddExpenseModal: Expense data prepared:', expenseData);
      console.log('AddExpenseModal: Calling onSave callback');
      
      await onSave(expenseData);
      handleClose();
    } catch (error) {
      console.error('AddExpenseModal: Error saving expense:', error);
      setError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Don't close if loading
    
    setDescription("");
    setAmount("");
    setCategory("General");
    setPaidBy("");
    setSplitType("equal");
    setManualSplits({});
    setMemo("");
    setError("");
    setLoading(false);
    onClose();
  };

  const handleManualSplitChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setManualSplits(prev => ({
      ...prev,
      [memberId]: numValue
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select who paid</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Split Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === "equal"}
                  onChange={(e) => setSplitType(e.target.value as "equal" | "manual")}
                  className="mr-2"
                  disabled={loading}
                />
                Equal
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={splitType === "manual"}
                  onChange={(e) => setSplitType(e.target.value as "equal" | "manual")}
                  className="mr-2"
                  disabled={loading}
                />
                Manual
              </label>
            </div>
          </div>

          {splitType === "manual" && (
            <div>
              <label className="block text-sm font-medium mb-2">Manual Splits</label>
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <span className="text-sm w-20">{member.name}:</span>
                    <Input
                      type="number"
                      value={manualSplits[member.id] || ""}
                      onChange={(e) => handleManualSplitChange(member.id, e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="flex-1"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Memo (optional)</label>
            <Input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note..."
              disabled={loading}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Expense'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
