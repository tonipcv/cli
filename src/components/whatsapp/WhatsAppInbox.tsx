"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { WhatsAppLogin } from "./WhatsAppLogin";
import { ThreadList } from "./ThreadList";
import { MessageThread } from "./MessageThread";

export function WhatsAppInbox() {
  const { data: session } = useSession();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!session?.user) {
    return null;
  }

  if (!isConnected) {
    return <WhatsAppLogin onConnect={() => setIsConnected(true)} />;
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      {/* Thread List */}
      <Card className="col-span-4 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <Button variant="outline" size="sm" onClick={() => setIsConnected(false)}>
            Disconnect
          </Button>
        </div>
        <ThreadList
          selectedThreadId={selectedThreadId}
          onThreadSelect={setSelectedThreadId}
        />
      </Card>

      {/* Message Thread */}
      <Card className="col-span-8 p-4 overflow-hidden">
        {selectedThreadId ? (
          <MessageThread threadId={selectedThreadId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </Card>
    </div>
  );
} 