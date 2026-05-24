import nodemailer from "nodemailer";
import { getRequiredEnv } from "../utils/getRequiredEnv";

const transporter = nodemailer.createTransport({
  host: getRequiredEnv("MAIL_HOST"),
  port: Number(getRequiredEnv("MAIL_PORT")),
  auth: {
    user: getRequiredEnv("MAIL_USER"),
    pass: getRequiredEnv("MAIL_PASSWORD"),
  },
});

export default transporter;
