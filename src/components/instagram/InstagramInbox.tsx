'use client';

import { useState, useEffect } from 'react';
import { InstagramThread } from '@prisma/client';
import { InstagramLogin } from './InstagramLogin';
import { ThreadList } from './ThreadList';
import { MessageThread } from './MessageThread';
import { useSession } from 'next-auth/react';

export function InstagramInbox() {
  const { data: session } = useSession();
  const [selectedThread, setSelectedThread] = useState<InstagramThread | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if user has Instagram connected
  useEffect(() => {
    const checkInstagramConnection = async () => {
      try {
        const response = await fetch('/api/instagram/status');
        const data = await response.json();
        setIsConnected(data.isConnected);
      } catch (error) {
        console.error('Error checking Instagram connection:', error);
        setIsConnected(false);
      }
    };

    if (session?.user) {
      checkInstagramConnection();
    }
  }, [session]);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to access Instagram messages</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md w-full">
          <InstagramLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-12 divide-x divide-border">
      <div className="col-span-4 h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <ThreadList
            onSelectThread={setSelectedThread}
            selectedThreadId={selectedThread?.id}
          />
        </div>
      </div>
      <div className="col-span-8 h-full">
        {selectedThread ? (
          <MessageThread thread={selectedThread} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
} 