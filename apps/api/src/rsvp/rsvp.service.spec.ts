import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RSVPService } from './rsvp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RSVPService', () => {
  let service: RSVPService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      findUnique: jest.fn(),
    },
    rSVP: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RSVPService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RSVPService>(RSVPService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.create('event-id', 'user-id', {
          guestCount: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if event is not published', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-id',
        status: 'DRAFT',
      });

      await expect(
        service.create('event-id', 'user-id', {
          guestCount: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create RSVP successfully', async () => {
      const mockEvent = {
        id: 'event-id',
        status: 'PUBLISHED',
        capacity: 100,
        questions: [],
      };

      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.rSVP.findUnique.mockResolvedValue(null);
      mockPrismaService.rSVP.findMany.mockResolvedValue([
        { guestCount: 5 },
        { guestCount: 3 },
        { guestCount: 2 },
      ]); // Total: 10 guests confirmed
      mockPrismaService.rSVP.upsert.mockResolvedValue({
        id: 'rsvp-id',
        eventId: 'event-id',
        userId: 'user-id',
        status: 'CONFIRMED',
        guestCount: 1,
      });

      const result = await service.create('event-id', 'user-id', {
        guestCount: 1,
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(result).toBeDefined();
      expect(mockPrismaService.rSVP.upsert).toHaveBeenCalled();
    });
  });
});

