import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HostGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const eventId = request.params.id || request.body.eventId;

    if (!user || !eventId) {
      throw new ForbiddenException('Access denied');
    }

    const role = await this.prisma.eventHostRole.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.userId,
        },
      },
    });

    if (!role || role.role !== 'HOST') {
      throw new ForbiddenException('Only event hosts can perform this action');
    }

    return true;
  }
}

