"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import QRCode from "qrcode";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WhatsAppLoginProps {
  onConnect: () => void;
}

export function WhatsAppLogin({ onConnect }: WhatsAppLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp/connect');
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setConnectionState(data.connectionState);
        
        if (data.qrCode) {
          const url = await QRCode.toDataURL(data.qrCode);
          setQrCodeUrl(url);
          setShowQRDialog(true);
        } else {
          setQrCodeUrl(null);
        }

        if (data.isConnected) {
          setShowQRDialog(false);
          onConnect();
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
      }
    };

    const interval = setInterval(checkStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [onConnect]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="p-8 max-w-md mx-auto">
        <div className="space-y-6 text-center">
          <Icons.whatsapp className="w-12 h-12 mx-auto text-green-500" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connect WhatsApp
            </h1>
            <p className="text-sm text-muted-foreground">
              {connectionState === 'disconnected' && "Click to connect your WhatsApp"}
              {connectionState === 'connecting' && "Connecting to WhatsApp..."}
              {connectionState === 'connected' && "Connected to WhatsApp!"}
            </p>
          </div>

          {connectionState === 'disconnected' && (
            <>
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
              <p className="text-xs text-gray-500">
                By connecting, you agree to our{" "}
                <Link href="/legal/terms" className="text-green-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </>
          )}
        </div>
      </Card>

      <Dialog open={showQRDialog && !!qrCodeUrl} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <img src={qrCodeUrl!} alt="WhatsApp QR Code" className="w-64 h-64" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Open WhatsApp on your phone and scan this QR code to connect
          </p>
          <p className="text-center text-xs text-gray-500">
            By scanning the QR code, you agree to our{" "}
            <Link href="/legal/terms" className="text-green-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-green-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
} 