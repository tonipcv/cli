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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instagramAccessToken: true }
    });

    if (!user?.instagramAccessToken) {
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
          input_token: user.instagramAccessToken,
          access_token: `${appId}|${process.env.INSTAGRAM_APP_SECRET}`,
        }).toString(),
      }
    );

    // Se o token não é válido ou está próximo de expirar (7 dias)
    if (!tokenInfo.data.is_valid || (tokenInfo.data.expires_at && 
        Date.now() > (tokenInfo.data.expires_at - 7 * 24 * 60 * 60 * 1000))) {
      
      const newToken = await refreshLongLivedToken(user.instagramAccessToken);
      
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

    return { success: true, token: user.instagramAccessToken };
  } catch (error: unknown) {
    console.error("Erro ao verificar/renovar token:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const isOAuthError = errorMessage.includes("OAuthException");
    
    return { 
      success: false, 
      error: isOAuthError ? "Erro de autenticação" : errorMessage,
      needsReauth: isOAuthError
    };
  }
}

/**
 * Implementa retry mechanism para chamadas à API
 */
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  retries = 3
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json() as InstagramError;
      
      // Trata rate limits
      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithRetry<T>(url, options, retries - 1);
      }

      throw new Error(error.error.message);
    }

    return response.json();
  } catch (error: unknown) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry<T>(url, options, retries - 1);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido na requisição");
  }
}

/**
 * Atualiza o token do usuário no banco de dados
 */
async function updateUserToken(userId: string, token: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { instagramAccessToken: token }
  });
}

/**
 * Renova o token de longa duração
 */
async function refreshLongLivedToken(currentToken: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const response = await fetchWithRetry<{ access_token: string }>(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/refresh_access_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "ig_refresh_token",
          access_token: currentToken,
        }),
      }
    );

    return { success: true, token: response.access_token };
  } catch (error: unknown) {
    console.error("Erro ao renovar token de longa duração:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
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