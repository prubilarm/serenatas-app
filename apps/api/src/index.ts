import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from './utils/swagger';
import clienteRoutes from './routes/clienteRoutes';
import serenataRoutes from './routes/serenataRoutes';
import pagoRoutes from './routes/pagoRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/serenatas', serenataRoutes);
app.use('/api/pagos', pagoRoutes);

// Documentación de la API
setupSwagger(app);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', business: 'El Mariachi Aventurero' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
