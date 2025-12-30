# Architecture Overview

## System Architecture

This Telegram Mini App (TWA) for event registration follows a modern full-stack architecture with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────┐
│  Telegram App   │
│  (User Device)  │
└────────┬─────────┘
         │ HTTPS
         │ initData
         ▼
┌─────────────────┐
│   Next.js Web   │  ◄─── React Components
│   (Port 3000)   │      Telegram WebApp SDK
└────────┬────────┘      Tailwind CSS
         │ HTTP
         │ API Calls
         ▼
┌─────────────────┐
│  NestJS API     │  ◄─── REST Endpoints
│  (Port 3001)    │      JWT Auth
└────────┬────────┘      Validation
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │  ◄─── Prisma ORM
│   (Port 5432)   │      Migrations
└─────────────────┘
```

## Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Telegram theme variables
- **Telegram Integration**: Telegram WebApp SDK (initData, theme, haptics)
- **Utilities**: date-fns, QRCode, ICS calendar generation

### Backend (apps/api)
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + Telegram initData verification (HMAC-SHA256)
- **Validation**: class-validator, class-transformer
- **Rate Limiting**: express-rate-limit

### Database (packages/prisma)
- **Schema**: Prisma schema with 8 models
- **Migrations**: Prisma Migrate
- **Client**: Generated Prisma Client

## Data Flow

### Authentication Flow

1. User opens Mini App in Telegram
2. Telegram provides `initData` to frontend
3. Frontend sends `initData` to `/auth/telegram`
4. Backend verifies `initData` using HMAC-SHA256
5. Backend creates/updates User record
6. Backend returns JWT token
7. Frontend stores JWT in localStorage
8. Subsequent requests include JWT in Authorization header

### Event Creation Flow

1. User fills out event creation form
2. Frontend sends POST `/events` with event data
3. Backend validates data (class-validator)
4. Backend creates Event + EventHostRole (HOST)
5. Backend generates slug from title
6. Returns created event with ID

### RSVP Flow

1. User views public event page
2. Clicks "RSVP" button
3. Fills out RSVP form (name, email, questions)
4. Frontend sends POST `/events/:id/rsvp`
5. Backend checks capacity
6. Sets status: CONFIRMED or WAITLISTED
7. Creates RSVP + RSVPAnswer records
8. Returns RSVP with status
9. Frontend shows confirmation page with QR code

### Check-In Flow

1. Host/staff opens check-in scanner
2. Scans QR code from attendee's ticket
3. QR contains RSVP ID
4. Frontend sends POST `/events/:id/checkin` with rsvpId
5. Backend verifies host/staff role
6. Creates CheckIn record
7. Returns check-in confirmation

## Database Schema

### Core Models

- **User**: Telegram user data (telegramId, name, username)
- **Event**: Event metadata (title, dates, location, capacity, price)
- **EventHostRole**: Host/staff assignments (eventId, userId, role)
- **RSVP**: RSVP records (eventId, userId, status, guestCount)
- **RSVPAnswer**: Answers to custom questions
- **EventQuestion**: Custom RSVP questions
- **CheckIn**: Check-in records (rsvpId, checkedInBy, timestamp)
- **EventMedia**: Event cover images/media

### Key Relationships

- Event 1:N EventHostRole (hosts/staff)
- Event 1:N RSVP (attendees)
- Event 1:N EventQuestion (custom questions)
- RSVP 1:N RSVPAnswer (question answers)
- RSVP 1:1 CheckIn (check-in record)

## Security

### Telegram Authentication
- initData verification using HMAC-SHA256
- Secret key derived from bot token
- Auth date validation (24-hour expiry)
- Hash comparison prevents tampering

### API Security
- JWT tokens with 7-day expiry
- Role-based access control (host/staff guards)
- Input validation (class-validator)
- Rate limiting on RSVP endpoint (100/hour)
- CORS configuration

### Data Protection
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React escaping)
- CSRF protection (same-origin policy)

## Deployment

### Docker Compose Setup

Three services:
1. **db**: PostgreSQL 15 Alpine
2. **api**: NestJS API server
3. **web**: Next.js web app

### Environment Variables

**API** (`apps/api/.env`):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `TELEGRAM_BOT_TOKEN`: Bot token from BotFather
- `PORT`: API port (default: 3001)
- `FRONTEND_URL`: CORS origin

**Web** (`apps/web/.env.local`):
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME`: Bot username

## API Endpoints

### Public Endpoints
- `GET /events` - List published events
- `GET /events/:id` - Get event details

### Authenticated Endpoints
- `POST /auth/telegram` - Authenticate with Telegram
- `POST /events` - Create event
- `POST /events/:id/rsvp` - Create RSVP
- `GET /events/:id/rsvp/me` - Get user's RSVP

### Host-Only Endpoints
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:id/analytics` - Get analytics
- `GET /events/:id/export` - Export CSV

### Host/Staff Endpoints
- `GET /events/:id/attendees` - List attendees
- `POST /events/:id/checkin` - Check in attendee

## Frontend Pages

1. `/` - Event discovery (list all events)
2. `/events/new` - Create event form
3. `/e/[slug]` - Public event page
4. `/e/[slug]/rsvp` - RSVP form
5. `/e/[slug]/confirm` - RSVP confirmation with QR code
6. `/host/events/[id]` - Host dashboard (attendees, analytics)
7. `/host/events/[id]/checkin` - QR scanner for check-in

## Telegram WebApp SDK Integration

### Features Used
- **initData**: User authentication data
- **themeParams**: Dynamic theming (bg_color, text_color, button_color)
- **viewport**: Safe area handling
- **HapticFeedback**: Tactile feedback on actions
- **MainButton/BackButton**: Native Telegram UI (can be added)

### Theme Variables
CSS custom properties mapped to Telegram theme:
- `--tg-theme-bg-color`
- `--tg-theme-text-color`
- `--tg-theme-button-color`
- `--tg-theme-button-text-color`
- `--tg-theme-secondary-bg-color`

## Scalability Considerations

### Current Limitations
- In-memory rate limiting (use Redis in production)
- No caching layer
- Single database instance
- No CDN for static assets

### Production Improvements
- Redis for rate limiting and sessions
- CDN for images and static assets
- Database read replicas
- Horizontal scaling with load balancer
- Background job queue for notifications
- WebSocket for real-time updates

## Testing Strategy

### Unit Tests
- Telegram initData verification
- RSVP creation logic
- Capacity handling
- Role-based access control

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

### E2E Tests (Future)
- Full user flows
- Telegram Mini App integration
- Check-in scanner

## Monitoring & Observability

### Recommended Additions
- Error tracking (Sentry)
- Performance monitoring (APM)
- Log aggregation (ELK stack)
- Analytics (event tracking)
- Health check endpoints

