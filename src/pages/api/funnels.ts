import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../config/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: funnels, error: fetchError } = await supabase
          .from('funnels')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        return res.status(200).json(funnels);

      case 'POST':
        const { data: newFunnel, error: createError } = await supabase
          .from('funnels')
          .insert([req.body])
          .select()
          .single();

        if (createError) throw createError;
        return res.status(201).json(newFunnel);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const { error: updateError } = await supabase
          .from('funnels')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;
        return res.status(200).json({ message: 'Funil atualizado com sucesso' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabase
          .from('funnels')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ message: 'Funil excluído com sucesso' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API de funis:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 