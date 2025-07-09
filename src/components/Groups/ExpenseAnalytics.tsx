import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { type Expense } from "@/lib/firebase";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'completed';
}

interface ExpenseAnalyticsProps {
  analytics: {
    totalExpenses: number;
    thisMonth: number;
    members: GroupMember[];
    settlements: Settlement[];
    currentUserId: string;
    totalOwed: number;
    totalOwes: number;
  };
  expenses: Expense[];
  groupMembers: GroupMember[];
  currentUserId: string;
}

const ExpenseAnalytics = ({ analytics, expenses, groupMembers, currentUserId }: ExpenseAnalyticsProps) => {
  const [timeFilter, setTimeFilter] = useState("7d");
  const { formatCurrency } = useCurrency();

  return (
    <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden">
      <div className="bg-gradient-primary p-4 text-white">
        <h3 className="text-lg font-bold">📊 Expense Analytics</h3>
        <p className="text-white/80 text-sm">Track your spending patterns</p>
      </div>
      
      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          <Button
            variant={timeFilter === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("7d")}
          >
            7 Days
          </Button>
          <Button
            variant={timeFilter === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={timeFilter === "6mo" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("6mo")}
          >
            6 Months
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-primary/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(analytics.totalExpenses)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-primary/10 rounded-xl">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(analytics.thisMonth)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-muted-foreground">You're Owed</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(analytics.totalOwed)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-muted-foreground">You Owe</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(analytics.totalOwes)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;