import express from "express";
import addressControllers from "../controllers/addressControllers";
import { authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Listar endereços do usuário autenticado
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     description: Retorna apenas endereços ativos (não soft-deletados).
 *     responses:
 *       200:
 *         description: Lista de endereços
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AddressResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/",
  authToken,
  addressControllers.getAddresses.bind(addressControllers),
);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Buscar endereço por ID
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     description: Usuário comum só vê seus próprios endereços ativos. ADMIN vê qualquer endereço (inclusive inativos).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   $ref: '#/components/schemas/AddressResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Endereço pertence a outro usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Endereço não encontrado ou inativo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/:id",
  authToken,
  addressControllers.getAddressById.bind(addressControllers),
);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Criar endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, number, city, state, zipCode]
 *             properties:
 *               street:
 *                 type: string
 *                 maxLength: 100
 *                 example: Rua das Flores
 *               number:
 *                 type: integer
 *                 minimum: 1
 *                 example: 123
 *               complement:
 *                 type: string
 *                 maxLength: 100
 *                 example: Apto 45
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 pattern: "^[A-Z]{2}$"
 *                 example: SP
 *               zipCode:
 *                 type: string
 *                 pattern: "^\\d{5}-\\d{3}$"
 *                 example: 01310-100
 *     responses:
 *       201:
 *         description: Endereço criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 address:
 *                   $ref: '#/components/schemas/AddressResponse'
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
 */
routes.post(
  "/",
  authToken,
  addressControllers.createAddress.bind(addressControllers),
);

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     summary: Atualizar endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     description: Só funciona em endereços ativos do próprio usuário.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street: { type: string, maxLength: 100 }
 *               number: { type: integer, minimum: 1 }
 *               complement: { type: string, maxLength: 100 }
 *               city: { type: string, maxLength: 100 }
 *               state: { type: string, pattern: "^[A-Z]{2}$" }
 *               zipCode: { type: string, pattern: "^\\d{5}-\\d{3}$" }
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 address:
 *                   $ref: '#/components/schemas/AddressResponse'
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
 *         description: Endereço pertence a outro usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Endereço não encontrado ou inativo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/:id",
  authToken,
  addressControllers.updateAddress.bind(addressControllers),
);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Remover endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Remove o endereço do usuário autenticado.
 *       **Estratégia de deleção:**
 *       - Se o endereço não tem pedidos vinculados → delete físico (`softDeleted: false`).
 *       - Se tem pedidos vinculados → soft delete (`isActive=false`, `softDeleted: true`). O endereço
 *         deixa de aparecer na listagem mas os pedidos históricos são preservados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço removido ou desativado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteAddressResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Endereço pertence a outro usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Endereço não encontrado ou já removido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.delete(
  "/:id",
  authToken,
  addressControllers.deleteAddress.bind(addressControllers),
);

export default routes;
