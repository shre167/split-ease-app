import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  code: string;
  members: string[];
  balance: number;
}

interface FinanceCardsProps {
  totalOwe: number;
  totalOwed: number;
  groups: Group[];
  groupBalances?: Record<string, number>; // User's balance in each group
  onGroupClick?: (groupId: string) => void;
}

const FinanceCards: React.FC<FinanceCardsProps> = ({ 
  totalOwe, 
  totalOwed, 
  groups, 
  groupBalances = {},
  onGroupClick 
}) => {
  const { formatCurrency } = useCurrency();
  const [showDetails, setShowDetails] = useState(false);

  // Calculate detailed breakdowns using user's actual balances in each group
  const oweBreakdown = groups
    .filter(g => (groupBalances[g.id] || 0) < 0)
    .map(g => ({ ...g, amount: Math.abs(groupBalances[g.id] || 0) }))
    .sort((a, b) => b.amount - a.amount);

  const owedBreakdown = groups
    .filter(g => (groupBalances[g.id] || 0) > 0)
    .map(g => ({ ...g, amount: groupBalances[g.id] || 0 }))
    .sort((a, b) => b.amount - a.amount);

  const netBalance = totalOwed - totalOwe; // totalOwe is what you owe, totalOwed is what you're owed
  const hasSettlements = oweBreakdown.length > 0 || owedBreakdown.length > 0;

  return (
    <div className="space-y-6">
      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* You Owe Card */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-red-700 font-semibold text-lg">You Owe</h3>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-800">{formatCurrency(Math.abs(totalOwe))}</p>
          <p className="text-red-600 text-sm mt-1">
            {oweBreakdown.length > 0 
              ? `Across ${oweBreakdown.length} group${oweBreakdown.length > 1 ? 's' : ''}`
              : 'No outstanding debts'
            }
          </p>
          
          {/* Quick Actions */}
          {oweBreakdown.length > 0 && (
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-700 border-red-200 hover:bg-red-50"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'View Details'}
              </Button>
            </div>
          )}
        </div>

        {/* You Are Owed Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-700 font-semibold text-lg">You Are Owed</h3>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-800">{formatCurrency(totalOwed)}</p>
          <p className="text-green-600 text-sm mt-1">
            {owedBreakdown.length > 0 
              ? `Across ${owedBreakdown.length} group${owedBreakdown.length > 1 ? 's' : ''}`
              : 'No money owed to you'
            }
          </p>
          
          {/* Quick Actions */}
          {owedBreakdown.length > 0 && (
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-green-700 border-green-200 hover:bg-green-50"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'View Details'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && hasSettlements && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h4>
          
          {/* You Owe Details */}
          {oweBreakdown.length > 0 && (
            <div className="mb-6">
              <h5 className="text-red-700 font-medium mb-3 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" />
                Groups You Owe Money To
              </h5>
              <div className="space-y-3">
                {oweBreakdown.map((group) => (
                  <div 
                    key={group.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => onGroupClick?.(group.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{group.name}</p>
                        <p className="text-sm text-gray-500">{group.members.length} members</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-700 font-semibold">
                        {formatCurrency(group.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* You Are Owed Details */}
          {owedBreakdown.length > 0 && (
            <div>
              <h5 className="text-green-700 font-medium mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Groups That Owe You Money
              </h5>
              <div className="space-y-3">
                {owedBreakdown.map((group) => (
                  <div 
                    key={group.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                    onClick={() => onGroupClick?.(group.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{group.name}</p>
                        <p className="text-sm text-gray-500">{group.members.length} members</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700 font-semibold">
                        {formatCurrency(group.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settlement Suggestions */}
          {hasSettlements && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h6 className="text-blue-700 font-medium mb-2">💡 Settlement Tips</h6>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Click on any group to view detailed expenses and settlements</li>
                <li>• Use the "Settle Up" feature to mark payments as completed</li>
                <li>• Send reminders to group members who owe you money</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* No Activity State */}
      {!hasSettlements && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All Settled Up!</h3>
          <p className="text-gray-500">You don't owe anyone, and no one owes you. Great job keeping track of your expenses!</p>
        </div>
      )}
    </div>
  );
};

export default FinanceCards;
