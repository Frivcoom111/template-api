import express from "express";
import cartControllers from "../controllers/cartControllers";
import { authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Ver carrinho do usuário autenticado
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: Retorna o carrinho com itens e total calculado. Se o carrinho não existir, retorna id null e lista vazia.
 *     responses:
 *       200:
 *         description: Carrinho retornado (vazio ou com itens)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.get("/", authToken, cartControllers.getCart.bind(cartControllers));

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Adicionar ou atualizar item no carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: Se o produto já estiver no carrinho, substitui a quantidade. Rejeita produtos inativos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item adicionado — retorna carrinho atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/CartResponse'
 *       400:
 *         description: Dados inválidos ou quantidade zero
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produto não encontrado ou inativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Estoque insuficiente ou quantidade igual à atual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post("/", authToken, cartControllers.addItem.bind(cartControllers));

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Atualizar quantidade de item no carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto no carrinho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada — retorna carrinho atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/CartResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Carrinho, item ou produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Estoque insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.patch(
  "/:productId",
  authToken,
  cartControllers.updateItem.bind(cartControllers),
);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remover item do carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto a remover
 *     responses:
 *       200:
 *         description: Item removido — retorna carrinho atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item não encontrado no carrinho
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.delete(
  "/:productId",
  authToken,
  cartControllers.removeItem.bind(cartControllers),
);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Esvaziar carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho esvaziado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Carrinho não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.delete("/", authToken, cartControllers.clearCart.bind(cartControllers));

export default routes;
