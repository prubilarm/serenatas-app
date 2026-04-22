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

app.use(cors());
app.use(express.json());

// Logger simple para debug en Vercel
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/serenatas', serenataRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/reportes', reporteRoutes);

// Documentación de la API
try {
  setupSwagger(app);
} catch (err) {
  console.error('Error setting up swagger:', err);
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    business: 'El Mariachi Aventurero',
    env: process.env.NODE_ENV
  });
});

// Para compatibilidad con Vercel: No llamar a listen si se exporta para serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;

