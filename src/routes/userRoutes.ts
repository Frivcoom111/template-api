import express from "express";
import userControllers from "../controllers/userControllers";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Lista paginada de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
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
 */
routes.get(
  "/",
  authToken,
  authAdminOnly,
  userControllers.getUsers.bind(userControllers),
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Criar usuário (admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Ana Lima
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@email.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Senha123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: USER
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 userCreated:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.post(
  "/",
  authToken,
  authAdminOnly,
  userControllers.createUser.bind(userControllers),
);

/**
 * @swagger
 * /users/update/me:
 *   patch:
 *     summary: Atualizar dados do próprio perfil
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updatedUser:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/update/me",
  authToken,
  userControllers.updateUser.bind(userControllers),
);

/**
 * @swagger
 * /users/update/password:
 *   patch:
 *     summary: Alterar senha do próprio usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: SenhaAntiga1
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número"
 *                 example: NovaSenha2
 *     responses:
 *       200:
 *         description: Senha alterada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updatedUser:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Senha atual incorreta ou token inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/update/password",
  authToken,
  userControllers.updateUserPassword.bind(userControllers),
);

/**
 * @swagger
 * /users/update/{id}/role:
 *   patch:
 *     summary: Alterar role de um usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updatedUser:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Usuário já possui esse role
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/update/:id/role",
  authToken,
  authAdminOnly,
  userControllers.updateUserRole.bind(userControllers),
);

/**
 * @swagger
 * /users/toggle/{id}:
 *   patch:
 *     summary: Ativar/desativar usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN. Soft delete — usuário não é deletado fisicamente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Status do usuário alternado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 userToggle:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: isActive não é boolean
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
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Usuário já está no estado solicitado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/toggle/:id",
  authToken,
  authAdminOnly,
  userControllers.toggle.bind(userControllers),
);

export default routes;
