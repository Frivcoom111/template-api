import express from "express";
import productImagesControllers from "../controllers/productImagesControllers";
import productsControllers from "../controllers/productsControllers";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares";

const routes = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Products]
 *     description: Retorna apenas produtos ativos (`isActive=true`). Suporta filtro por categoria e busca textual.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Slug da categoria para filtrar
 *         example: headphones
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Busca por nome ou marca (case-insensitive)
 *         example: Sony
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Lista paginada de produtos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 */
routes.get("/", productsControllers.getProducts.bind(productsControllers));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Products]
 *     description: Retorna 404 se o produto estiver inativo.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado (com galeria de imagens)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/ProductWithImages'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Produto não encontrado ou inativo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/:id",
  productsControllers.getProductById.bind(productsControllers),
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, mark, description, price, stock, imageUrl]
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Sony WH-1000XM5
 *               mark:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Sony
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Fone over-ear com cancelamento de ruído premium
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 example: 1899.90
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
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
 *         description: Produto com mesmo nome já existe
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.post(
  "/",
  authToken,
  authAdminOnly,
  productsControllers.createProduct.bind(productsControllers),
);

/**
 * @swagger
 * /products/update/{id}:
 *   patch:
 *     summary: Atualizar produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN. Todos os campos são opcionais (partial update).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               name: { type: string, minLength: 3, maxLength: 100 }
 *               mark: { type: string, minLength: 2, maxLength: 100 }
 *               description: { type: string, minLength: 10 }
 *               price: { type: number, format: double, minimum: 0.01 }
 *               stock: { type: integer, minimum: 0 }
 *               imageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Produto atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
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
 *         description: Produto ou categoria não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Nome já em uso por outro produto
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.patch(
  "/update/:id",
  authToken,
  authAdminOnly,
  productsControllers.updateProduct.bind(productsControllers),
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Requer role ADMIN.
 *       **Estratégia de deleção:**
 *       - Se o produto não tem `OrderItem` vinculado → delete físico com cascade em `ProductImage` (`softDeleted: false`).
 *       - Se tem `OrderItem` → soft delete (`isActive=false`, `softDeleted: true`) + remove o produto de todos os carrinhos.
 *       Produto desativado não aparece no catálogo nem pode ser adicionado ao carrinho.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado ou desativado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteProductResponse'
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
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Produto já foi removido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.delete(
  "/:id",
  authToken,
  authAdminOnly,
  productsControllers.deleteProduct.bind(productsControllers),
);

/**
 * @swagger
 * /products/{productId}/images:
 *   get:
 *     summary: Listar imagens de um produto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Lista de imagens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductImageResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.get(
  "/:productId/images",
  productImagesControllers.getImages.bind(productImagesControllers),
);

/**
 * @swagger
 * /products/{productId}/images:
 *   post:
 *     summary: Adicionar imagem ao produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image2.jpg
 *     responses:
 *       201:
 *         description: Imagem adicionada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 image:
 *                   $ref: '#/components/schemas/ProductImageResponse'
 *       400:
 *         description: URL inválida
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
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.post(
  "/:productId/images",
  authToken,
  authAdminOnly,
  productImagesControllers.addImage.bind(productImagesControllers),
);

/**
 * @swagger
 * /products/{productId}/images/{imageId}:
 *   delete:
 *     summary: Remover imagem do produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do produto
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID da imagem
 *     responses:
 *       200:
 *         description: Imagem removida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 image:
 *                   $ref: '#/components/schemas/ProductImageResponse'
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
 *         description: Imagem não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routes.delete(
  "/:productId/images/:imageId",
  authToken,
  authAdminOnly,
  productImagesControllers.removeImage.bind(productImagesControllers),
);

export default routes;
