import { EventEmitter } from 'events';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
  WAMessageKey,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { join } from 'path';

// Ensure this code only runs on the server
const isServer = typeof window === 'undefined';

class WhatsAppService extends EventEmitter {
  private static instance: WhatsAppService;
  private socket: any = null;
  private qrCode: string | null = null;
  private isReady = false;
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private messageStore = makeInMemoryStore({});
  private authFolder = join(process.cwd(), '.baileys_auth_info');

  private constructor() {
    super();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private async cleanAuthState() {
    this.socket = null;
    this.qrCode = null;
    this.isReady = false;
    this.connectionState = 'disconnected';
  }

  public async initialize() {
    if (!isServer) {
      throw new Error('WhatsApp service can only be initialized on the server');
    }

    if (this.socket) {
      await this.cleanAuthState();
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);

      this.connectionState = 'connecting';
      this.emit('connectionStateChanged', this.connectionState);

      this.socket = makeWASocket({
        printQRInTerminal: false, // Disable QR in terminal
        auth: state,
        logger: undefined, // Disable logging
      });

      this.messageStore.bind(this.socket.ev);

      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        console.log('Connection update:', { connection, qr: !!qr });

        if (qr) {
          this.qrCode = qr;
          this.emit('qr', qr);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log('Connection closed:', { statusCode, shouldReconnect });
          
          if (shouldReconnect) {
            console.log('Attempting to reconnect...');
            await this.initialize();
          } else {
            await this.cleanAuthState();
            this.emit('connectionStateChanged', this.connectionState);
          }
        } else if (connection === 'open') {
          console.log('Connection opened');
          this.qrCode = null;
          this.isReady = true;
          this.connectionState = 'connected';
          this.emit('connectionStateChanged', this.connectionState);
          this.emit('ready');
        }
      });

      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('messages.upsert', (m: { messages: proto.IWebMessageInfo[], type: 'notify' | 'append' }) => {
        if (m.type === 'notify') {
          this.emit('message', m.messages[0]);
        }
      });

    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      await this.cleanAuthState();
      throw error;
    }
  }

  public async getChats() {
    if (!isServer) {
      throw new Error('WhatsApp service can only be used on the server');
    }

    if (!this.socket || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    return this.messageStore.chats.all();
  }

  public async getChatById(chatId: string) {
    if (!isServer) {
      throw new Error('WhatsApp service can only be used on the server');
    }

    if (!this.socket || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      return this.messageStore.messages[chatId];
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  public async sendMessage(chatId: string, content: string) {
    if (!isServer) {
      throw new Error('WhatsApp service can only be used on the server');
    }

    if (!this.socket || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      return await this.socket.sendMessage(chatId, { text: content });
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  public getQRCode() {
    return this.qrCode;
  }

  public getConnectionState() {
    return this.connectionState;
  }

  public isConnected() {
    return this.isReady;
  }

  public async logout() {
    if (!isServer) {
      throw new Error('WhatsApp service can only be used on the server');
    }

    if (!this.socket) return;
    
    try {
      await this.socket.logout();
    } finally {
      await this.cleanAuthState();
      this.emit('connectionStateChanged', this.connectionState);
    }
  }
}

// Only create the instance on the server
let whatsappService: WhatsAppService | null = null;
if (isServer) {
  whatsappService = WhatsAppService.getInstance();
}

export { whatsappService }; 