/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable } from '@nestjs/common';
import { dot } from 'node:test/reporters';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSizeDto) {
    const exists = await this.prisma.size.findUnique({
      where: { value: dto.value },
    });

    if (exists) {
      throw new BadRequestException('La talla ya existe');
    }

    return this.prisma.size.create({
      data: {
        value: dto.value,
      },
    });
  }

  findAll() {
    return this.prisma.size.findMany({
      orderBy: { value: 'asc' },
    });
  }

  async findOne(id: string) {
    const size = await this.prisma.size.findUnique({
      where: { id },
    });

    if (!size) {
      throw new BadRequestException('Talla no encontrada');
    }

    return size;
  }

  async update(id: string, dto: UpdateSizeDto) {
    await this.findOne(id);

    return this.prisma.size.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.size.delete({
      where: { id },
    });
  }
}
