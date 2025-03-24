import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import QRCode from "qrcode";
import { whatsappService } from "@/lib/whatsapp";

interface WhatsAppLoginProps {
  onConnect: () => void;
}

export function WhatsAppLogin({ onConnect }: WhatsAppLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const handleQR = async (qr: string) => {
      try {
        const url = await QRCode.toDataURL(qr);
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    const handleConnectionState = (state: 'disconnected' | 'connecting' | 'connected') => {
      setConnectionState(state);
      if (state === 'connected') {
        onConnect();
      }
    };

    whatsappService.on('qr', handleQR);
    whatsappService.on('connectionStateChanged', handleConnectionState);

    return () => {
      whatsappService.removeListener('qr', handleQR);
      whatsappService.removeListener('connectionStateChanged', handleConnectionState);
    };
  }, [onConnect]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await whatsappService.initialize();
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="space-y-6 text-center">
        <Icons.whatsapp className="w-12 h-12 mx-auto text-green-500" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Connect WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground">
            {connectionState === 'disconnected' && "Scan the QR code to connect your WhatsApp"}
            {connectionState === 'connecting' && "Connecting to WhatsApp..."}
            {connectionState === 'connected' && "Connected to WhatsApp!"}
          </p>
        </div>

        {qrCodeUrl && connectionState !== 'connected' && (
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64" />
          </div>
        )}

        {connectionState === 'disconnected' && !qrCodeUrl && (
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Connect WhatsApp
          </Button>
        )}
      </div>
    </Card>
  );
} 