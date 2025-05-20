import { NextApiRequest, NextApiResponse } from 'next';
import { trackApiUsage } from '../../middleware/usageTracker';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sua lógica de API aqui
  res.status(200).json({ message: 'Success' });
}

// Envolve o handler com o middleware de rastreamento
export default trackApiUsage(handler); 