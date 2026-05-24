import Redis from "ioredis";
import { getRequiredEnv } from "../utils/getRequiredEnv";

const REDIS_HOST: string = getRequiredEnv("REDIS_HOST");
const REDIS_PORT: number = Number(getRequiredEnv("REDIS_PORT"));

const redis = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  password: getRequiredEnv("REDIS_PASSWORD"),
  db: 0,
});

export default redis;
