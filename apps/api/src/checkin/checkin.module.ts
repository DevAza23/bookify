import { Module } from '@nestjs/common';
import { CheckInController } from './checkin.controller';

@Module({
  controllers: [CheckInController],
})
export class CheckInModule {}

