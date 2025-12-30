import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TelegramAuthService } from './telegram-auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private telegramAuth: TelegramAuthService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Post('telegram')
  async authenticate(@Body() body: { initData: string }) {
    if (!body.initData) {
      throw new UnauthorizedException('initData is required');
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    // Verify initData
    const verified = this.telegramAuth.verifyInitData(body.initData, botToken);

    // Find or create user
    const user = await this.telegramAuth.findOrCreateUser(verified.user);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId.toString(),
    });

    return {
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    };
  }
}

