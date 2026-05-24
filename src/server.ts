import "dotenv/config";
import app from "./app";
import { getRequiredEnv } from "./utils/getRequiredEnv";

const PORT = parseInt(getRequiredEnv("PORT")) ?? 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
