import { Controller, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HostOrStaffGuard } from '../auth/guards/host-or-staff.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('events/:id/checkin')
export class CheckInController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, HostOrStaffGuard)
  async checkIn(@Param('id') eventId: string, @CurrentUser() user: any, @Body() body: { rsvpId: string }) {
    const rsvp = await this.prisma.rSVP.findUnique({
      where: { id: body.rsvpId },
      include: { event: true },
    });

    if (!rsvp || rsvp.eventId !== eventId) {
      throw new NotFoundException('RSVP not found or does not belong to this event');
    }

    // Check if already checked in
    const existingCheckIn = await this.prisma.checkIn.findUnique({
      where: { rsvpId: body.rsvpId },
    });

    if (existingCheckIn) {
      return { message: 'Already checked in', checkIn: existingCheckIn };
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        eventId,
        rsvpId: body.rsvpId,
        userId: rsvp.userId,
        checkedInBy: user.userId,
      },
      include: {
        rsvp: {
          include: {
            user: true,
          },
        },
      },
    });

    return checkIn;
  }
}

