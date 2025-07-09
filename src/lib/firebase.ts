import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, getDoc, serverTimestamp, deleteDoc, updateDoc, doc, onSnapshot, arrayUnion, arrayRemove } from "firebase/firestore"; // 🔥 Use 'lite'

const firebaseConfig = {
  apiKey: "AIzaSyCRLQRQ1X5PUMeYGUq3emjCDBlFiweqCpE",
  authDomain: "split-ease-38af2.firebaseapp.com",
  projectId: "split-ease-38af2",
  storageBucket: "split-ease-38af2.appspot.com",
  messagingSenderId: "341296961760",
  appId: "1:341296961760:web:ffa84235071a9a157cd885",
  measurementId: "G-Y8NCQXNL4J",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ Should now work!

// Payment types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  recipient: string;
  description: string;
  category: string;
  categoryIcon: string;
  status: 'settled' | 'pending' | 'auto-detected';
  type: 'received' | 'spent';
  date: Date;
  paymentMethod: 'qr' | 'upi' | 'card' | 'cash';
  upiId?: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  code: string;
  members: string[];
  balance: number;
  createdAt: Date;
}

// Expense types
export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  date: Date;
  category: string;
  splits: Record<string, number>;
  createdAt: Date;
  memo?: string;
  isReminded?: boolean;
}

// Settlement types
export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'completed';
}

// Borrow Request types
export interface BorrowRequest {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
}

// Group Message types
export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'expense' | 'settlement';
  reactions: Record<string, string[]>;
}

// Payment functions
export const recordPayment = async (paymentData: Omit<Payment, 'id' | 'date'>) => {
  try {
    console.log('Recording payment with data:', paymentData);
    
    // Ensure we have a valid user ID
    if (!paymentData.userId || paymentData.userId === 'unknown') {
      throw new Error('Invalid user ID for payment recording');
    }

    const payment = {
      ...paymentData,
      date: new Date(),
    };
    
    console.log('Final payment object:', payment);
    
    const docRef = await addDoc(collection(db, 'payments'), payment);
    console.log('Payment recorded successfully with ID:', docRef.id);
    
    return { id: docRef.id, ...payment };
  } catch (error) {
    console.error('Error recording payment:', error);
    console.error('Payment data that failed:', paymentData);
    throw error;
  }
};

export const getUserPayments = async (userId: string) => {
  try {
    console.log('Fetching payments for user:', userId);
    
    // First, get all payments for the user without ordering
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    console.log('Found', snapshot.docs.length, 'payments');
    
    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Payment data:', data);
      
      // Convert Firestore Timestamp to JavaScript Date
      const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      
      return {
        id: doc.id,
        ...data,
        date: date
      };
    }) as Payment[];
    
    // Sort the payments by date in descending order (most recent first)
    payments.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    console.log('Processed payments:', payments);
    return payments;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Group functions
export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
  try {
    const group = {
      ...groupData,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'groups'), group);
    return { id: docRef.id, ...group };
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getGroup = async (groupId: string) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      const data = groupDoc.data();
      return { id: groupDoc.id, ...data } as Group;
    }
    return null;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

export const getUserGroups = (userEmail: string, callback: (groups: Group[]) => void) => {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userEmail)
  );

  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Group[];
    callback(groups);
  });
};

