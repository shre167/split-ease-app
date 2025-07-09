import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentCard from "../Payments/PaymentCards";
import FilterChips from "@/components/Payments/FilterChips";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingActionButton from "@/components//Payments/FloatingButton";
import FloatingCalculator from "@/components/Calculator";
import { cn } from "@/lib/utils";
import { getUserPayments, Payment } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PaymentHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate payment statistics based on filtered payments
  const getFilteredStats = () => {
    const filtered = payments.filter(payment => {
      // Group/Personal filter
      if (activeFilter === 'group') {
        if (!payment.groupId && !payment.description.toLowerCase().includes('group')) {
          return false;
        }
      } else if (activeFilter === 'personal') {
        if (payment.groupId || payment.description.toLowerCase().includes('group')) {
          return false;
        }
      }
      return true;
    });

    return {
      totalCredits: filtered.filter(payment => payment.type === 'received' || payment.status === 'received').reduce((sum, payment) => sum + payment.amount, 0),
      totalDebits: filtered.filter(payment => payment.type === 'spent' || payment.status === 'spent').reduce((sum, payment) => sum + payment.amount, 0)
    };
  };

  const paymentStats = getFilteredStats();

  // Get top categories
  const categoryStats = payments.reduce((acc, payment) => {
    const category = payment.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || user?.email || '';
      if (!userId) {
        console.log('No user ID available');
        return;
      }

      console.log('=== PAYMENT FETCH DEBUG ===');
      console.log('User object:', user);
      console.log('User email:', user?.email);
      console.log('User UID:', user?.uid);
      console.log('Using userId for query:', userId);
      
      const userPayments = await getUserPayments(userId);
      console.log('Successfully fetched payments:', userPayments);
      setPayments(userPayments);
    } catch (error) {
      console.error('=== PAYMENT FETCH ERROR ===');
      console.error('Error fetching payments:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error loading payments",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All', active: activeFilter === 'all' },
    { id: 'group', label: 'Group', active: activeFilter === 'group' },
    { id: 'personal', label: 'Personal', active: activeFilter === 'personal' },
  ];

  const categoryChips = [
    { id: 'food', label: 'Food', icon: '🍕', active: activeChips.includes('food') },
    { id: 'rent', label: 'Rent', icon: '🏠', active: activeChips.includes('rent') },
    { id: 'transport', label: 'Transport', icon: '🚗', active: activeChips.includes('transport') },
    { id: 'entertainment', label: 'Fun', icon: '🎬', active: activeChips.includes('entertainment') },
    { id: 'utilities', label: 'Bills', icon: '⚡', active: activeChips.includes('utilities') },
    { id: 'split', label: 'Split', icon: '💸', active: activeChips.includes('split') },
    { id: 'qr', label: 'QR Payment', icon: '📱', active: activeChips.includes('qr') },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', active: activeChips.includes('shopping') },
    { id: 'health', label: 'Health', icon: '🏥', active: activeChips.includes('health') },
    { id: 'education', label: 'Education', icon: '📚', active: activeChips.includes('education') },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', active: false },
    { id: 'groups', label: 'Groups', icon: '👥', active: false },
    { id: 'history', label: 'History', icon: '📊', active: true },
    { id: 'profile', label: 'Profile', icon: '👤', active: false },
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleChipClick = (chipId: string) => {
    setActiveChips(prev => 
      prev.includes(chipId) 
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId]
    );
  };

  const handleNavClick = (navId: string) => {
    console.log('Navigate to:', navId);
  };

  const handleAddPayment = () => {
    console.log('Add new payment');
  };

  const formatDate = (date: Date) => {
    try {
      const now = new Date();
      const paymentDate = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(paymentDate.getTime())) {
        console.warn('Invalid date:', date);
        return 'Unknown date';
      }
      
      const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Today, ' + paymentDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (diffDays === 2) {
        return 'Yesterday, ' + paymentDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return paymentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Unknown date';
    }
  };

  const filteredPayments = payments.filter(payment => {
    // Search filter
    if (searchQuery && !payment.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Group/Personal filter
    if (activeFilter === 'group') {
      // Filter for group payments (you can add a groupId field to your payment data)
      if (!payment.groupId && !payment.description.toLowerCase().includes('group')) {
        return false;
      }
    } else if (activeFilter === 'personal') {
      // Filter for personal payments
      if (payment.groupId || payment.description.toLowerCase().includes('group')) {
        return false;
      }
    }
    // 'all' filter shows everything
    
    // Category chip filter
    if (activeChips.length > 0) {
      const paymentCategory = payment.category?.toLowerCase().replace(' payment', '') || '';
      return activeChips.some(chip => paymentCategory.includes(chip));
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Gradient Header */}
      <div className="gradient-header px-4 py-8 pb-4">
        <div className="max-w-md mx-auto">
          
          <h1 className="text-white text-greeting mb-6">Payment History</h1>
          
          {/* Search */}
        <Input
  placeholder="Search payments..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mt-[-10px] mb-12 rounded-2xl border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 focus:bg-white/20"
/>

        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-md mx-auto px-4 -mt-10 mb-4">
        <div className="card-highlight rounded-2xl p-4 mb-4">
          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-4">
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant="secondary"
                size="sm"
                onClick={() => handleFilterClick(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300 relative",
                  filter.active 
                    ? "bg-secondary text-secondary-foreground shadow-md tab-active" 
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto">
            {categoryChips.map((chip) => (
              <button
                key={chip.id}
                className={`px-4 py-1 text-sm rounded-full border ${
                  chip.active
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleChipClick(chip.id)}
              >
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-md mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            📊 {activeFilter === 'all' ? 'All Payments' : activeFilter === 'group' ? 'Group Payments' : 'Personal Payments'} Insights
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">₹{paymentStats.totalCredits.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Credits</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">₹{paymentStats.totalDebits.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Debits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => {
            // Validate payment data before rendering
            if (!payment.id || !payment.description || typeof payment.amount !== 'number') {
              console.warn('Invalid payment data:', payment);
              return null;
            }
            
            return (
              <PaymentCard 
                key={payment.id} 
                id={payment.id}
                category={payment.category || 'Unknown'}
                categoryIcon={payment.categoryIcon || '💸'}
                description={payment.description}
                amount={payment.amount}
                date={formatDate(payment.date)}
                status={payment.status || 'settled'}
                type={payment.type || 'spent'}
              />
            );
          }).filter(Boolean)
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No payments found</h3>
            <p className="text-muted-foreground mb-6">
              {payments.length === 0 ? "Start making payments to see them here" : "Try adjusting your search or filters"}
            </p>
            
            {payments.length === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Start Guide</h4>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</div>
                    <span className="text-sm text-gray-700">Create or join a group to start splitting expenses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                    <span className="text-sm text-gray-700">Add expenses to your groups</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">3</div>
                    <span className="text-sm text-gray-700">Track all your payments and settlements here</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleAddPayment} />

      {/* Place the calculator elegantly on the left side */}
      <div className="fixed left-4 bottom-24 z-40">
        <FloatingCalculator />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PaymentHistory;