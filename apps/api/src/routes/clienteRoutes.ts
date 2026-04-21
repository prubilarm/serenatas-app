import { Router } from 'express';
import { getClientes, createCliente } from '../controllers/clienteController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nombre
 *         - telefono
 *       properties:
 *         id:
 *           type: string
 *           description: ID generado automáticamente por la DB
 *         nombre:
 *           type: string
 *         telefono:
 *           type: string
 *         observaciones:
 *           type: string
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtiene la lista completa de clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/', getClientes);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registra un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
router.post('/', createCliente);

export default router;
