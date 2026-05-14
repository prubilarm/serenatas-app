import { Router } from 'express';
import { generateReportePDF, generateSerenataPDF, generatePagoPDF } from '../controllers/reporteController';

const router = Router();

// GET /api/reportes/general  → Reporte general de serenatas
router.get('/general', generateReportePDF);

// GET /api/reportes/serenata/:id  → PDF de confirmación de reserva
router.get('/serenata/:id', generateSerenataPDF);

// GET /api/reportes/pago/:id  → PDF de comprobante de pago
router.get('/pago/:id', generatePagoPDF);

export default router;
