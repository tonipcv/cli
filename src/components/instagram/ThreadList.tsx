'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { InstagramThread } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface ThreadListProps {
  onSelectThread: (thread: InstagramThread) => void;
  selectedThreadId?: string;
}

export function ThreadList({ onSelectThread, selectedThreadId }: ThreadListProps) {
  const [threads, setThreads] = useState<InstagramThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/instagram/threads');
      const data = await response.json();
      setThreads(data.threads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={`w-full p-3 text-left transition-colors hover:bg-accent rounded-lg ${
              selectedThreadId === thread.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {thread.participantAvatar ? (
                <img
                  src={thread.participantAvatar}
                  alt={thread.participantName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">
                    {thread.participantName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">
                    {thread.participantName}
                  </p>
                  {thread.lastMessageAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {thread.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {thread.lastMessage}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
} 