import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRSVPDto } from './dto/create-rsvp.dto';

@Injectable()
export class RSVPService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, userId: string, dto: CreateRSVPDto) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        questions: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not published');
    }

    // Check if user already RSVPed
    const existingRSVP = await this.prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRSVP && existingRSVP.status !== 'CANCELLED') {
      throw new BadRequestException('You have already RSVPed to this event');
    }

    // Determine status based on capacity
    let status: 'CONFIRMED' | 'WAITLISTED' = 'CONFIRMED';
    const guestCount = dto.guestCount || 1;
    
    // Calculate total confirmed spots (sum of all guestCounts)
    const confirmedRsvps = await this.prisma.rSVP.findMany({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
      select: {
        guestCount: true,
      },
    });
    const currentConfirmed = confirmedRsvps.reduce((sum, rsvp) => sum + rsvp.guestCount, 0);
    const capacity = event.capacity;

    if (capacity && currentConfirmed + guestCount > capacity) {
      status = 'WAITLISTED';
    }

    // Create or update RSVP
    const rsvp = await this.prisma.rSVP.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status,
        guestCount,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        consentGiven: dto.consentGiven ?? false,
        notes: dto.notes,
        answers: dto.answers
          ? {
              deleteMany: {},
              create: dto.answers.map((answer) => ({
                questionId: answer.questionId,
                answer: answer.answer,
              })),
            }
          : undefined,
      },
      create: {
        eventId,
        userId,
        status,
        guestCount,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        consentGiven: dto.consentGiven ?? false,
        notes: dto.notes,
        answers: dto.answers
          ? {
              create: dto.answers.map((answer) => ({
                questionId: answer.questionId,
                answer: answer.answer,
              })),
            }
          : undefined,
      },
      include: {
        event: true,
        user: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // TODO: Send Telegram notification (placeholder)
    // await this.sendRSVPNotification(rsvp);

    return rsvp;
  }

  async findMyRSVP(eventId: string, userId: string) {
    return this.prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      include: {
        event: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async cancel(eventId: string, userId: string) {
    const rsvp = await this.prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    return this.prisma.rSVP.update({
      where: { id: rsvp.id },
      data: { status: 'CANCELLED' },
    });
  }
}

