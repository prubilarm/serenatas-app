import { Router } from 'express';
import { getPagosBySerenata, createPago, getAllPagos } from '../controllers/pagoController';

const router = Router();

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Obtiene todos los pagos registrados
 *     tags: [Pagos]
 *     responses:
 *       200:
 *         description: Lista completa de pagos
 */
router.get('/', getAllPagos);

/**
 * @swagger
 * /api/pagos/serenata/{serenata_id}:
 *   get:
 *     summary: Obtiene los pagos realizados para una serenata específica
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: serenata_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/serenata/:serenata_id', getPagosBySerenata);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registra un nuevo pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serenata_id:
 *                 type: string
 *               monto:
 *                 type: number
 *               metodo:
 *                 type: string
 *                 enum: [efectivo, transferencia]
 *     responses:
 *       201:
 *         description: Pago registrado
 */
router.post('/', createPago);

export default router;
