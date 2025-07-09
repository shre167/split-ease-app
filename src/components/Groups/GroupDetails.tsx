import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  addExpense, 
  getGroupExpenses, 
  updateExpense, 
  deleteExpense,
  addSettlement,
  getGroupSettlements,
  addBorrowRequest,
  getGroupBorrowRequests,
  updateBorrowRequestStatus,
  addGroupMessage,
  getGroupMessages,
  getGroup,
  updateGroupBalance,
  type Expense,
  type Settlement,
  type BorrowRequest,
  type GroupMessage,
  type Group
} from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { getDocs, query, collection, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ArrowLeft, Plus, DollarSign, Users, CreditCard, TrendingUp, Receipt, MessageCircle, UserPlus, Bell, Edit, Trash2, Share2, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddExpenseModal from "./AddExpenseModal";
import ExpenseDetailModal from "./ExpenseDetailModal";
import BorrowRequestModal from "./BorrowRequestModal";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isBorrowRequestOpen, setIsBorrowRequestOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);

  const currentUserId = user?.email || "";

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      
      try {
        const groupData = await getGroup(groupId);
        if (groupData) {
          setGroup(groupData);
          
          const groupMembers: GroupMember[] = groupData.members.map((memberEmail: string, index: number) => ({
            id: memberEmail, // Using email as ID for consistency
            name: memberEmail.split('@')[0] || memberEmail,
            email: memberEmail,
            avatar: (memberEmail.split('@')[0] || memberEmail).charAt(0).toUpperCase(),
            balance: 0
          }));
          
          setMembers(groupMembers);
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        toast.error("Failed to load group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  // Real-time expenses listener
  useEffect(() => {
    if (!groupId) return;

    console.log('GroupDetails: Setting up expense listener for groupId:', groupId);
    
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('GroupDetails: Expense listener received update, docs count:', querySnapshot.docs.length);
      
      const expensesData: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push({
          id: doc.id,
          description: data.description,
          amount: data.amount,
          paidBy: data.paidBy,
          paidByName: data.paidByName,
          date: data.date?.toDate(),
          category: data.category,
          splits: data.splits,
          memo: data.memo,
          createdAt: data.createdAt?.toDate() || new Date(),
          groupId: data.groupId
        });
      });
      
      console.log('GroupDetails: Setting expenses state with count:', expensesData.length);
      setExpenses(expensesData);
    }, (error) => {
      console.error('Error listening to expenses:', error);
      toast.error("Failed to load expenses");
    });

    return unsubscribe;
  }, [groupId]);

  // Fetch settlements
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = getGroupSettlements(groupId, (settlements) => {
      setSettlements(settlements);
    });

    return () => unsubscribe();
  }, [groupId]);

  // Fetch borrow requests
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = getGroupBorrowRequests(groupId, (requests) => {
      setBorrowRequests(requests);
    });

    return () => unsubscribe();
  }, [groupId]);

  // Fetch messages
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = getGroupMessages(groupId, (messages) => {
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [groupId]);

  // Calculate balances
  const memberBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    members.forEach(member => balances[member.id] = 0);

    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const totalAmount = expense.amount;
      
      if (balances[paidBy] !== undefined) {
        balances[paidBy] += totalAmount;
      }
      
      Object.entries(expense.splits).forEach(([memberId, share]) => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= share;
        }
      });
    });

    return balances;
  }, [expenses, members]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const settlementsNeeded = useMemo(() => {
    const settlementsArr: Array<{ from: string; to: string; amount: number }> = [];
    const balances = { ...memberBalances };

    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .sort((a, b) => b[1] - a[1]);

    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .sort((a, b) => a[1] - b[1]);

    debtors.forEach(([debtorId, debtorBalance]) => {
      let remainingDebt = Math.abs(debtorBalance);

      creditors.forEach(([creditorId, creditorBalance]) => {
        if (remainingDebt > 0 && creditorBalance > 0) {
          const settlementAmount = Math.min(remainingDebt, creditorBalance);

          // Check if this settlement has already been made
          const alreadySettled = settlements.some(
            s =>
              s.from === debtorId &&
              s.to === creditorId &&
              Math.abs(s.amount - settlementAmount) < 0.01 // allow for floating point error
          );

          if (!alreadySettled) {
            settlementsArr.push({
              from: debtorId,
              to: creditorId,
              amount: parseFloat(settlementAmount.toFixed(2))
            });
          }

          remainingDebt -= settlementAmount;
          balances[creditorId] -= settlementAmount;
        }
      });
    });

    return settlementsArr;
  }, [memberBalances, settlements]);

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!groupId) return;
    
    try {
      await addExpense({
        ...expenseData,
        groupId,
      });
      
      // Add activity message
      await addGroupMessage({
        groupId,
        userId: currentUserId,
        userName: user?.email?.split('@')[0] || 'User',
        userAvatar: user?.email?.charAt(0).toUpperCase() || 'U',
        message: `Added expense: ${expenseData.description} - ${formatCurrency(expenseData.amount)}`,
        type: 'expense',
        reactions: {}
      });

      // Update group balance
      await updateGroupBalance(groupId);
      
      toast.success("Expense added successfully");
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error("Failed to add expense");
      throw error;
    }
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, updates);
      
      if (groupId) {
        await updateGroupBalance(groupId);
        await addGroupMessage({
          groupId,
          userId: currentUserId,
          userName: user?.email?.split('@')[0] || 'User',
          userAvatar: user?.email?.charAt(0).toUpperCase() || 'U',
          message: `Updated expense: ${updates.description || 'expense'}`,
          type: 'expense',
          reactions: {}
        });
      }
      toast.success("Expense updated successfully");
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error("Failed to update expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!groupId) return;
    
    try {
      await deleteExpense(expenseId, groupId);
      await updateGroupBalance(groupId);
      
              await addGroupMessage({
          groupId,
          userId: currentUserId,
          userName: user?.email?.split('@')[0] || 'User',
          userAvatar: user?.email?.charAt(0).toUpperCase() || 'U',
          message: 'Deleted an expense',
          type: 'expense',
          reactions: {}
        });
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error("Failed to delete expense");
    }
  };

  const handleAddSettlement = async (settlementData: Omit<Settlement, 'id' | 'date'>) => {
    if (!groupId) return;
    
    try {
      await addSettlement({
        ...settlementData,
        groupId,
      });
      
      await updateGroupBalance(groupId);
      
      await addGroupMessage({
        groupId,
        userId: currentUserId,
        userName: user?.email?.split('@')[0] || 'User',
        userAvatar: user?.email?.charAt(0).toUpperCase() || 'U',
        message: `Settlement: ${settlementData.from} → ${settlementData.to} - ${formatCurrency(settlementData.amount)}`,
        type: 'settlement',
        reactions: {},
        timestamp: new Date()
      });
      toast.success("Settlement added successfully");
    } catch (error) {
      console.error('Error adding settlement:', error);
      toast.error("Failed to add settlement");
    }
  };

  const handleBorrowRequest = async (request: Omit<BorrowRequest, 'id' | 'date'>) => {
    if (!groupId) return;
    
    try {
      await addBorrowRequest(request);
      
      await addGroupMessage({
        groupId,
        userId: currentUserId,
        userName: user?.email?.split('@')[0] || 'User',
        userAvatar: user?.email?.charAt(0).toUpperCase() || 'U',
        message: `Borrow request: ${request.from} → ${request.to} - ${formatCurrency(request.amount)}`,
        type: 'text',
        reactions: {},
        timestamp: new Date()
      });
      
      setIsBorrowRequestOpen(false);
      toast.success("Borrow request sent successfully");
    } catch (error) {
      console.error('Error adding borrow request:', error);
      toast.error("Failed to send borrow request");
    }
  };

  const getMemberById = (id: string) => members.find(m => m.id === id);
  const getMemberName = (id: string) => getMemberById(id)?.name || 'Unknown';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h1>
          <p className="text-gray-600 mb-6">The group you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-white/80"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600">Group Code: {group.code}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Member to Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                    <Button onClick={() => setIsAddMemberOpen(false)} className="w-full">
                      Add Member
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={() => setIsAddExpenseOpen(true)} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Total Expenses</p>
                    <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Members</p>
                    <p className="text-xl font-bold">{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Expenses</p>
                    <p className="text-xl font-bold">{expenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Avg per Person</p>
                    <p className="text-xl font-bold">
                      {members.length > 0 ? formatCurrency(totalExpenses / members.length) : formatCurrency(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Receipt className="w-5 h-5" />
                  <span>Recent Expenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No expenses yet</p>
                    <Button 
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="mt-4"
                    >
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div 
                        key={expense.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer border border-gray-200/50"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setIsExpenseDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="bg-gradient-to-r from-blue-500 to-purple-500">
                            <AvatarFallback className="text-white">
                              {getMemberById(expense.paidBy)?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-600">
                              Paid by {expense.paidByName} • {expense.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                            {expense.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <CreditCard className="w-5 h-5" />
                  <span>Member Balances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => {
                    const balance = memberBalances[member.id] || 0;
                    const isPositive = balance > 0;
                    const isNegative = balance < 0;
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                        <div className="flex items-center space-x-4">
                          <Avatar className="bg-gradient-to-r from-blue-500 to-purple-500">
                            <AvatarFallback className="text-white">{member.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-800">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(balance)}
                          </p>
                          <Badge 
                            variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'} 
                            className={isPositive ? 'bg-green-100 text-green-800' : isNegative ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {isPositive ? 'Owed' : isNegative ? 'Owes' : 'Settled'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settlements" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <TrendingUp className="w-5 h-5" />
                  <span>Settlements Needed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {settlementsNeeded.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">All settled up!</p>
                    <p className="text-sm text-gray-500">No settlements needed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settlementsNeeded.map((settlement, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="bg-gradient-to-r from-red-500 to-red-600">
                              <AvatarFallback className="text-white">
                                {getMemberById(settlement.from)?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-600">→</span>
                            <Avatar className="bg-gradient-to-r from-green-500 to-green-600">
                              <AvatarFallback className="text-white">
                                {getMemberById(settlement.to)?.avatar}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {getMemberName(settlement.from)} pays {getMemberName(settlement.to)}
                            </p>
                            <p className="text-sm text-gray-600">Settlement</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(settlement.amount)}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700"
                            onClick={() => handleAddSettlement({
                              from: settlement.from,
                              to: settlement.to,
                              amount: settlement.amount,
                              groupId: groupId!
                            })}
                          >
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <MessageCircle className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No activity yet</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">{message.userName}</span> {message.message}
                          </p>
                          <p className="text-xs text-gray-600">
                            {message.timestamp?.toLocaleDateString() || new Date().toLocaleDateString()}
                          </p>
                        </div>
                        {message.type === 'expense' && <p className="font-medium text-gray-800">{formatCurrency(0)}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition"
          onClick={() => setIsAddExpenseOpen(true)}
          title="Add Expense"
        >
          +
        </button>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl hover:scale-105 transition"
          onClick={() => setIsBorrowRequestOpen(true)}
          title="Request to Borrow"
        >
          💰
        </button>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSave={handleAddExpense}
        members={members}
        groupId={groupId || ""}
      />

      <ExpenseDetailModal
        isOpen={isExpenseDetailOpen}
        onClose={() => {
          setIsExpenseDetailOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        members={members}
        onUpdate={handleUpdateExpense}
        onDelete={handleDeleteExpense}
      />

      <BorrowRequestModal
        isOpen={isBorrowRequestOpen}
        onClose={() => setIsBorrowRequestOpen(false)}
        onSend={handleBorrowRequest}
        members={members}
        currentUserId={currentUserId}
        groupId={groupId || ""}
      />
    </div>
  );
};

export default GroupDetails;