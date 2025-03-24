import { Client, LocalAuth } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import type { Message, Chat } from 'whatsapp-web.js';

class WhatsAppService extends EventEmitter {
  private static instance: WhatsAppService;
  private client: Client | null = null;
  private qrCode: string | null = null;
  private isReady = false;
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  private constructor() {
    super();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async initialize() {
    if (this.client) return;

    this.connectionState = 'connecting';
    this.emit('connectionStateChanged', this.connectionState);

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      this.emit('qr', qr);
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.connectionState = 'connected';
      this.emit('connectionStateChanged', this.connectionState);
      this.emit('ready');
    });

    this.client.on('message', (message: Message) => {
      this.emit('message', message);
    });

    this.client.on('disconnected', () => {
      this.isReady = false;
      this.connectionState = 'disconnected';
      this.emit('connectionStateChanged', this.connectionState);
    });

    await this.client.initialize();
  }

  public async getChats(): Promise<Chat[]> {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    return this.client.getChats();
  }

  public async getChatById(chatId: string): Promise<Chat | null> {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    try {
      return await this.client.getChatById(chatId);
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  public async sendMessage(chatId: string, content: string): Promise<Message | null> {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    try {
      const chat = await this.client.getChatById(chatId);
      return await chat.sendMessage(content);
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
    if (!this.client) return;
    await this.client.logout();
    this.isReady = false;
    this.connectionState = 'disconnected';
    this.emit('connectionStateChanged', this.connectionState);
  }
}

export const whatsappService = WhatsAppService.getInstance(); 