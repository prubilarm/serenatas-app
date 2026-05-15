import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
// Removed shared import
import crypto from 'crypto';

export const getClientes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_usuario', 'cliente')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const nuevoCliente: any = {
      ...req.body,
      tipo_usuario: 'cliente'
    };
    
    const { data, error } = await supabase
      .from('usuarios')
      .insert([nuevoCliente])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
