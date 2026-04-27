/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Get,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImagesService } from './product-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class ProductImagesController {
  constructor(private readonly service: ProductImagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('products/:id/images')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('id') productId: string, @UploadedFile() file: any) {
    return this.service.upload(productId, file);
  }

  @Get('products/:id/images')
  find(@Param('id') productId: string) {
    return this.service.findByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('product-images/:id/main')
  setMain(@Param('id') id: string) {
    return this.service.setMain(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('product-images/:id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
