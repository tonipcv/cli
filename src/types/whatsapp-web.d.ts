declare module 'whatsapp-web.js' {
  import { EventEmitter } from 'events';

  interface ClientOptions {
    authStrategy: any;
    puppeteer: {
      headless: boolean;
      args: string[];
    };
  }

  interface MessageId {
    fromMe: boolean;
    remote: string;
    id: string;
    _serialized: string;
  }

  interface Message {
    id: MessageId;
    body: string;
    from: string;
    to: string;
    author: string;
    timestamp: number;
    fromMe: boolean;
    hasMedia: boolean;
    ack: number;
    deviceType: string;
  }

  interface Chat {
    id: {
      server: string;
      user: string;
      _serialized: string;
    };
    name: string;
    timestamp: number;
    archived: boolean;
    pinned: boolean;
    unreadCount: number;
    lastMessage: Message | null;
    fetchMessages(options: { limit: number }): Promise<Message[]>;
    sendMessage(content: string): Promise<Message>;
  }

  class Client extends EventEmitter {
    constructor(options: ClientOptions);
    initialize(): Promise<void>;
    getChats(): Promise<Chat[]>;
    getChatById(chatId: string): Promise<Chat>;
    logout(): Promise<void>;
    on(event: 'qr', listener: (qr: string) => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'message', listener: (message: Message) => void): this;
    on(event: 'disconnected', listener: () => void): this;
  }

  class LocalAuth {
    constructor();
  }
} 