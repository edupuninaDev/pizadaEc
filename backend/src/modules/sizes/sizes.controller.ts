import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SizesService } from './sizes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSizeDto } from './dto/create-size.dto';

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSizeDto) {
    return this.sizesService.create(dto);
  }

  @Get()
  findAll() {
    return this.sizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateSizeDto) {
    return this.sizesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizesService.remove(id);
  }
}
