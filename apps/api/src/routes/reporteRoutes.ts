import { Router } from 'express';
import { generateReportePDF, generateSerenataPDF, generatePagoPDF } from '../controllers/reporteController';

const router = Router();

/**
 * @swagger
 * /api/reportes/pdf:
 *   get:
 *     summary: Genera un reporte PDF de las actividades
 *     tags: [Reportes]
 */
router.get('/pdf', generateReportePDF);

/**
 * @swagger
 * /api/reportes/serenata/{id}:
 *   get:
 *     summary: Genera un comprobante de reserva
 */
router.get('/serenata/:id', generateSerenataPDF);

/**
 * @swagger
 * /api/reportes/pago/{id}:
 *   get:
 *     summary: Genera un comprobante de pago
 */
router.get('/pago/:id', generatePagoPDF);

export default router;
