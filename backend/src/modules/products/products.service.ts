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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Decimal } from '@prisma/client/runtime/client';

type ProductEntity = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  basePrice: Decimal;
  gender: string | null;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: unknown;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('La categoría no existe');
    }

    const slug = this.generateSlug(createProductDto.name);

    const productExists = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (productExists) {
      throw new BadRequestException('El producto ya existe');
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug,
        description: createProductDto.description,
        brand: createProductDto.brand,
        basePrice: createProductDto.basePrice,
        gender: createProductDto.gender,
        isFeatured: createProductDto.isFeatured ?? false,
        categoryId: createProductDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            size: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            size: true,
            color: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    await this.findOne(id);

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('La categoría no existe');
      }
    }

    const slug = updateProductDto.name
      ? this.generateSlug(updateProductDto.name)
      : undefined;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(slug ? { slug } : {}),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string): Promise<ProductEntity> {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
