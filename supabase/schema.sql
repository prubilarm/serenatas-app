-- Esquema Inicial para El Mariachi Aventurero

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Serenatas
CREATE TABLE IF NOT EXISTS serenatas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    nombre_festejada TEXT NOT NULL,
    motivo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    direccion TEXT NOT NULL,
    comuna TEXT NOT NULL,
    mensaje_especial TEXT,
    tipo TEXT CHECK (tipo IN ('express', 'full')) DEFAULT 'full',
    precio_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado TEXT CHECK (estado IN ('consulta', 'cotizada', 'confirmada', 'en camino', 'realizada', 'pagada', 'cancelada')) DEFAULT 'consulta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serenata_id UUID REFERENCES serenatas(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL,
    metodo TEXT CHECK (metodo IN ('efectivo', 'transferencia')) DEFAULT 'transferencia',
    comprobante_url TEXT, -- Link a imagen en Supabase Storage
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE serenatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (asumiendo que solo usuarios autenticados pueden ver/editar)
CREATE POLICY "Permitir todo a usuarios autenticados" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados" ON serenatas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados" ON pagos FOR ALL USING (auth.role() = 'authenticated');
