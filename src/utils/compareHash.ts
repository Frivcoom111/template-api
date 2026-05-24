import bcrypt from "bcrypt";

export const compareHash = async (
  value: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(value, hash);
};
