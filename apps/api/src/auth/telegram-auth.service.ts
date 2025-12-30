import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VerifiedInitData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

@Injectable()
export class TelegramAuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify Telegram initData using HMAC-SHA256
   * @param initData Raw initData string from Telegram WebApp
   * @param botToken Telegram bot token
   * @returns Verified user data
   */
  verifyInitData(initData: string, botToken: string): VerifiedInitData {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const authDate = urlParams.get('auth_date');

    if (!hash || !authDate) {
      throw new UnauthorizedException('Invalid initData: missing hash or auth_date');
    }

    // Check auth_date is not older than 24 hours
    const authDateTimestamp = parseInt(authDate, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDateTimestamp > 86400) {
      throw new UnauthorizedException('initData expired');
    }

    // Remove hash from params and create data-check-string
    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid initData: hash mismatch');
    }

    // Parse user data
    const userParam = urlParams.get('user');
    if (!userParam) {
      throw new UnauthorizedException('Invalid initData: missing user');
    }

    const user: TelegramUser = JSON.parse(userParam);

    return {
      user,
      auth_date: authDateTimestamp,
      hash,
    };
  }

  /**
   * Find or create user from Telegram data
   */
  async findOrCreateUser(telegramUser: TelegramUser) {
    const telegramId = BigInt(telegramUser.id);

    const user = await this.prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
      },
      create: {
        telegramId,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
      },
    });

    return user;
  }
}

