import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateColorDto) {
    const exist = await this.prisma.color.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (exist) {
      throw new BadRequestException('Color already exists');
    }

    return this.prisma.color.create({
      data: {
        name: dto.name,
        hexCode: dto.hexCode,
      },
    });
  }

  findAll() {
    return this.prisma.color.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new BadRequestException('Color no encontrado');
    }

    return color;
  }

  async update(id: string, dto: UpdateColorDto) {
    await this.findOne(id);

    return this.prisma.color.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.color.delete({
      where: { id },
    });
  }
}
