import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from './utils/swagger';
import clienteRoutes from './routes/clienteRoutes';
import serenataRoutes from './routes/serenataRoutes';
import pagoRoutes from './routes/pagoRoutes';
import reporteRoutes from './routes/reporteRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Permitir todo por ahora para debuggear el error de fetch
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger simple para debug en Vercel
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
// Rutas con y sin prefijo /api para mayor compatibilidad
app.use('/api/clientes', clienteRoutes);
app.use('/api/serenatas', serenataRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/reportes', reporteRoutes);

app.use('/clientes', clienteRoutes);
app.use('/serenatas', serenataRoutes);
app.use('/pagos', pagoRoutes);
app.use('/reportes', reporteRoutes);

// Documentación de la API
try {
  setupSwagger(app);
} catch (err) {
  console.error('Error setting up swagger:', err);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', business: 'El Mariachi Aventurero' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'El Mariachi Aventurero API - Use /api/serenatas, /api/pagos, etc.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'API El Mariachi Aventurero is running' });
});

// Para compatibilidad con Vercel: No llamar a listen si se exporta para serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;

