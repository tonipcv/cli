import { prisma } from "@/lib/prisma";

interface TokenInfo {
  data: {
    app_id: string;
    type: string;
    application: string;
    expires_at?: number;
    is_valid: boolean;
    scopes: string[];
    user_id: string;
  };
}

interface InstagramError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

/**
 * Verifica e atualiza o token do Instagram se necessário
 * Implementa retry mechanism e tratamento de rate limits
 */
export async function verifyAndRefreshToken(userId: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  needsReauth?: boolean;
}> {
  try {
    // Validar App ID
    const appId = process.env.INSTAGRAM_APP_ID;
    if (!appId || !/^\d+$/.test(appId)) {
      throw new Error("Invalid Instagram App ID configuration");
    }

    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: { userId }
    });

    if (!instagramAccount?.accessToken) {
      return { success: false, needsReauth: true, error: "Token não encontrado" };
    }

    // Verifica informações do token usando o formato correto do App ID
    const tokenInfo = await fetchWithRetry<TokenInfo>(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/debug_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: new URLSearchParams({
          input_token: instagramAccount.accessToken,
          access_token: `${appId}|${process.env.INSTAGRAM_APP_SECRET}`,
        }).toString(),
      }
    );

    // Se o token não é válido ou está próximo de expirar (7 dias)
    if (!tokenInfo.data.is_valid || (tokenInfo.data.expires_at && 
        Date.now() > (tokenInfo.data.expires_at - 7 * 24 * 60 * 60 * 1000))) {
      
      const newToken = await refreshLongLivedToken(instagramAccount.accessToken);
      
      if (newToken.success && newToken.token) {
        await updateUserToken(userId, newToken.token);
        return { success: true, token: newToken.token };
      } else {
        return { 
          success: false, 
          needsReauth: true, 
          error: "Falha ao renovar token" 
        };
      }
    }

    return { success: true, token: instagramAccount.accessToken };
  } catch (error) {
    console.error("Error verifying Instagram token:", error);
    return { 
      success: false, 
      needsReauth: true, 
      error: "Erro ao verificar token" 
    };
  }
}

/**
 * Atualiza o token do usuário no banco de dados
 */
async function updateUserToken(userId: string, token: string): Promise<void> {
  await prisma.instagramAccount.update({
    where: { userId },
    data: { 
      accessToken: token,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
    }
  });
}

/**
 * Implementa retry mechanism para requisições à API
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json() as InstagramError;
        
        // Se for erro de rate limit, espera e tenta novamente
        if (errorData.error?.code === 4 || errorData.error?.code === 17) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw lastError || new Error('Max retries reached');
}

/**
 * Renova o token de longa duração
 */
async function refreshLongLivedToken(shortLivedToken: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/oauth/access_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: new URLSearchParams({
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          access_token: shortLivedToken,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to refresh token');
    }

    const data = await response.json();
    return { success: true, token: data.access_token };
  } catch (error) {
    console.error("Error refreshing long-lived token:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to refresh token' 
    };
  }
}

/**
 * Verifica o status da conexão com o Instagram
 */
export async function checkInstagramConnection(userId: string): Promise<{
  isConnected: boolean;
  error?: string;
  needsReauth?: boolean;
}> {
  try {
    const tokenStatus = await verifyAndRefreshToken(userId);

    if (!tokenStatus.success) {
      return {
        isConnected: false,
        error: tokenStatus.error,
        needsReauth: tokenStatus.needsReauth
      };
    }

    // Testa a conexão fazendo uma chamada simples
    const response = await fetchWithRetry<{ id: string; username: string }>(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: new URLSearchParams({
          fields: "id,username",
          access_token: tokenStatus.token!,
        }).toString(),
      }
    );

    return { isConnected: true };
  } catch (error: unknown) {
    console.error("Erro ao verificar conexão com Instagram:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const isOAuthError = errorMessage.includes("OAuthException");
    
    return { 
      isConnected: false, 
      error: "Falha ao verificar conexão",
      needsReauth: isOAuthError
    };
  }
}

/**
 * Monitora e registra erros da API do Instagram
 */
export function logInstagramError(
  error: Error | unknown, 
  context: string, 
  userId: string
): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    userId,
    context,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : {
      message: "Erro desconhecido",
    },
  };

  // Log do erro
  console.error("Instagram API Error:", errorLog);

  // Aqui você pode implementar:
  // - Envio para serviço de monitoramento (ex: Sentry)
  // - Armazenamento em banco de dados
  // - Alertas para equipe de suporte
} 