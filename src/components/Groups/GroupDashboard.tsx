import { useState } from "react";
import GroupHeader from "./GroupHeader";
import ExpenseAnalytics from "../Groups/ExpenseAnalytics";
import { GroupMember, ExpenseData } from "../types/Group";
import { AnalyticsProps } from "../types/Group";

const GroupDashboard = () => {
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { id: 1, name: "Shreya", avatar: "S", balance: -50 },
    { id: 2, name: "Aryan", avatar: "A", balance: 50 },
    { id: 3, name: "Mira", avatar: "M", balance: 0 },
  ]);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsProps | null>(null);

  const handleSaveExpense = (expense: ExpenseData) => {
    console.log("Expense saved:", expense);

    const total = parseFloat(expense.amount.toString());

    const newAnalytics: AnalyticsProps = {
      totalExpenses: total,
      thisMonth: total,
      categories: [
        {
          name: expense.category,
          amount: total,
          emoji: "💸",
          color: "bg-blue-500",
          percentage: 100,
        },
      ],
      topSpenders: [
        {
          name: expense.paidBy,
          amount: total,
          avatar: expense.paidBy[0]?.toUpperCase(),
          rank: 1,
        },
      ],
      monthlyTrend: [
        {
          month: "Jul",
          amount: total,
        },
      ],
    };

    setAnalyticsData(newAnalytics);
  };

  return (
    <div className="space-y-6 p-6">
      <GroupHeader groupMembers={groupMembers} onSaveExpense={handleSaveExpense} />
      {analyticsData && (
        <ExpenseAnalytics analytics={analyticsData} />
      )}
    </div>
  );
};

export default GroupDashboard;
