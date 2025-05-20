import { NextApiRequest, NextApiResponse } from 'next';
import { reportApiUsage } from '../utils/stripe';

export function trackApiUsage(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();

    // Modifica o objeto de resposta para interceptar o final da requisição
    const originalEnd = res.end;
    res.end = function (...args: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Apenas registra uso para requisições bem-sucedidas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.headers['x-user-id'] as string;
        const subscriptionItemId = req.headers['x-subscription-item-id'] as string;

        if (userId && subscriptionItemId) {
          // Registra o uso de forma assíncrona para não bloquear a resposta
          reportApiUsage(subscriptionItemId, 1).catch(console.error);
        }
      }

      return originalEnd.apply(res, args);
    };

    return handler(req, res);
  };
} 