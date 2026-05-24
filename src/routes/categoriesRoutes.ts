import express from "express";
import categoriesControllers from "../controllers/categoriesControllers";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar categorias ou buscar por slug
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema: { type: string }
 *         description: "Slug da categoria. Se informado, retorna uma única categoria."
 *         example: headphones
 *     responses:
 *       200:
 *         description: Categoria(s) encontrada(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   oneOf:
 *                     - type: array
 *                       items: { $ref: '#/components/schemas/CategoryResponse' }
 *                     - $ref: '#/components/schemas/CategoryResponse'
 *       404:
 *         description: Categoria não encontrada (quando slug informado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/",
  categoriesControllers.getCategories.bind(categoriesControllers),
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Criar categoria
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Headphones
 *     responses:
 *       201:
 *         description: Categoria criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 createdCategory:
 *                   $ref: '#/components/schemas/CategoryResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Categoria já existe
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.post(
  "/",
  authToken,
  authAdminOnly,
  categoriesControllers.createCategory.bind(categoriesControllers),
);

/**
 * @swagger
 * /categories/update/{id}:
 *   patch:
 *     summary: Atualizar categoria
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updatedCategory:
 *                   $ref: '#/components/schemas/CategoryResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Nome já existe
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/update/:id",
  authToken,
  authAdminOnly,
  categoriesControllers.updatedCategory.bind(categoriesControllers),
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN. Bloqueado com 409 se a categoria tiver produtos vinculados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 deletedCategory:
 *                   $ref: '#/components/schemas/CategoryResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Categoria possui produtos vinculados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.delete(
  "/:id",
  authToken,
  authAdminOnly,
  categoriesControllers.deleteCategory.bind(categoriesControllers),
);

export default routes;
