import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentCard from "../Payments/PaymentCards";
import FilterChips from "@/components/Payments/FilterChips";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingActionButton from "@/components//Payments/FloatingButton";
import { cn } from "@/lib/utils";
import { getUserPayments, Payment, checkDatabaseContents } from "@/lib/firebase";
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
    
    // Category chip filter
    if (activeChips.length > 0) {
      const paymentCategory = payment.category.toLowerCase().replace(' payment', '');
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
          
          {/* Debug Button */}
          <button
            onClick={checkDatabaseContents}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
          >
            🔍 Check Database
          </button>
          
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
            <p className="text-muted-foreground">
              {payments.length === 0 ? "Start making payments to see them here" : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleAddPayment} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PaymentHistory;