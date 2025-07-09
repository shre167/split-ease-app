// src/pages/JoinGroup.tsx
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // ✅ firestore/lite works for basic reads/writes
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const JoinGroup = () => {
  const [code, setCode] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleJoin = async () => {
    const groupRef = doc(db, 'groups', code.toUpperCase());

    try {
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        toast({
          title: 'Group not found',
          description: 'Check the code and try again.',
          variant: 'destructive',
        });
        return;
      }

      await updateDoc(groupRef, {
        members: arrayUnion(user?.uid),
      });

      toast({
        title: 'Joined group!',
        description: `You're now part of ${groupSnap.data().name}`,
      });

      setCode('');
    } catch (error: any) {
      toast({
        title: 'Error joining group',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Input
        placeholder="Enter group code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button onClick={handleJoin} className="mt-3">
        Join Group
      </Button>
    </div>
  );
};

export default JoinGroup;
