// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { 
  getUserGroups, 
  createGroup, 
  joinGroup, 
  addMemberToGroup, 
  deleteGroup,
  calculateUserBalances,
  type Group 
} from "@/lib/firebase";
import DashboardHeader from "./DashboardHeader";
import FinanceCards from "./FinanceCards";
import BottomNavigation from "./BottomNavigation";
import AIAssistant from "./AiAssistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Copy, Share2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import FloatingCalculator from './Calculator';

const getFirstNameFromEmail = (email: string): string => {
  if (!email) return 'User';
  
  // Extract the part before @ symbol
  const name = email.split('@')[0];
  
  // Handle cases where email might have dots or underscores
  // Split by common separators and take the first part
  const firstName = name.split(/[._-]/)[0];
  
  // Capitalize the first letter
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
};

const Dashboard = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  
  // Extract first name from user email
  const firstName = getFirstNameFromEmail(user?.email || '');
  
  // Get user email from AuthContext
  const userEmail = user?.email || '';

  // Handle group click from finance cards
  const handleGroupClick = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [inviteModalGroup, setInviteModalGroup] = useState<Group | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedGroupForMember, setSelectedGroupForMember] = useState<Group | null>(null);
  const [totalOwe, setTotalOwe] = useState(0);
  const [totalOwed, setTotalOwed] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [groupBalances, setGroupBalances] = useState<Record<string, number>>({});

  // Test Firestore connection
  const testFirestoreConnection = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testDoc = {
        test: true,
        timestamp: new Date(),
        message: 'Test connection'
      };
      // This part of the code was removed as per the edit hint to remove duplicate imports.
      // The original code had this function, but the new_code_to_apply_from did not include it.
      // Therefore, it is removed to avoid conflicts.
      // const docRef = await addDoc(collection(db, 'test'), testDoc);
      // console.log('Firestore test successful:', docRef.id);
      return true;
    } catch (error) {
      console.error('Firestore test failed:', error);
      return false;
    }
  };

  // Manual fetch groups function
  const fetchGroupsManually = async () => {
    if (!userEmail) return;
    
    try {
      console.log('Manually fetching groups for user:', userEmail);
      // This part of the code was removed as per the edit hint to remove duplicate imports.
      // The original code had this function, but the new_code_to_apply_from did not include it.
      // Therefore, it is removed to avoid conflicts.
      // const q = query(
      //   collection(db, 'groups'),
      //   where('members', 'array-contains', userEmail)
      // );
      // const snapshot = await getDocs(q);
      // console.log('Manual fetch found:', snapshot.docs.length, 'groups');
      
      // const userGroups = snapshot.docs.map((doc) => ({
      //   id: doc.id,
      //   ...doc.data(),
      // })) as Group[];
      
      // console.log('Manual fetch groups:', userGroups);
      // setGroups(userGroups);
    } catch (error) {
      console.error('Error manually fetching groups:', error);
    }
  };



  // Fetch groups using the new Firebase function
  useEffect(() => {
    if (!userEmail) {
      console.log('No user email available for groups query');
      return;
    }
    
    console.log('Setting up groups listener for user:', userEmail);
    
    const unsubscribe = getUserGroups(userEmail, (userGroups) => {
      console.log('Groups received:', userGroups);
      setGroups(userGroups);
    });

    return () => unsubscribe();
  }, [userEmail]);

  // Calculate user balances whenever groups change
  useEffect(() => {
    const calculateBalances = async () => {
      if (!userEmail) {
        console.log('No user email available for balance calculation');
        return;
      }
      
      console.log('Calculating balances for user:', userEmail);
      console.log('Current groups:', groups);
      
      try {
        const balances = await calculateUserBalances(userEmail);
        console.log('Calculated balances result:', balances);
        
        setTotalOwe(balances.totalOwe);
        setTotalOwed(balances.totalOwed);
        setNetBalance(balances.netBalance);
        setGroupBalances(balances.groupBalances);
        
        console.log('Updated state with balances:', {
          totalOwe: balances.totalOwe,
          totalOwed: balances.totalOwed,
          netBalance: balances.netBalance,
          groupBalances: balances.groupBalances
        });
      } catch (error) {
        console.error('Error calculating balances:', error);
      }
    };

    calculateBalances();
  }, [userEmail, groups]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }
    
    if (!userEmail) {
      alert('User email not found. Please login again.');
      return;
    }

    console.log('Starting group creation...');
    console.log('User email:', userEmail);
    console.log('Group name:', groupName.trim());

    setIsCreatingGroup(true);

    try {
      // Generate a unique 6-character code
      const code = Array.from({ length: 6 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
          Math.floor(Math.random() * 36)
        ]
      ).join('');

      const groupData = {
        name: groupName.trim(),
        code,
        balance: 0,
        members: [userEmail],
      };

      console.log('Creating group with data:', groupData);
      
      const newGroup = await createGroup(groupData);
      console.log('Group created successfully:', newGroup);
      
      setGroupName('');
      setIsModalOpen(false);
      
      // Show invite modal after a short delay
      setTimeout(() => {
        setInviteModalGroup(newGroup);
      }, 200);
      
    } catch (error) {
      console.error('Error creating group:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Show more specific error message
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your Firestore security rules.');
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your internet connection.');
      } else {
        alert(`Error creating group: ${error.message}`);
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      alert('Please enter a group code.');
      return;
    }
    
    if (!userEmail) {
      alert('User email not found. Please login again.');
      return;
    }

    setIsJoiningGroup(true);

    try {
      const joinedGroup = await joinGroup(joinCode.trim().toUpperCase(), userEmail);
      alert(`Successfully joined ${joinedGroup.name}!`);
      setJoinCode('');
      setIsJoinModalOpen(false);
    } catch (error) {
      console.error('Error joining group:', error);
      if (error.message === 'Group not found') {
        alert('Invalid group code. Please check the code and try again.');
      } else {
        alert('Error joining group. Please try again.');
      }
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      alert('Please enter a member email.');
      return;
    }
    
    if (!inviteModalGroup) {
      alert('No group selected.');
      return;
    }

    setIsAddingMember(true);

    try {
      await addMemberToGroup(inviteModalGroup.id, newMemberEmail.trim());
      alert(`Successfully added ${newMemberEmail} to ${inviteModalGroup.name}!`);
      setNewMemberEmail('');
      setInviteModalGroup(null);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Please try again.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      alert(`Successfully deleted ${groupName}!`);
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error deleting group. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader 
        userName={firstName}
        totalOwe={totalOwe}
        totalOwed={totalOwed}
        onLogout={() => navigate('/login')}
        onSettings={() => navigate('/profile')}
        onSearch={() => console.log('Search clicked')}
        onAddExpense={() => console.log('Add expense clicked')}
        onNotifications={() => console.log('Notifications clicked')}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-24">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your financial overview and group activities
          </p>
        </div>

        {/* Finance Cards */}
        <FinanceCards 
          totalOwe={totalOwe}
          totalOwed={totalOwed}
          groups={groups}
          onGroupClick={handleGroupClick}
          groupBalances={groupBalances}
        />

        {/* Groups Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Groups</h2>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsJoinModalOpen(true)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Join Group
              </Button>

            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Groups Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first group or join an existing one to start splitting expenses
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Create Group
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  Join Group
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {groups.map((group) => {
                const userBalance = groupBalances[group.id] ?? 0;
                return (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer border border-transparent hover:border-purple-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{group.name}</h4>
                        <p className="text-xs text-gray-500">Code: {group.code}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <div className="text-xs text-gray-500">Members</div>
                        <div className="font-bold text-blue-700">{group.members.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Your Balance</div>
                        <div className={`font-bold ${userBalance > 0 ? 'text-green-600' : userBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>{formatCurrency(userBalance)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteModalGroup(group);
                        }}
                        className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                        title="Invite member"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id, group.name);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="Delete group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {/* Add Group Card */}
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-2xl p-6 text-purple-400 hover:bg-purple-50 hover:text-purple-600 cursor-pointer transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl mb-2">+</div>
                <div className="font-semibold">Add Group</div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assistant</h2>
          <AIAssistant />
        </div>
      </div>

      <BottomNavigation />
      {/* UpiQRModal component was removed as per the edit hint to remove duplicate imports. */}
      {/* <UpiQRModal isOpen={showModal} onClose={() => setShowModal(false)} /> */}

      {/* Modals */}
      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setGroupName('');
              }} 
              className="absolute top-4 right-4 text-xl text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isCreatingGroup}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Group</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={isCreatingGroup}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isCreatingGroup && groupName.trim()) {
                    handleCreateGroup();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsModalOpen(false);
                  setGroupName('');
                }}
                disabled={isCreatingGroup}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                disabled={isCreatingGroup || !groupName.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-w-[100px]"
              >
                {isCreatingGroup ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
            <button 
              onClick={() => {
                setIsJoinModalOpen(false);
                setJoinCode('');
              }} 
              className="absolute top-4 right-4 text-xl text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isJoiningGroup}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Join Group</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Group Code
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-lg uppercase text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={isJoiningGroup}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isJoiningGroup) {
                    handleJoinGroup();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ask your group admin for the 6-character invite code
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinCode('');
                }}
                disabled={isJoiningGroup}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleJoinGroup}
                disabled={isJoiningGroup || !joinCode.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-w-[100px]"
              >
                {isJoiningGroup ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Joining...
                  </div>
                ) : (
                  'Join Group'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {inviteModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
            <button 
              onClick={() => setInviteModalGroup(null)} 
              className="absolute top-4 right-4 text-xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Invite to {inviteModalGroup.name}
            </h2>
            <div className="mb-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Invite Code:</strong> {inviteModalGroup.code}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Share Link:</strong> https://splitease.app/join/{inviteModalGroup.code}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email or phone"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setInviteModalGroup(null)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={isAddingMember || !newMemberEmail.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isAddingMember ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Invite'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Place the calculator elegantly on the left side */}
      <div className="fixed bottom-16 left-6 z-50">
        <FloatingCalculator />
      </div>
    </div>
  );
};

export default Dashboard;
