/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductImage } from '@prisma/client';

type MulterFilter = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async upload(productId: string, file: MulterFilter): Promise<ProductImage> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }
    const upload = await this.cloudinaryService.uploadImage(file);

    const isFirstImage =
      (await this.prisma.productImage.count({
        where: { productId },
      })) === 0;

    return this.prisma.productImage.create({
      data: {
        imageUrl: upload.secure_url,
        publicId: upload.public_id,
        isMain: isFirstImage,
        productId,
      },
    });
  }
  findByProduct(productId: string): Promise<ProductImage[]> {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<ProductImage[]>;
  }

  async setMain(imageId: string): Promise<ProductImage> {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Imagen no encontrada');
    }

    await this.prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isMain: false },
    });
    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });
  }

  async delete(imageId: string): Promise<ProductImage> {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.cloudinaryService.deleteImage(image.publicId);

    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }
}
