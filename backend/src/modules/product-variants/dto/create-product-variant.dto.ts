import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  sizeId!: string;

  @IsString()
  @IsNotEmpty()
  colorId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
