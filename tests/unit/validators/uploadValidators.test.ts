import { describe, it, expect } from 'vitest';
import { MAX_UPLOAD_SIZE, uploadImageSchema } from '../../../src/validators/uploadValidators.js';

describe('uploadImageSchema', () => {
  it('aceita arquivos jpeg, png e webp', () => {
    const result = uploadImageSchema.safeParse({
      mimetype: 'image/png',
      size: MAX_UPLOAD_SIZE - 1
    });

    expect(result.success).toBe(true);
  });

  it('rejeita tipo inválido', () => {
    const result = uploadImageSchema.safeParse({
      mimetype: 'image/gif',
      size: 2000
    });

    expect(result.success).toBe(false);
  });

  it('rejeita tamanho acima de 5MB', () => {
    const result = uploadImageSchema.safeParse({
      mimetype: 'image/jpeg',
      size: MAX_UPLOAD_SIZE + 1
    });

    expect(result.success).toBe(false);
  });
});
