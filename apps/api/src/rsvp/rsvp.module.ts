import { Module } from '@nestjs/common';
import { RSVPService } from './rsvp.service';
import { RSVPController } from './rsvp.controller';

@Module({
  controllers: [RSVPController],
  providers: [RSVPService],
})
export class RSVPModule {}