export const joinGroup = async (groupCode: string, userEmail: string) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('code', '==', groupCode.toUpperCase())
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const groupDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(userEmail),
      });
      return { id: groupDoc.id, ...groupDoc.data() } as Group;
    }
    throw new Error('Group not found');
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const addMemberToGroup = async (groupId: string, memberEmail: string) => {
  try {
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayUnion(memberEmail),
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Expense functions
export const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
  try {
    console.log('Firebase: addExpense called');
    console.log('Firebase: Expense data received:', expenseData);
    
    const expense = {
      ...expenseData,
      createdAt: new Date(),
    };
    
    console.log('Firebase: Prepared expense object:', expense);
    console.log('Firebase: Adding document to expenses collection');
    
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    console.log('Firebase: Document added successfully with ID:', docRef.id);
    
    const newExpense = { id: docRef.id, ...expense };
    console.log('Firebase: Returning new expense:', newExpense);
    
    // Update group balance
    console.log('Firebase: Updating group balance for groupId:', expenseData.groupId);
    await updateGroupBalance(expenseData.groupId);
    console.log('Firebase: Group balance updated successfully');
    
    return newExpense;
  } catch (error) {
    console.error('Firebase: Error adding expense:', error);
    console.error('Firebase: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

export const getGroupExpenses = (groupId: string, callback: (expenses: Expense[]) => void) => {
  console.log('Firebase: getGroupExpenses called for groupId:', groupId);
  
  if (!groupId) {
    console.error('Firebase: getGroupExpenses - No groupId provided');
    callback([]);
    return () => {};
  }
  
  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    console.log('Firebase: getGroupExpenses - Query created, setting up listener');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firebase: getGroupExpenses snapshot received, docs count:', snapshot.docs.length);
      
      try {
        const expenses = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Firebase: Processing expense doc:', doc.id, data);
          
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          };
        }) as Expense[];
        
        console.log('Firebase: getGroupExpenses processed expenses:', expenses);
        callback(expenses);
      } catch (error) {
        console.error('Firebase: getGroupExpenses - Error processing expenses:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Firebase: getGroupExpenses error:', error);
      callback([]);
    });

    console.log('Firebase: getGroupExpenses - Listener set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('Firebase: getGroupExpenses - Error setting up listener:', error);
    callback([]);
    return () => {};
  }
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
  try {
    await updateDoc(doc(db, 'expenses', expenseId), updates);
    
    // Update group balance if expense amount changed
    if (updates.amount || updates.splits) {
      const expense = await getDoc(doc(db, 'expenses', expenseId));
      if (expense.exists()) {
        await updateGroupBalance(expense.data().groupId);
      }
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string, groupId: string) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    
    // Update group balance
    await updateGroupBalance(groupId);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Settlement functions
export const addSettlement = async (settlementData: Omit<Settlement, 'id' | 'date'>) => {
  try {
    const settlement = {
      ...settlementData,
      date: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'settlements'), settlement);
    return { id: docRef.id, ...settlement };
  } catch (error) {
    console.error('Error adding settlement:', error);
    throw error;
  }
};

export const getGroupSettlements = (groupId: string, callback: (settlements: Settlement[]) => void) => {
  const q = query(
    collection(db, 'settlements'),
    where('groupId', '==', groupId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const settlements = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      };
    }) as Settlement[];
    callback(settlements);
  });
};

// Borrow Request functions
export const addBorrowRequest = async (requestData: Omit<BorrowRequest, 'id' | 'date'>) => {
  try {
    const request = {
      ...requestData,
      date: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'borrowRequests'), request);
    return { id: docRef.id, ...request };
  } catch (error) {
    console.error('Error adding borrow request:', error);
    throw error;
  }
};

export const getGroupBorrowRequests = (groupId: string, callback: (requests: BorrowRequest[]) => void) => {
  const q = query(
    collection(db, 'borrowRequests'),
    where('groupId', '==', groupId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      };
    }) as BorrowRequest[];
    callback(requests);
  });
};

export const updateBorrowRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, 'borrowRequests', requestId), { status });
  } catch (error) {
    console.error('Error updating borrow request status:', error);
    throw error;
  }
};

// Group Message functions
export const addGroupMessage = async (messageData: Omit<GroupMessage, 'id' | 'timestamp'>) => {
  try {
    const message = {
      ...messageData,
      timestamp: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'groupMessages'), message);
    return { id: docRef.id, ...message };
  } catch (error) {
    console.error('Error adding group message:', error);
    throw error;
  }
};

export const getGroupMessages = (groupId: string, callback: (messages: GroupMessage[]) => void) => {
  const q = query(
    collection(db, 'groupMessages'),
    where('groupId', '==', groupId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
      };
    }) as GroupMessage[];
    callback(messages);
  });
};

