export interface AnalyticsProps {
  totalExpenses: number;
  thisMonth: number;
  categories: {
    name: string;
    amount: number;
    emoji: string;
    color: string;
    percentage: number;
  }[];
  topSpenders: {
    id: Key;
    name: string;
    amount: number;
    avatar: string;
    rank: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}
