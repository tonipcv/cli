import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { whatsappService } from "@/lib/whatsapp";
import type { Chat } from "whatsapp-web.js";

interface ThreadListProps {
  selectedThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
}

export function ThreadList({ selectedThreadId, onThreadSelect }: ThreadListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await whatsappService.getChats();
        setChats(chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

    const handleMessage = () => {
      fetchChats();
    };

    whatsappService.on('message', handleMessage);

    return () => {
      whatsappService.removeListener('message', handleMessage);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id._serialized}
            onClick={() => onThreadSelect(chat.id._serialized)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              selectedThreadId === chat.id._serialized
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{chat.name}</span>
              <span className="text-xs text-muted-foreground">
                {chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleString() : ''}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground truncate max-w-[70%]">
                {chat.lastMessage?.body || ''}
              </span>
              {chat.unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
} 