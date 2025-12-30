import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import rateLimit from 'express-rate-limit';

// Simple in-memory rate limiter (use Redis in production)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: 'Too many RSVP requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable((observer) => {
      limiter(request, response, (err) => {
        if (err) {
          observer.error(new HttpException(err.message, HttpStatus.TOO_MANY_REQUESTS));
          return;
        }
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}

