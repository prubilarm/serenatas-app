export type EstadoSerenata = 
  | 'consulta' 
  | 'cotizada' 
  | 'confirmada' 
  | 'en camino' 
  | 'realizada' 
  | 'pagada' 
  | 'cancelada';

export type TipoSerenata = 'express' | 'full';

export type MetodoPago = 'efectivo' | 'transferencia';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  observaciones?: string;
  created_at: string;
}

export interface Serenata {
  id: string;
  cliente_id?: string;
  nombre_festejada: string;
  motivo: string;
  fecha: string;
  hora: string;
  direccion: string;
  comuna: string;
  mensaje_especial?: string;
  tipo: TipoSerenata;
  precio_total: number;
  estado: EstadoSerenata;
  created_at: string;
}
