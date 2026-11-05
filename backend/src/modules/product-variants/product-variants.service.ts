/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const size = await this.prisma.size.findUnique({
      where: { id: dto.sizeId },
    });

    if (!size) {
      throw new NotFoundException('Talla no encontrada');
    }

    const color = await this.prisma.color.findUnique({
      where: { id: dto.colorId },
    });

    if (!color) {
      throw new NotFoundException('Color no encontrado');
    }

    const exists = await this.prisma.productVariant.findFirst({
      where: {
        productId: dto.productId,
        sizeId: dto.sizeId,
        colorId: dto.colorId,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Ya existe una variante para este producto, talla y color',
      );
    }

    const skuExists = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });

    if (skuExists) {
      throw new BadRequestException('El SKU ya existe');
    }

    return this.prisma.productVariant.create({
      data: {
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
        productId: dto.productId,
        sizeId: dto.sizeId,
        colorId: dto.colorId,
        isActive: dto.isActive ?? true,
      },
      include: {
        product: true,
        size: true,
        color: true,
      },
    });
  }

  findAll() {
    return this.prisma.productVariant.findMany({
      include: {
        product: true,
        size: true,
        color: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        size: true,
        color: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    return variant;
  }

  findByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: {
        size: true,
        color: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateProductVariantDto) {
    await this.findOne(id);

    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
    }

    if (dto.sizeId) {
      const size = await this.prisma.size.findUnique({
        where: { id: dto.sizeId },
      });

      if (!size) {
        throw new NotFoundException('Talla no encontrada');
      }
    }

    if (dto.colorId) {
      const color = await this.prisma.color.findUnique({
        where: { id: dto.colorId },
      });

      if (!color) {
        throw new NotFoundException('Color no encontrado');
      }
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: dto,
      include: {
        product: true,
        size: true,
        color: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.productVariant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
