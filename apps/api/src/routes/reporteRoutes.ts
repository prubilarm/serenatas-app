import { Router } from 'express';
import { generateReportePDF, generateSerenataPDF } from '../controllers/reporteController';

const router = Router();

/**
 * @swagger
 * /api/reportes/pdf:
 *   get:
 *     summary: Genera un reporte PDF de las actividades
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Archivo PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf', generateReportePDF);

/**
 * @swagger
 * /api/reportes/serenata/{id}:
 *   get:
 *     summary: Genera un comprobante PDF para un cliente
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comprobante PDF generado
 */
router.get('/serenata/:id', generateSerenataPDF);

export default router;
