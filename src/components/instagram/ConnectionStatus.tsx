"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { checkInstagramConnection } from "@/lib/instagram/utils";

interface ConnectionStatusProps {
  userId: string;
}

export function InstagramConnectionStatus({ userId }: ConnectionStatusProps) {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    error?: string;
    needsReauth?: boolean;
    isChecking: boolean;
  }>({
    isConnected: false,
    isChecking: true,
  });

  const checkConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, isChecking: true }));
      const connectionStatus = await checkInstagramConnection(userId);
      setStatus({ ...connectionStatus, isChecking: false });
    } catch (error) {
      setStatus({
        isConnected: false,
        error: "Erro ao verificar conexão",
        isChecking: false,
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, [userId]);

  const handleReconnect = () => {
    window.location.href = "/api/auth/instagram/login";
  };

  if (status.isChecking) {
    return (
      <Alert className="bg-muted">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexão</AlertTitle>
        <AlertDescription>
          Aguarde enquanto verificamos sua conexão com o Instagram...
        </AlertDescription>
      </Alert>
    );
  }

  if (status.isConnected) {
    return (
      <Alert className="bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Conectado ao Instagram</AlertTitle>
        <AlertDescription className="flex items-center gap-4">
          <span>Sua conta está conectada e funcionando normalmente.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Problema na conexão</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>
          {status.error || "Não foi possível verificar o status da conexão"}
        </span>
        {status.needsReauth && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            className="self-start"
          >
            Reconectar Instagram
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 