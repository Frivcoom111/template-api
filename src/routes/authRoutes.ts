import express from "express";
import authControllers from "../controllers/authControllers";
import emailControllers from "../controllers/emailControllers";
import { authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número"
 *                 example: Senha123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userCreated:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post("/register", authControllers.register.bind(authControllers));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login e obtenção do token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: Senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT para usar no header Authorization
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Email ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post("/login", authControllers.login.bind(authControllers));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout e invalidação do token JWT
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post("/logout", authToken, authControllers.logout.bind(authControllers));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.get("/me", authToken, authControllers.getUser.bind(authControllers));

/**
 * @swagger
 * /auth/send-email:
 *   post:
 *     summary: Enviar código de verificação de e-mail
 *     description: Gera um código de 6 dígitos, armazena no Redis por 5 minutos e envia para o e-mail do usuário autenticado. Retorna erro se o e-mail já estiver verificado ou se já houver um código ativo.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Código enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Código de verificação enviado com sucesso.
 *       400:
 *         description: E-mail já verificado ou código ainda ativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post(
  "/send-email",
  authToken,
  emailControllers.sendEmail.bind(emailControllers),
);

/**
 * @swagger
 * /auth/verified-email:
 *   post:
 *     summary: Verificar e-mail com código recebido
 *     description: Valida o código de 6 dígitos enviado ao e-mail. Marca o usuário como verificado e remove o código do Redis. Retorna erro se o código estiver expirado, incorreto ou o e-mail já estiver verificado.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: integer
 *                 minimum: 100000
 *                 maximum: 999999
 *                 example: 482931
 *     responses:
 *       200:
 *         description: E-mail verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: E-mail validado com sucesso.
 *       400:
 *         description: Código inválido, expirado ou e-mail já verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post(
  "/verified-email",
  authToken,
  emailControllers.verifyEmail.bind(emailControllers),
);

export default routes;
