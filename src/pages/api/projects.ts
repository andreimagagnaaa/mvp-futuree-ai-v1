import { supabase } from '../../config/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([{ ...req.body, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(data);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao criar projeto' });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        const { error } = await supabase
          .from('projects')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        return res.status(200).json({ message: 'Projeto atualizado com sucesso' });
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar projeto' });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        
        // Primeiro, excluir os arquivos associados
        const { data: files } = await supabase
          .storage
          .from('project-files')
          .list(id as string);

        if (files?.length) {
          const filePaths = files.map(file => `${id}/${file.name}`);
          await supabase
            .storage
            .from('project-files')
            .remove(filePaths);
        }

        // Depois, excluir o projeto
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return res.status(200).json({ message: 'Projeto excluído com sucesso' });
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao excluir projeto' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
} 