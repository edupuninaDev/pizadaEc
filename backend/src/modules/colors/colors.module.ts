import { Module } from '@nestjs/common';
import { ColorsController } from './colors.controller';
import { ColorsService } from './colors.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ColorsController],
  providers: [ColorsService],
})
export class ColorsModule {}
