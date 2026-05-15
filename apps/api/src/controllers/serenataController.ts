import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { Serenata } from '../shared-types';
import crypto from 'crypto';

export const getSerenatas = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('serenatas')
      .select(`
        *,
        participantes:usuario_serenata(
          id,
          usuario_id,
          rol_en_serenata,
          monto_comprometido,
          estado_pago,
          cliente:usuarios(nombre, telefono)
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSerenata = async (req: Request, res: Response) => {
  try {
    const { nombre_cliente, telefono: telRaw, ...rest } = req.body;
    const telefono = telRaw?.toString().trim();
    const nombre = nombre_cliente?.toString().trim();
    
    let clienteId = req.body.cliente_id;

    // Si no viene cliente_id pero si nombre y telefono, buscamos o creamos el cliente
    if (!clienteId && nombre_cliente && telefono) {
      // Intentar buscar cliente por teléfono
      const { data: clienteExistente, error: searchError } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefono', telefono)
        .maybeSingle(); // Usamos maybeSingle para evitar el error PGRST116 si no hay resultados

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        // Crear nuevo cliente si no existe
        const nuevoCliente = {
          id: crypto.randomUUID(),
          nombre: nombre,
          telefono: telefono
        };
        const { data: clienteNuevo, error: errorCliente } = await supabase
          .from('clientes')
          .insert([nuevoCliente])
          .select('id')
          .single();
        
        if (errorCliente) {
          console.error('Error creating client:', errorCliente);
          throw new Error(`No se pudo crear el cliente: ${errorCliente.message}`);
        }
        clienteId = clienteNuevo.id;
      }
    }

    const nuevaSerenata: Partial<Serenata> = {
      id: crypto.randomUUID(),
      cliente_id: clienteId,
      ...rest
    };
    
    const { data, error } = await supabase
      .from('serenatas')
      .insert([nuevaSerenata])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error in createSerenata:', error);
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

export const updateSerenata = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('serenatas')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data ? data[0] : null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSerenata = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('serenatas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Serenata eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
