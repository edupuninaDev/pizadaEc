import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

type MulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  uploadImage(file: MulterFile): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      if (!file?.buffer) {
        return reject(new InternalServerErrorException('Archivo inválido'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pizadaec/products',
        },
        (error, result) => {
          // CAMBIO AQUÍ: Verificamos si error existe y lo envolvemos
          if (error) {
            return reject(
              new InternalServerErrorException(
                error.message || 'Error desconocido en Cloudinary',
              ),
            );
          }

          if (!result) {
            return reject(
              new InternalServerErrorException('Error subiendo imagen'),
            );
          }

          resolve(result);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
