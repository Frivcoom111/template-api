import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./config/swagger";
import { errorMiddleware } from "./middlewares/errorMiddlewares";
import addressRoutes from "./routes/addressRoutes";

import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import orderRoutes from "./routes/orderRoutes";
<<<<<<< Updated upstream
=======
import productsRoutes from "./routes/productsRoutes";
import userRoutes from "./routes/userRoutes";
import { getRequiredEnv } from "./utils/getRequiredEnv";
>>>>>>> Stashed changes

const app = express();

// Quem pode acessar sua API
app.use(
  cors({
    origin: getRequiredEnv("FRONTEND_URL"),
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

// Segurança: cabeçalhos HTTP protegidos
app.use(helmet());

// Limite de requisições por IP
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
});

app.use(defaultLimiter);
app.use("/auth", authLimiter);

app.use(express.json({ limit: "10kb" })); // Limite de arquivos que podem ser enviados na request.

if (process.env.NODE_ENV !== "production") {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Rotas API.
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);

// Usado para captura de errors e retornar em JSON ao invés de HTML assim como o Express retorna.
app.use(errorMiddleware); // ← sempre o ÚLTIMO

export default app;
