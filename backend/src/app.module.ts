import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProductImagesModule } from './modules/product-images/product-images.module';
import { SizesModule } from './modules/sizes/sizes.module';
import { ColorsModule } from './modules/colors/colors.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CloudinaryModule,
    ProductImagesModule,
    SizesModule,
    ColorsModule,
    ProductVariantsModule,
  ],
})
export class AppModule {}
