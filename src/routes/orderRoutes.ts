import express from "express";
import orderControllers from "../controllers/orderControllers";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Criar pedido a partir do carrinho
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Cria um pedido com os itens do carrinho atual.
 *       Valida estoque e disponibilidade de cada produto, decrementa estoque e limpa o carrinho na mesma transação.
 *       Rejeita produtos inativos no carrinho.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId]
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do endereço de entrega (deve pertencer ao usuário e estar ativo)
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Carrinho vazio ou dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Endereço não pertence ao usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Endereço não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Estoque insuficiente ou produto inativo no carrinho
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.post(
  "/",
  authToken,
  orderControllers.createOrder.bind(orderControllers),
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Usuário comum vê apenas os próprios pedidos. ADMIN vê todos.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Lista paginada de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get("/", authToken, orderControllers.getOrders.bind(orderControllers));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Usuário comum só acessa seus próprios pedidos. ADMIN acessa qualquer pedido.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Pedido não pertence ao usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/:id",
  authToken,
  orderControllers.getOrderById.bind(orderControllers),
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELLED]
 *                 example: PAID
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Status inválido
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
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/:id/status",
  authToken,
  authAdminOnly,
  orderControllers.updateOrderStatus.bind(orderControllers),
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Cancelar pedido
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Cancela pedido marcando `orderStatus = CANCELLED` e restaura o estoque dos produtos.
 *       Apenas pedidos em status `PENDING` podem ser cancelados.
 *       Owner do pedido ou ADMIN podem cancelar.
 *       **Nota:** pedidos nunca são deletados fisicamente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido cancelado — estoque restaurado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order:
 *                   $ref: '#/components/schemas/OrderResponse'
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
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Pedido não está em status PENDING
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.delete(
  "/:id",
  authToken,
  orderControllers.cancelOrder.bind(orderControllers),
);

export default routes;
