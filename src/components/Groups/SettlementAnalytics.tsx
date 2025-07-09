import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  status?: 'owed_to_you' | 'you_owe' | 'settled';
  amount?: number;
}

interface SettlementAnalyticsProps {
  members: GroupMember[];
  currentUserId: string;
  onSettleUp: (payerId: string, recipientId: string, amount: number, date: Date, memo: string) => Promise<void>;
}

const SettlementAnalytics = ({ members, currentUserId, onSettleUp }: SettlementAnalyticsProps) => {
  const [timeFilter, setTimeFilter] = useState("7d");
  const [loading, setLoading] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const handleSettleUp = async (member: GroupMember) => {
    if (!member.amount) return;
    
    setLoading(member.id);
    
    try {
      if (member.status === 'owed_to_you') {
        await onSettleUp(member.id, currentUserId, member.amount, new Date(), 'Settlement');
      } else {
        await onSettleUp(currentUserId, member.id, member.amount, new Date(), 'Settlement');
      }
    } catch (error) {
      console.error('Error settling up:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden">
      <div className="bg-gradient-primary p-4 text-white">
        <h3 className="text-lg font-bold">💸 Settlement Analytics</h3>
        <p className="text-white/80 text-sm">Track payments and settlements</p>
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
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className={`text-sm ${member.status === 'owed_to_you' ? 'text-green-600' : member.status === 'you_owe' ? 'text-red-600' : 'text-gray-500'}`}>
                    {member.status === 'owed_to_you' ? `Owes you ${formatCurrency(member.amount || 0)}` : 
                     member.status === 'you_owe' ? `You owe ${formatCurrency(member.amount || 0)}` : 
                     'Settled up'}
                  </p>
                </div>
              </div>
              {member.status !== 'settled' && member.amount && (
                <Button
                  size="sm"
                  variant={member.status === 'owed_to_you' ? 'default' : 'outline'}
                  onClick={() => handleSettleUp(member)}
                  disabled={loading === member.id}
                >
                  {loading === member.id ? 'Processing...' : member.status === 'owed_to_you' ? 'Request' : 'Pay'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettlementAnalytics;
