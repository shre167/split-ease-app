import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, Smile } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Timestamp;
  type: "text" | "expense" | "settlement";
  reactions?: { [key: string]: string[] };
}

interface GroupChatProps {
  groupId?: string;
  groupName?: string;
}

const GroupChat = ({ groupId, groupName }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    console.log('Setting up message listener for groupId:', groupId);

    // Try different query approaches to find the right field name
    let messagesQuery;
    
    // First, let's check what's actually in the database
    const checkDatabase = async () => {
      try {
        const allMessagesSnapshot = await getDocs(collection(db, 'groupMessages'));
        console.log(`Total messages in database: ${allMessagesSnapshot.docs.length}`);
        
        if (allMessagesSnapshot.docs.length > 0) {
          const firstMessage = allMessagesSnapshot.docs[0].data();
          console.log('Sample message structure:', firstMessage);
          
          // Check which field contains the group ID
          if (firstMessage.groupId) {
            console.log('Using groupId field');
            messagesQuery = query(
              collection(db, 'groupMessages'),
              where('groupId', '==', groupId),
              orderBy('timestamp', 'asc')
            );
          } else if (firstMessage.group) {
            console.log('Using group field');
            messagesQuery = query(
              collection(db, 'groupMessages'),
              where('group', '==', groupId),
              orderBy('timestamp', 'asc')
            );
          } else {
            console.log('No group field found, using all messages');
            messagesQuery = query(
              collection(db, 'groupMessages'),
              orderBy('timestamp', 'asc')
            );
          }
        } else {
          console.log('No messages in database, using groupId field');
          messagesQuery = query(
            collection(db, 'groupMessages'),
            where('groupId', '==', groupId),
            orderBy('timestamp', 'asc')
          );
        }
        
        // Set up the listener with the determined query
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          console.log('Received message snapshot with', snapshot.docs.length, 'messages');
          const newMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Message data:', { id: doc.id, ...data });
            return {
              id: doc.id,
              ...data
            };
          }) as Message[];
          
          console.log('Processed messages:', newMessages);
          setMessages(newMessages);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to messages:', error);
          setLoading(false);
          toast({
            title: "Error loading messages",
            description: "Please check your connection and try again",
            variant: "destructive",
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error checking database structure:', error);
        setLoading(false);
        return () => {};
      }
    };

    checkDatabase().then(unsubscribe => {
      return unsubscribe;
    });

  }, [groupId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !groupId || sending) return;

    const messageText = newMessage.trim();
      setNewMessage("");
    setSending(true);

    try {
      const messageData = {
        groupId,
        userId: user.uid || user.email,
        userName: user.displayName || user.email || 'Anonymous',
        userAvatar: (user.displayName || user.email || 'A').charAt(0).toUpperCase(),
        message: messageText,
        timestamp: serverTimestamp(),
        type: 'text' as const,
        reactions: {}
      };

      console.log('Sending message:', messageData);
      await addDoc(collection(db, 'groupMessages'), messageData);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive",
      });
      // Restore the message if sending failed
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteAllMessages = async () => {
    if (!groupId) {
      toast({
        title: "Error",
        description: "No group ID available",
        variant: "destructive",
      });
      return;
    }

    // Add confirmation
    if (!confirm(`Are you sure you want to delete all ${messages.length} messages? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('=== STARTING MESSAGE DELETION ===');
      console.log('GroupId:', groupId);
      console.log('Current messages count:', messages.length);
      
      // First, let's see what's actually in the database
      console.log('=== CHECKING ALL MESSAGES IN DATABASE ===');
      const allMessagesSnapshot = await getDocs(collection(db, 'groupMessages'));
      console.log(`Total messages in database: ${allMessagesSnapshot.docs.length}`);
      
      allMessagesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Message ${index + 1}:`, { id: doc.id, ...data });
      });
      
      // Try different query approaches
      console.log('=== TRYING DIFFERENT QUERIES ===');
      
      // Query 1: Using groupId field
      const messagesQuery1 = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', groupId)
      );
      const snapshot1 = await getDocs(messagesQuery1);
      console.log(`Query 1 (groupId): Found ${snapshot1.docs.length} messages`);
      
      // Query 2: Using group field (if that's what it's called)
      const messagesQuery2 = query(
        collection(db, 'groupMessages'),
        where('group', '==', groupId)
      );
      const snapshot2 = await getDocs(messagesQuery2);
      console.log(`Query 2 (group): Found ${snapshot2.docs.length} messages`);
      
      // Query 3: No filter - get all messages
      const messagesQuery3 = query(collection(db, 'groupMessages'));
      const snapshot3 = await getDocs(messagesQuery3);
      console.log(`Query 3 (no filter): Found ${snapshot3.docs.length} messages`);
      
      // Use the query that found messages, or fall back to all messages
      let messagesToDelete = snapshot1.docs;
      if (snapshot1.docs.length === 0 && snapshot2.docs.length > 0) {
        messagesToDelete = snapshot2.docs;
        console.log('Using Query 2 results');
      } else if (snapshot1.docs.length === 0 && snapshot2.docs.length === 0) {
        messagesToDelete = snapshot3.docs;
        console.log('Using Query 3 results (all messages)');
      }
      
      console.log(`Final messages to delete: ${messagesToDelete.length}`);
      
      if (messagesToDelete.length === 0) {
        toast({
          title: "No messages found",
          description: "There are no messages to delete",
        });
        return;
      }
      
      // Log each message being deleted
      messagesToDelete.forEach((doc, index) => {
        console.log(`Message ${index + 1}:`, { id: doc.id, ...doc.data() });
      });
      
      // Delete each message individually with error handling
      let deletedCount = 0;
      let errorCount = 0;
      
      for (const doc of messagesToDelete) {
        try {
          console.log(`Deleting message: ${doc.id}`);
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`Successfully deleted message: ${doc.id}`);
        } catch (error) {
          console.error(`Failed to delete message ${doc.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`=== DELETION COMPLETE ===`);
      console.log(`Successfully deleted: ${deletedCount} messages`);
      console.log(`Failed to delete: ${errorCount} messages`);
      
      if (errorCount > 0) {
        toast({
          title: "Partial deletion",
          description: `Deleted ${deletedCount} messages, ${errorCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Deleted ${deletedCount} messages`,
        });
      }
      
      // Force refresh the messages list
      setMessages([]);
      
    } catch (error) {
      console.error('Error in deleteAllMessages:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Error deleting messages",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const debugMessages = async () => {
    try {
      console.log('=== DEBUGGING ALL MESSAGES ===');
      console.log('Current groupId:', groupId);
      console.log('Current messages in state:', messages.length);
      
      // Get all messages from database
      const allMessagesSnapshot = await getDocs(collection(db, 'groupMessages'));
      console.log(`Total messages in database: ${allMessagesSnapshot.docs.length}`);
      
      // Show all messages
      allMessagesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Message ${index + 1}:`, { id: doc.id, ...data });
      });
      
      // Check which messages belong to this group
      const groupMessages = allMessagesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.groupId === groupId || data.group === groupId;
      });
      
      console.log(`Messages for this group: ${groupMessages.length}`);
      groupMessages.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Group message ${index + 1}:`, { id: doc.id, ...data });
      });
      
      toast({
        title: "Debug complete",
        description: `Found ${allMessagesSnapshot.docs.length} total messages, ${groupMessages.length} for this group`,
      });
    } catch (error) {
      console.error('Debug failed:', error);
      toast({
        title: "Debug failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.userId === (user?.uid || user?.email);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden">
        <div className="bg-gradient-primary p-4 text-white">
          <h3 className="text-lg font-bold">💬 {groupName || 'Group Chat'}</h3>
          <p className="text-white/80 text-sm">Loading messages...</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-glass rounded-2xl shadow-glass border border-white/20 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-primary p-4 text-white">
        <h3 className="text-lg font-bold">💬 {groupName || 'Group Chat'}</h3>
        <p className="text-white/80 text-sm">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages Container */}
      <div className="h-80 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-muted-foreground font-medium">No messages yet</p>
            <p className="text-muted-foreground text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div>
            {messages
              .filter(message => message && message.id && message.message && message.type === "text")
              .map((message, index) => {
                const ownMessage = isOwnMessage(message);
                const showAvatar = index === 0 || 
                  messages[index - 1]?.userId !== message.userId;
                
                return (
                  <div key={message.id} className="mb-4">
                    {ownMessage ? (
                      // Own message - right side
                      <div className="flex justify-end">
                        <div className="flex items-end space-x-2 max-w-[80%]">
                          <div className="flex flex-col items-end">
                            <div className="bg-gradient-primary text-white px-4 py-2 rounded-2xl rounded-br-md">
                              <p className="text-sm">{message.message}</p>
                </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {message.timestamp ? formatTimestamp(message.timestamp) : 'Unknown time'}
                            </span>
                  </div>
                          {showAvatar && (
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-semibold">
                                {message.userAvatar || 'U'}
                          </span>
                      </div>
                    )}
                  </div>
                </div>
                    ) : (
                      // Other user's message - left side
                      <div className="flex justify-start">
                        <div className="flex items-end space-x-2 max-w-[80%]">
                          {showAvatar && (
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-semibold">
                                {message.userAvatar || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col items-start">
                            {showAvatar && (
                              <span className="text-xs text-muted-foreground mb-1">
                                {message.userName || 'Unknown User'}
                              </span>
                            )}
                            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md">
                              <p className="text-sm">{message.message}</p>
              </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {message.timestamp ? formatTimestamp(message.timestamp) : 'Unknown time'}
                            </span>
                  </div>
                </div>
              </div>
            )}
          </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-end space-x-3">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-glass border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none pr-12"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={sending}
            />
            <button className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="flex-shrink-0 w-10 h-10 bg-gradient-primary hover:bg-gradient-primary/90 text-white"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
            <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Debug Info (temporary) */}
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p><strong>Debug:</strong> GroupId: {groupId || 'Not provided'} | User: {user?.email || 'Not logged in'} | Messages: {messages.length}</p>
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={async () => {
                try {
                  const testMessage = {
                    groupId,
                    userId: user?.uid || user?.email || 'test',
                    userName: user?.displayName || user?.email || 'Test User',
                    userAvatar: 'T',
                    message: 'Test message from debug button',
                    timestamp: serverTimestamp(),
                    type: 'text' as const,
                    reactions: {}
                  };
                  await addDoc(collection(db, 'groupMessages'), testMessage);
                  toast({
                    title: "Test message sent",
                    description: "Check if it appears in the chat",
                  });
                } catch (error) {
                  console.error('Test message failed:', error);
                  toast({
                    title: "Test failed",
                    description: error.message,
                    variant: "destructive",
                  });
                }
              }}
              className="text-blue-600 underline"
            >
              Send Test Message
            </button>
            <button 
              onClick={deleteAllMessages}
              className="text-red-600 underline"
            >
              Delete All Messages
            </button>
            <button 
              onClick={async () => {
                try {
                  console.log('=== TESTING DATABASE ACCESS ===');
                  console.log('User:', user?.email);
                  console.log('GroupId:', groupId);
                  
                  // Test write access
                  const testDoc = await addDoc(collection(db, 'test'), {
                    test: true,
                    timestamp: serverTimestamp(),
                    userId: user?.email,
                    groupId: groupId
                  });
                  console.log('Write test successful:', testDoc.id);
                  
                  // Test delete access
                  await deleteDoc(testDoc);
                  console.log('Delete test successful');
                  
                  toast({
                    title: "Database test successful",
                    description: "You have read/write permissions",
                  });
                } catch (error) {
                  console.error('Database test failed:', error);
                  toast({
                    title: "Database test failed",
                    description: error.message,
                    variant: "destructive",
                  });
                }
              }}
              className="text-green-600 underline"
            >
              Test DB Access
            </button>
            <button 
              onClick={debugMessages}
              className="text-purple-600 underline"
            >
              Debug Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;