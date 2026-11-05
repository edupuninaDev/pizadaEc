import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

type AuthRequest = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: AuthRequest) {
    return this.ordersService.createOrder(req.user.id);
  }

  @Get()
  findMyOrders(@Req() req: AuthRequest) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.ordersService.findOne(id, req.user.id);
  }
}
