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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type CategoryEntity = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  products?: unknown[];
};

@Injectable()
export class CategoriesService {
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

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = this.generateSlug(createCategoryDto.name);

    const exists = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: createCategoryDto.name }, { slug }],
      },
    });

    if (exists) {
      throw new BadRequestException('La categoría ya existe');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
      },
    });
  }

  findAll(): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    await this.findOne(id);

    const slug = updateCategoryDto.name
      ? this.generateSlug(updateCategoryDto.name)
      : undefined;

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async remove(id: string): Promise<CategoryEntity> {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
