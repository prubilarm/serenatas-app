import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { Serenata } from '@shared/index';

export const getSerenatas = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('serenatas')
      .select('*, clientes(nombre, telefono)') // Traemos datos del cliente unidos
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSerenata = async (req: Request, res: Response) => {
  try {
    const nuevaSerenata: Partial<Serenata> = req.body;
    
    const { data, error } = await supabase
      .from('serenatas')
      .insert([nuevaSerenata])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEstadoSerenata = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { data, error } = await supabase
      .from('serenatas')
      .update({ estado })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
