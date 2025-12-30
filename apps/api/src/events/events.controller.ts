import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HostGuard } from '../auth/guards/host.guard';
import { HostOrStaffGuard } from '../auth/guards/host-or-staff.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(user.userId, createEventDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('userId') userId?: string) {
    return this.eventsService.findAll({
      status: status as any,
      userId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, HostGuard)
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, user.userId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, HostGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.remove(id, user.userId);
  }

  @Get(':id/attendees')
  @UseGuards(JwtAuthGuard, HostOrStaffGuard)
  getAttendees(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.getAttendees(id, user.userId);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, HostGuard)
  getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.getAnalytics(id, user.userId);
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard, HostGuard)
  async exportCSV(@Param('id') id: string, @CurrentUser() user: any) {
    const attendees = await this.eventsService.getAttendees(id, user.userId);
    const event = await this.eventsService.findOne(id);

    // Generate CSV
    const headers = ['Name', 'Email', 'Phone', 'Guest Count', 'Status', 'RSVP Date', 'Checked In'];
    const rows = attendees.map((rsvp) => [
      rsvp.name || `${rsvp.user.firstName} ${rsvp.user.lastName || ''}`.trim(),
      rsvp.email || '',
      rsvp.phone || '',
      rsvp.guestCount.toString(),
      rsvp.status,
      rsvp.createdAt.toISOString(),
      rsvp.checkIns.length > 0 ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return {
      csv,
      filename: `${event.slug}-attendees-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }
}

