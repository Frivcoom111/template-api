import type {
  AddressResponse,
  CreateAddressDTO,
  UpdateAddressDTO,
} from "../interfaces/address.interface";
import prisma from "../lib/prisma";
import { createError } from "../utils/createError";

const addressSelect = {
  id: true,
  userId: true,
  street: true,
  number: true,
  complement: true,
  city: true,
  state: true,
  zipCode: true,
} as const;

class AddressService {
  async #findOwnedActiveAddress(
    addressId: string,
    userId: string,
  ): Promise<AddressResponse> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, isActive: true },
      select: addressSelect,
    });

    if (!address) throw createError("Endereço não encontrado.", 404);
    if (address.userId !== userId) throw createError("Acesso negado.", 403);

    return address;
  }

  async getAddresses(userId: string): Promise<AddressResponse[]> {
    return await prisma.address.findMany({
      where: { userId, isActive: true },
      select: addressSelect,
    });
  }

  async getAddressById(
    addressId: string,
    userId: string,
    role: string,
  ): Promise<AddressResponse> {
    const where =
      role === "ADMIN" ? { id: addressId } : { id: addressId, isActive: true };

    const address = await prisma.address.findFirst({
      where,
      select: addressSelect,
    });

    if (!address) throw createError("Endereço não encontrado.", 404);

    if (role !== "ADMIN" && address.userId !== userId)
      throw createError("Acesso negado.", 403);

    return address;
  }

  async createAddress(
    userId: string,
    data: CreateAddressDTO,
  ): Promise<AddressResponse> {
    return await prisma.address.create({
      data: { userId, ...data },
      select: addressSelect,
    });
  }

  async updateAddress(
    addressId: string,
    userId: string,
    data: UpdateAddressDTO,
  ): Promise<AddressResponse> {
    await this.#findOwnedActiveAddress(addressId, userId);

    return await prisma.address.update({
      where: { id: addressId },
      data,
      select: addressSelect,
    });
  }

  async deleteAddress(
    addressId: string,
    userId: string,
  ): Promise<{ softDeleted: boolean }> {
    await this.#findOwnedActiveAddress(addressId, userId);

    const linkedOrders = await prisma.orders.count({ where: { addressId } });

    if (linkedOrders > 0) {
      await prisma.address.update({
        where: { id: addressId },
        data: { isActive: false },
      });
      return { softDeleted: true };
    }

    await prisma.address.delete({ where: { id: addressId } });
    return { softDeleted: false };
  }
}

export default new AddressService();
