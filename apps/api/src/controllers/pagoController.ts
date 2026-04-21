import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getAllPagos = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, serenatas(*, clientes(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPagosBySerenata = async (req: Request, res: Response) => {
  try {
    const { serenata_id } = req.params;
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('serenata_id', serenata_id);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPago = async (req: Request, res: Response) => {
  try {
    const nuevoPago = req.body;
    
    // 1. Insertar el pago
    const { data: pagoData, error: pagoError } = await supabase
      .from('pagos')
      .insert([nuevoPago])
      .select()
      .single();

    if (pagoError) throw pagoError;

    // 2. Si el pago es registrado, podríamos actualizar el estado de la serenata si el total está cubierto
    // (Esta lógica la refinaremos en el Paso 9)

    res.status(201).json(pagoData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
