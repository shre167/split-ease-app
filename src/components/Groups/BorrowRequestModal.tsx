import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type BorrowRequest } from "@/lib/firebase";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface BorrowRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (request: Omit<BorrowRequest, 'id' | 'date'>) => void;
  members: GroupMember[];
  currentUserId: string;
  groupId: string;
}

const BorrowRequestModal = ({ isOpen, onClose, onSend, members, currentUserId, groupId }: BorrowRequestModalProps) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [toMember, setToMember] = useState("");

  const handleSend = () => {
    if (!amount || !reason.trim() || !toMember) {
      alert("Please fill in all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const requestData: Omit<BorrowRequest, 'id' | 'date'> = {
      groupId,
      from: currentUserId,
      to: toMember,
      amount: numAmount,
      description: reason.trim(),
      status: 'pending'
    };

    onSend(requestData);
    handleClose();
  };

  const handleClose = () => {
    setAmount("");
    setReason("");
    setToMember("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Borrow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select
              value={toMember}
              onChange={(e) => setToMember(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select member to borrow from</option>
              {members
                .filter(member => member.id !== currentUserId)
                .map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need to borrow?"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSend} className="flex-1">
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowRequestModal; 