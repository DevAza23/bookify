import { Controller, Post, Get, Delete, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { RSVPService } from './rsvp.service';
import { CreateRSVPDto } from './dto/create-rsvp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';

@Controller('events/:eventId/rsvp')
export class RSVPController {
  constructor(private readonly rsvpService: RSVPService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(RateLimitInterceptor)
  create(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
    @Body() createRSVPDto: CreateRSVPDto,
  ) {
    return this.rsvpService.create(eventId, user.userId, createRSVPDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyRSVP(@Param('eventId') eventId: string, @CurrentUser() user: any) {
    return this.rsvpService.findMyRSVP(eventId, user.userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  cancel(@Param('eventId') eventId: string, @CurrentUser() user: any) {
    return this.rsvpService.cancel(eventId, user.userId);
  }
}

