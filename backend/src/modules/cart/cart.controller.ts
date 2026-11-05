import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type AuthRequest = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addItem(@Req() req: AuthRequest, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req: AuthRequest,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  @Delete('items/:id')
  removeItem(@Req() req: AuthRequest, @Param('id') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete()
  clearCart(@Req() req: AuthRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
