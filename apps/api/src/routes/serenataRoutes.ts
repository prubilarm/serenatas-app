import { Router } from 'express';
import { getSerenatas, createSerenata, updateEstadoSerenata } from '../controllers/serenataController';

const router = Router();

/**
 * @swagger
 * /api/serenatas:
 *   get:
 *     summary: Lista todas las serenatas (con datos del cliente)
 *     tags: [Serenatas]
 *     responses:
 *       200:
 *         description: Lista de serenatas
 */
router.get('/', getSerenatas);

/**
 * @swagger
 * /api/serenatas:
 *   post:
 *     summary: Registra una nueva serenata
 *     tags: [Serenatas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: string
 *               nombre_festejada:
 *                 type: string
 *               motivo:
 *                 type: string
 *               fecha:
 *                 type: string
 *               hora:
 *                 type: string
 *               direccion:
 *                 type: string
 *               comuna:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [express, full]
 *               precio_total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Serenata creada
 */
router.post('/', createSerenata);

/**
 * @swagger
 * /api/serenatas/{id}/estado:
 *   patch:
 *     summary: Actualiza el estado de una serenata (ej. confirmada, realizada)
 *     tags: [Serenatas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/estado', updateEstadoSerenata);

export default router;