// Balance calculation functions
export const calculateUserBalances = async (userEmail: string) => {
  try {
    console.log('Starting balance calculation for user:', userEmail);
    
    // Get all groups the user is a member of
    const userGroupsSnapshot = await getDocs(
      query(collection(db, 'groups'), where('members', 'array-contains', userEmail))
    );
    
    const userGroups = userGroupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    console.log('User groups found:', userGroups);
    
    let totalOwe = 0;
    let totalOwed = 0;
    const groupBalances: Record<string, number> = {};
    
    // Calculate balance for each group
    for (const group of userGroups) {
      console.log('Processing group:', group.name, 'ID:', group.id);
      
      // Get all expenses for this group
      const expensesSnapshot = await getDocs(
        query(collection(db, 'expenses'), where('groupId', '==', group.id))
      );
      
      const expenses = expensesSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to JavaScript Date
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return { ...data, date } as Expense;
      });
      console.log('Expenses found for group', group.name, ':', expenses);
      
      // Create a mapping from user email to user ID for this group
      // Since we don't have a direct mapping, we'll need to infer it from the expense data
      // For now, let's assume the user ID is the index of the user email in the group members array
      const userIndex = group.members.indexOf(userEmail);
      const userId = userIndex >= 0 ? (userIndex + 1).toString() : null;
      
      console.log('User email:', userEmail, 'User index in group:', userIndex, 'User ID:', userId);
      
      if (!userId) {
        console.log('User not found in group members, skipping group');
        continue;
      }
      
      let userBalance = 0;
      
      expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        const totalAmount = expense.amount;
        
        console.log('Processing expense:', expense.description, 'Amount:', totalAmount, 'Paid by:', paidBy);
        console.log('User ID:', userId, 'Paid by matches user:', paidBy === userId);
        console.log('Expense splits:', expense.splits);
        console.log('User ID in splits:', userId, 'User split amount:', expense.splits[userId]);
        
        // If user paid for this expense, add the amount they paid
        if (paidBy === userId) {
          userBalance += totalAmount;
          console.log('User paid for this expense, adding:', totalAmount, 'New balance:', userBalance);
        }
        
        // Subtract what the user owes (their share)
        if (expense.splits[userId]) {
          userBalance -= expense.splits[userId];
          console.log('User owes share:', expense.splits[userId], 'New balance:', userBalance);
        }
      });
      
      groupBalances[group.id] = userBalance;
      console.log('Final balance for group', group.name, ':', userBalance);
      
      // Add to totals
      if (userBalance < 0) {
        totalOwe += Math.abs(userBalance);
        console.log('Adding to totalOwe:', Math.abs(userBalance), 'New totalOwe:', totalOwe);
      } else if (userBalance > 0) {
        totalOwed += userBalance;
        console.log('Adding to totalOwed:', userBalance, 'New totalOwed:', totalOwed);
      }
    }
    
    const result = {
      totalOwe,
      totalOwed,
      netBalance: totalOwed - totalOwe,
      groupBalances
    };
    
    console.log('Final balance calculation result:', result);
    return result;
  } catch (error) {
    console.error('Error calculating user balances:', error);
    return {
      totalOwe: 0,
      totalOwed: 0,
      netBalance: 0,
      groupBalances: {}
    };
  }
};

export const updateGroupBalance = async (groupId: string) => {
  try {
    // Get all expenses for the group
    const expensesSnapshot = await getDocs(
      query(collection(db, 'expenses'), where('groupId', '==', groupId))
    );
    
    const expenses = expensesSnapshot.docs.map(doc => doc.data() as Expense);
    
    // Calculate member balances
    const memberBalances: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const totalAmount = expense.amount;
      
      // Add what they paid
      memberBalances[paidBy] = (memberBalances[paidBy] || 0) + totalAmount;
      
      // Subtract what they owe
      Object.entries(expense.splits).forEach(([memberId, share]) => {
        memberBalances[memberId] = (memberBalances[memberId] || 0) - share;
      });
    });
    
    // Update group with calculated balances
    await updateDoc(doc(db, 'groups', groupId), {
      memberBalances,
      lastBalanceUpdate: new Date(),
    });
    
    return memberBalances;
  } catch (error) {
    console.error('Error updating group balance:', error);
    throw error;
  }
};

// Test function to check Firestore write permissions
export const testFirestoreWrite = async () => {
  try {
    console.log('Testing Firestore write permissions...');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Test write from SplitEase app'
    };
    
    const docRef = await addDoc(collection(db, 'test'), testDoc);
    console.log('Test write successful, document ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('Test write failed:', error);
    return false;
  }
};

