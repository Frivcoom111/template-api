import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Template - API",
    version,
    description: "API REST de e-commerce — Node.js, Express, Prisma, JWT",
  },
  servers: [
    { url: "http://localhost:3000", description: "Desenvolvimento" },
    {
      url: "https://api-development-daad.up.railway.app",
      description: "Produção",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticação e sessão" },
    { name: "Users", description: "Gerenciamento de usuários (ADMIN)" },
    { name: "Addresses", description: "Endereços de entrega do usuário" },
    {
      name: "Categories",
      description: "Categorias de produtos (ADMIN para escrita)",
    },
    { name: "Products", description: "Catálogo de produtos" },
    { name: "Cart", description: "Carrinho de compras" },
    { name: "Orders", description: "Pedidos" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtido em POST /auth/login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Mensagem de erro." },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 42 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          totalPages: { type: "integer", example: 3 },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@email.com" },
          role: { type: "string", enum: ["ADMIN", "USER"] },
          isActive: { type: "boolean", example: true },
        },
      },
      UserListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/UserResponse" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      AddressResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          street: { type: "string", example: "Rua das Flores" },
          number: { type: "integer", example: 123 },
          complement: { type: "string", nullable: true, example: "Apto 45" },
          city: { type: "string", example: "São Paulo" },
          state: { type: "string", example: "SP" },
          zipCode: { type: "string", example: "01310-100" },
        },
      },
      DeleteAddressResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          softDeleted: {
            type: "boolean",
            description:
              "true = apenas desativado (tinha pedidos vinculados). false = removido fisicamente.",
          },
        },
      },
      CategoryResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Headphones" },
          slug: { type: "string", example: "headphones" },
        },
      },
      ProductImageResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          url: {
            type: "string",
            format: "uri",
            example: "https://example.com/image.jpg",
          },
        },
      },
      ProductCategory: {
        type: "object",
        properties: {
          name: { type: "string", example: "Headphones" },
          slug: { type: "string", example: "headphones" },
        },
      },
      ProductResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Sony WH-1000XM5" },
          mark: { type: "string", example: "Sony" },
          description: { type: "string" },
          price: { type: "string", example: "1899.90" },
          stock: { type: "integer", example: 50 },
          imageUrl: { type: "string", format: "uri" },
          slug: { type: "string", example: "sony-wh-1000xm5" },
          category: { $ref: "#/components/schemas/ProductCategory" },
        },
      },
      ProductWithImages: {
        allOf: [
          { $ref: "#/components/schemas/ProductResponse" },
          {
            type: "object",
            properties: {
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductImageResponse" },
              },
            },
          },
        ],
      },
      ProductListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProductResponse" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      DeleteProductResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          softDeleted: {
            type: "boolean",
            description:
              "true = desativado (tinha OrderItems). false = deletado fisicamente.",
          },
          product: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
      CartItemProduct: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          mark: { type: "string" },
          price: { type: "string", example: "1899.90" },
          stock: { type: "integer" },
          imageUrl: { type: "string", format: "uri" },
          slug: { type: "string" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          quantity: { type: "integer", example: 2 },
          product: { $ref: "#/components/schemas/CartItemProduct" },
        },
      },
      CartResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", nullable: true },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          total: { type: "string", example: "3799.80" },
        },
      },
      OrderItemProduct: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          imageUrl: { type: "string", format: "uri" },
          slug: { type: "string" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          quantity: { type: "integer" },
          priceAtTime: { type: "string", example: "1899.90" },
          product: { $ref: "#/components/schemas/OrderItemProduct" },
        },
      },
      OrderResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          addressId: { type: "string", format: "uuid" },
          orderStatus: {
            type: "string",
            enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
          },
          total: { type: "string", example: "3799.80" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          address: { $ref: "#/components/schemas/AddressResponse" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
        },
      },
      OrderListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderResponse" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
    },
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts"],
};
