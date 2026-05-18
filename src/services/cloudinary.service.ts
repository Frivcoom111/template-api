import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { getRequiredEnv } from "../utils/getRequiredEnv";
import { createError } from "../utils/createError";

const defaultUploadOptions: UploadApiOptions = {
  resource_type: "image",
  quality: "auto",
  fetch_format: "auto",
};

class CloudinaryService {
  private configured = false;

  private configure(): void {
    if (this.configured) return;
    cloudinary.config({
      cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
      api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
      api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
    });
    this.configured = true;
  }

  async uploadImage(
    buffer: Buffer,
    options: UploadApiOptions = {}
  ): Promise<{ url: string; public_id: string }> {
    this.configure();

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { ...defaultUploadOptions, ...options },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(createError("Falha ao enviar imagem para o Cloudinary.", 502));
            return;
          }

          const url = result.secure_url ?? result.url;

          if (!url) {
            reject(createError("Resposta inválida do Cloudinary.", 502));
            return;
          }

          resolve({ url, public_id: result.public_id });
        }
      );

      stream.end(buffer);
    });
  }
}

export default new CloudinaryService();