// Function to check what's in the database
export const checkDatabaseContents = async () => {
  try {
    console.log('=== CHECKING DATABASE CONTENTS ===');
    
    // Check payments collection
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));
    console.log('Payments in database:', paymentsSnapshot.docs.length);
    paymentsSnapshot.docs.forEach((doc, index) => {
      console.log(`Payment ${index + 1}:`, { id: doc.id, ...doc.data() });
    });
    
    // Check groups collection
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    console.log('Groups in database:', groupsSnapshot.docs.length);
    groupsSnapshot.docs.forEach((doc, index) => {
      console.log(`Group ${index + 1}:`, { id: doc.id, ...doc.data() });
    });

    // Check expenses collection
    const expensesSnapshot = await getDocs(collection(db, 'expenses'));
    console.log('Expenses in database:', expensesSnapshot.docs.length);
    expensesSnapshot.docs.forEach((doc, index) => {
      console.log(`Expense ${index + 1}:`, { id: doc.id, ...doc.data() });
    });

    // Check settlements collection
    const settlementsSnapshot = await getDocs(collection(db, 'settlements'));
    console.log('Settlements in database:', settlementsSnapshot.docs.length);
    settlementsSnapshot.docs.forEach((doc, index) => {
      console.log(`Settlement ${index + 1}:`, { id: doc.id, ...doc.data() });
    });

    // Check borrowRequests collection
    const borrowRequestsSnapshot = await getDocs(collection(db, 'borrowRequests'));
    console.log('Borrow requests in database:', borrowRequestsSnapshot.docs.length);
    borrowRequestsSnapshot.docs.forEach((doc, index) => {
      console.log(`Borrow request ${index + 1}:`, { id: doc.id, ...doc.data() });
    });

    // Check groupMessages collection
    const messagesSnapshot = await getDocs(collection(db, 'groupMessages'));
    console.log('Group messages in database:', messagesSnapshot.docs.length);
    messagesSnapshot.docs.forEach((doc, index) => {
      console.log(`Message ${index + 1}:`, { id: doc.id, ...doc.data() });
    });
    
  } catch (error) {
    console.error('Error checking database contents:', error);
  }
};

// Test function to check if we can write to groupMessages
export const testGroupMessagesWrite = async (groupId: string) => {
  try {
    console.log('Testing groupMessages write for groupId:', groupId);
    
    const testMessage = {
      groupId,
      userId: 'test-user',
      userName: 'Test User',
      userAvatar: 'T',
      message: 'Test message',
      timestamp: serverTimestamp(),
      type: 'text',
      reactions: {}
    };
    
    const docRef = await addDoc(collection(db, 'groupMessages'), testMessage);
    console.log('Successfully wrote test message with ID:', docRef.id);
    
    // Clean up the test message
    await deleteDoc(docRef);
    console.log('Cleaned up test message');
    
    return true;
  } catch (error) {
    console.error('Error testing groupMessages write:', error);
    return false;
  }
};

// Debug function to check database contents
export const debugDatabaseContents = async (userEmail: string) => {
  try {
    console.log('=== DEBUG: Checking database contents ===');
    console.log('User email:', userEmail);
    
    // Check groups
    console.log('\n--- Checking Groups ---');
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    const allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('All groups in database:', allGroups);
    
    // Check user's groups
    const userGroupsSnapshot = await getDocs(
      query(collection(db, 'groups'), where('members', 'array-contains', userEmail))
    );
    const userGroups = userGroupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('User groups:', userGroups);
    
    // Check expenses
    console.log('\n--- Checking Expenses ---');
    const expensesSnapshot = await getDocs(collection(db, 'expenses'));
    const allExpenses = expensesSnapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      return { id: doc.id, ...data, date };
    });
    console.log('All expenses in database:', allExpenses);
    
    // Check expenses for user's groups
    for (const group of userGroups) {
      console.log(`\n--- Expenses for group: ${(group as any).name} (${group.id}) ---`);
      const groupExpensesSnapshot = await getDocs(
        query(collection(db, 'expenses'), where('groupId', '==', group.id))
      );
      const groupExpenses = groupExpensesSnapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return { id: doc.id, ...data, date };
      });
      console.log('Group expenses:', groupExpenses);
      
      // Show detailed expense breakdown
      console.log('\n--- Detailed Expense Breakdown ---');
      groupExpenses.forEach((expense: any, index) => {
        console.log(`\nExpense ${index + 1}:`);
        console.log('  Description:', expense.description);
        console.log('  Amount:', expense.amount);
        console.log('  Paid by:', expense.paidBy);
        console.log('  Paid by name:', expense.paidByName);
        console.log('  Splits:', expense.splits);
        console.log('  User email:', userEmail);
        console.log('  User paid for this expense:', expense.paidBy === userEmail);
        console.log('  User owes amount:', expense.splits[userEmail] || 0);
      });
    }
    
    console.log('\n=== END DEBUG ===');
    
    return {
      allGroups,
      userGroups,
      allExpenses
    };
  } catch (error) {
    console.error('Error in debug function:', error);
    throw error;
  }
};
