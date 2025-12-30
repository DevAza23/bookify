import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    // Generate slug from title
    const slug = this.generateSlug(dto.title);

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        slug,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        locationType: (dto.locationType as any) || 'ONLINE',
        priceType: (dto.priceType as any) || 'FREE',
        isPublic: dto.isPublic ?? true,
        status: 'PUBLISHED',
        questions: dto.questions
          ? {
              create: dto.questions.map((q) => ({
                question: q.question,
                type: q.type as any,
                isRequired: q.isRequired ?? false,
                options: q.options,
                order: q.order ?? 0,
              })),
            }
          : undefined,
        hostRoles: {
          create: {
            userId,
            role: 'HOST',
          },
        },
      },
      include: {
        hostRoles: {
          include: {
            user: true,
          },
        },
        questions: true,
      },
    });

    return event;
  }

  async findAll(filters?: { status?: EventStatus; userId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.hostRoles = {
        some: {
          userId: filters.userId,
        },
      };
    }

    return this.prisma.event.findMany({
      where,
      include: {
        hostRoles: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findOne(idOrSlug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        hostRoles: {
          include: {
            user: true,
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            rsvps: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    // Check if user is host
    const role = await this.prisma.eventHostRole.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (!role || role.role !== 'HOST') {
      throw new ForbiddenException('Only event hosts can update events');
    }

    const updateData: any = { ...dto };
    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        hostRoles: {
          include: {
            user: true,
          },
        },
        questions: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if user is host
    const role = await this.prisma.eventHostRole.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (!role || role.role !== 'HOST') {
      throw new ForbiddenException('Only event hosts can delete events');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getAttendees(eventId: string, userId: string) {
    // Check if user is host or staff
    const role = await this.prisma.eventHostRole.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!role) {
      throw new ForbiddenException('Only event hosts or staff can view attendees');
    }

    return this.prisma.rSVP.findMany({
      where: {
        eventId,
        status: {
          in: ['CONFIRMED', 'WAITLISTED'],
        },
      },
      include: {
        user: true,
        answers: {
          include: {
            question: true,
          },
        },
        checkIns: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getAnalytics(eventId: string, userId: string) {
    // Check if user is host
    const role = await this.prisma.eventHostRole.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!role || role.role !== 'HOST') {
      throw new ForbiddenException('Only event hosts can view analytics');
    }

    const [totalRSVPs, confirmedRSVPs, waitlistedRSVPs, checkedIn] = await Promise.all([
      this.prisma.rSVP.count({ where: { eventId } }),
      this.prisma.rSVP.count({ where: { eventId, status: 'CONFIRMED' } }),
      this.prisma.rSVP.count({ where: { eventId, status: 'WAITLISTED' } }),
      this.prisma.checkIn.count({ where: { eventId } }),
    ]);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { capacity: true },
    });

    return {
      totalRSVPs,
      confirmedRSVPs,
      waitlistedRSVPs,
      checkedIn,
      capacity: event?.capacity,
      availableSpots: event?.capacity ? event.capacity - confirmedRSVPs : null,
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }
}
