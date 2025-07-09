import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Send, ArrowLeft, Users, Copy, Share2, Settings, MoreVertical, UserPlus } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface GroupHeaderProps {
  groupName?: string;
  groupCode?: string;
  memberCount?: number;
  totalBalance?: number;
  groupMembers?: GroupMember[];
  onSaveExpense?: (expense: any) => void;
  onSettleUp?: (payerId: string, recipientId: string, amount: number, date: Date, memo: string) => void;
  balances?: Record<string, number>;
  currentUserId?: string;
  onAddMember?: () => void;
  onShareGroup?: () => void;
  onEditGroup?: () => void;
}

const GroupHeader = ({ 
  groupName = "Group", 
  groupCode = "CODE", 
  memberCount = 0, 
  totalBalance = 0,
  groupMembers = [],
  onSaveExpense,
  onSettleUp,
  balances = {},
  currentUserId = "",
  onAddMember,
  onShareGroup,
  onEditGroup
}: GroupHeaderProps) => {
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      // You could add a toast notification here
      console.log('Group code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleShareGroup = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${groupName} on SplitEase`,
        text: `Join my group "${groupName}" on SplitEase! Use code: ${groupCode}`,
        url: `https://splitease.app/join/${groupCode}`
      });
    } else {
      onShareGroup?.();
    }
  };

  // Calculate balance statistics
  const positiveBalances = groupMembers.filter(m => m.balance > 0);
  const negativeBalances = groupMembers.filter(m => m.balance < 0);
  const settledMembers = groupMembers.filter(m => m.balance === 0);

  return (
    <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 text-white relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{groupName}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {groupCode}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1 h-6"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShareGroup}
                className="text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEditGroup}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddMember}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareGroup}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Balance Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-white/80 text-xs">Total Balance</p>
              <p className="text-xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-white/80 text-xs">Members</p>
              <p className="text-xl font-bold">{memberCount}</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-white/80 text-xs">Status</p>
              <p className="text-sm font-semibold">
                {totalBalance === 0 ? 'Settled Up' : totalBalance > 0 ? 'You Are Owed' : 'You Owe'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowMembers(!showMembers)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <Users className="w-4 h-4 mr-2" />
              {showMembers ? 'Hide Members' : 'Show Members'}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMember}
              className="border-gray-300 hover:bg-gray-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Members List */}
      {showMembers && (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Group Members</h3>
          
          {/* Balance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 text-xs font-medium">Owed Money</p>
              <p className="text-green-800 font-bold">{positiveBalances.length}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-xs font-medium">Owe Money</p>
              <p className="text-red-800 font-bold">{negativeBalances.length}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 text-xs font-medium">Settled Up</p>
              <p className="text-gray-800 font-bold">{settledMembers.length}</p>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    member.balance > 0 
                      ? 'text-green-600' 
                      : member.balance < 0 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {formatCurrency(member.balance)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.balance > 0 ? 'Owed' : member.balance < 0 ? 'Owes' : 'Settled'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Settlement Suggestions */}
          {negativeBalances.length > 0 && positiveBalances.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Settlement Suggestions</h4>
              <p className="text-xs text-blue-600">
                {negativeBalances.length} member(s) owe money and {positiveBalances.length} member(s) are owed money. 
                Use the "Settle Up" feature to mark payments as completed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupHeader;