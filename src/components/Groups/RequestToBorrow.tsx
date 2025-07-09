import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BorrowRequest {
  id: string;
  groupId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  amount: number;
  reason: string;
  status: 'pending' | 'funded' | 'completed' | 'cancelled';
  contributors: {
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    timestamp: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  suggestedAmount: number;
  userId: string;
}

interface RequestToBorrowProps {
  groupId?: string;
  groupName?: string;
}

const RequestToBorrow = ({ groupId, groupName }: RequestToBorrowProps) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeRequests, setActiveRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch group members
  useEffect(() => {
    if (!groupId) return;

    const membersQuery = query(
      collection(db, 'groups'),
      where('id', '==', groupId)
    );

    const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
      if (!snapshot.empty) {
        const groupData = snapshot.docs[0].data();
        const members = groupData.members || [];
        
        const memberObjects: GroupMember[] = members.map((memberEmail: string, index: number) => ({
          id: `member-${index}`,
          name: memberEmail.split('@')[0] || memberEmail,
          avatar: (memberEmail.split('@')[0] || memberEmail).charAt(0).toUpperCase(),
          suggestedAmount: Math.floor(Math.random() * 200) + 50,
          userId: memberEmail
        }));

        setGroupMembers(memberObjects);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  // Fetch active requests
  useEffect(() => {
    if (!groupId) return;

    const requestsQuery = query(
      collection(db, 'borrowRequests'),
      where('groupId', '==', groupId),
      where('status', 'in', ['pending', 'funded']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BorrowRequest[];
      
      setActiveRequests(requests);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching requests:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const toggleContributor = (memberId: string) => {
    setSelectedContributors(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSendRequest = async () => {
    if (!amount || selectedContributors.length === 0 || !user || !groupId) {
      toast({
        title: "Missing information",
        description: "Please fill in amount and select contributors",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const requestData = {
        groupId,
        requesterId: user.uid || user.email,
        requesterName: user.displayName || user.email || 'Anonymous',
        requesterAvatar: (user.displayName || user.email || 'A').charAt(0).toUpperCase(),
        amount: parseFloat(amount),
        reason: reason.trim() || 'No reason provided',
        status: 'pending' as const,
        contributors: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'borrowRequests'), requestData);

      // Reset form
      setAmount("");
      setReason("");
      setSelectedContributors([]);

      toast({
        title: "Request sent successfully!",
        description: "Your borrow request has been sent to the group",
      });

    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error sending request",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden">
        <div className="bg-gradient-primary p-4 text-white">
          <h3 className="text-lg font-bold">💰 Request to Borrow</h3>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {/* New Request Form */}
      <div className="bg-white/80 backdrop-blur-glass rounded-2xl p-6 shadow-glass border border-white/20">
        <h2 className="text-xl font-bold text-foreground mb-4">🪙 Request to Borrow</h2>
        
        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Amount Needed</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-glass border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
            />
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What do you need this for?"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-glass border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
          />
        </div>

        {/* Contributors Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">Select Contributors</label>
          <div className="grid grid-cols-2 gap-3">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => toggleContributor(member.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedContributors.includes(member.id)
                    ? "border-primary bg-gradient-glow/20"
                    : "border-border bg-white/40"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{member.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Suggested: ${member.suggestedAmount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Request Button */}
        <Button 
          onClick={handleSendRequest}
            disabled={!amount || selectedContributors.length === 0 || submitting}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
          <Send className="w-4 h-4 mr-2" />
          Send Request
              </>
            )}
        </Button>
      </div>

      {/* Active Requests */}
      <div className="bg-white/80 backdrop-blur-glass rounded-2xl p-6 shadow-glass border border-white/20">
        <h3 className="text-lg font-bold text-foreground mb-4">📋 Active Requests</h3>
        
        <div className="space-y-4">
          {activeRequests.map((request) => {
            const totalContributed = request.contributors.reduce((sum, c) => sum + c.amount, 0);
            const progressPercentage = (totalContributed / request.amount) * 100;
            
            return (
            <div key={request.id} className="p-4 bg-muted/30 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-medium text-foreground">{request.requesterName} needs ${request.amount}</p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                  </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">${totalContributed}/${request.amount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Contributors */}
                {request.contributors.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex space-x-2">
                  {request.contributors.map((contributor, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{contributor.userAvatar}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">${contributor.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
                )}

              {/* Action Buttons */}
                {totalContributed < request.amount && (
                <div className="flex space-x-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Contribute
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remind
                  </Button>
                </div>
              )}

                {totalContributed >= request.amount && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-sm font-medium text-center">✅ Fully Funded!</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RequestToBorrow;