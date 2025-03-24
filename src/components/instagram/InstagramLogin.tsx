'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Instagram } from "lucide-react";
import { useState } from "react";

export function InstagramLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramLogin = async () => {
    try {
      setIsLoading(true);

      // Verificar o token primeiro
      const verifyResponse = await fetch('/api/instagram/verify');
      const verifyData = await verifyResponse.json();

      // Se tiver uma conta conectada e válida, redirecionar para a inbox
      if (verifyData.success) {
        window.location.href = '/instagram/inbox';
        return;
      }

      // Se precisar de login (token expirado ou sem conta), iniciar o fluxo de login
      if (verifyData.needsLogin) {
        const response = await fetch('/api/instagram/auth/login');
        
        if (!response.ok) {
          throw new Error('Failed to get authentication URL');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.url) {
          // Abrir em uma janela maior
          const width = 800;
          const height = 800;
          const left = (window.innerWidth - width) / 2;
          const top = (window.innerHeight - height) / 2;

          const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'scrollbars=yes',
            'toolbar=no',
            'location=no',
            'directories=no',
            'status=no',
            'menubar=no',
            'resizable=yes'
          ].join(',');

          // Log para debug
          console.log('=== Opening Facebook Login Window ===');
          console.log('URL:', data.url);
          console.log('Debug info:', data.debug);

          const loginWindow = window.open(data.url, 'facebook-login', features);
          
          if (loginWindow) {
            loginWindow.focus();
          } else {
            throw new Error('Popup was blocked. Please allow popups for this site.');
          }
        } else {
          throw new Error('URL de autenticação não encontrada');
        }
      } else if (verifyData.error) {
        // Se houver outro tipo de erro
        throw new Error(verifyData.error);
      }
    } catch (error) {
      console.error('Failed to initiate Instagram login:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível conectar com o Instagram. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleInstagramLogin}
      disabled={isLoading}
      className="w-full flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Conectando...</span>
        </>
      ) : (
        <>
          <Instagram className="h-5 w-5" />
          <span>Conectar Instagram</span>
        </>
      )}
    </Button>
  );
} 