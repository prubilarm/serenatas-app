import { Router } from 'express';
import { getSerenatas, createSerenata, updateEstadoSerenata, updateSerenata, deleteSerenata } from '../controllers/serenataController';

const router = Router();

/**
 * @swagger
 * /api/serenatas:
 *   get:
 *     summary: Lista todas las serenatas
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
 */
router.post('/', createSerenata);

/**
 * @swagger
 * /api/serenatas/{id}:
 *   put:
 *     summary: Actualiza una serenata
 *     tags: [Serenatas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/:id', updateSerenata);

/**
 * @swagger
 * /api/serenatas/{id}:
 *   delete:
 *     summary: Elimina una serenata
 *     tags: [Serenatas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/:id', deleteSerenata);

/**
 * @swagger
 * /api/serenatas/{id}/estado:
 *   patch:
 *     summary: Actualiza solo el estado
 *     tags: [Serenatas]
 */
router.patch('/:id/estado', updateEstadoSerenata);

export default router;
