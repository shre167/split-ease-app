import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Settings, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  Search,
  Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  userName: string;
  totalOwe?: number;
  totalOwed?: number;
  onLogout?: () => void;
  onSettings?: () => void;
  onSearch?: () => void;
  onAddExpense?: () => void;
  onNotifications?: () => void;
}

const DashboardHeader = ({ 
  userName, 
  totalOwe = 0, 
  totalOwed = 0,
  onLogout,
  onSettings,
  onSearch,
  onAddExpense,
  onNotifications
}: DashboardHeaderProps) => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3); // Mock notification count

  // Calculate net balance
  const netBalance = totalOwed - totalOwe; // totalOwe is what you owe, totalOwed is what you're owed
  const isPositive = netBalance >= 0;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl z-10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="relative z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 lg:px-8">
          {/* Left Side - Greeting and Time */}
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-white/80 text-sm font-medium">{getGreeting()}</p>
              <h1 className="text-xl font-bold lg:text-2xl">{userName}</h1>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-white/80 text-xs">{currentTime.toLocaleDateString()}</p>
              <p className="text-white/90 text-sm font-medium">{formatTime(currentTime)}</p>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Add Expense Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddExpense}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotifications}
              className="text-white hover:bg-white/20 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 border-2 border-white">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 transition-colors p-0"
                >
                  <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                    <AvatarFallback className="bg-white/20 text-white font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="px-4 lg:px-8 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {/* Main Balance */}
            <div className="text-center mb-6">
              <p className="text-white/80 text-sm font-medium mb-2">Your Net Balance</p>
              <p className={`text-3xl lg:text-5xl font-bold ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(netBalance))}
              </p>
              <p className="text-white/80 text-xs mt-2">
                {isPositive ? 'You are owed more than you owe' : 'You owe more than you are owed'}
              </p>
            </div>

            {/* Balance Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                  <p className="text-white/80 text-xs font-medium">You Are Owed</p>
                </div>
                <p className="text-green-200 text-lg font-bold">{formatCurrency(totalOwed)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="w-4 h-4 text-red-300 mr-1" />
                  <p className="text-white/80 text-xs font-medium">You Owe</p>
                </div>
                <p className="text-red-200 text-lg font-bold">{formatCurrency(Math.abs(totalOwe))}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-white/70">
              <div className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>Active Groups</span>
              </div>
              <div className="flex items-center">
                <Bell className="w-3 h-3 mr-1" />
                <span>{notifications} Notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

