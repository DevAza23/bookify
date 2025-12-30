import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { TelegramAuthService } from './telegram-auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TelegramAuthService', () => {
  let service: TelegramAuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramAuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TelegramAuthService>(TelegramAuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyInitData', () => {
    const botToken = 'test-bot-token';
    const validInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%7D&auth_date=1234567890&hash=test-hash';

    it('should throw if hash is missing', () => {
      expect(() => {
        service.verifyInitData('user=test&auth_date=1234567890', botToken);
      }).toThrow(UnauthorizedException);
    });

    it('should throw if auth_date is missing', () => {
      expect(() => {
        service.verifyInitData('user=test&hash=test-hash', botToken);
      }).toThrow(UnauthorizedException);
    });

    // Note: Full HMAC verification test would require mocking crypto or using real Telegram test data
    // This is a simplified test structure
  });
});

