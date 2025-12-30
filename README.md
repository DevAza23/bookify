# Telegram Mini App - Event Registration Platform

A Telegram Mini App (TWA) for event/meeting registration similar to Luma, built with Next.js 14, NestJS, PostgreSQL, and Prisma.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Telegram WebApp SDK
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Authentication**: Telegram initData verification (HMAC) + JWT sessions
- **Deployment**: Docker Compose (web + api + db)

### Project Structure
```
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/           # NestJS backend
├── packages/
│   └── prisma/        # Shared Prisma schema
├── docker-compose.yml
└── README.md
```

### Key Features
- Event creation with cover images, dates, timezones, locations, capacity, pricing
- Public event pages with RSVP functionality
- RSVP flow with custom questions and guest count
- Ticket confirmation with QR codes and calendar integration
- Host dashboard with attendee management, CSV export, QR scanner
- Role-based access (host, staff)
- Telegram notifications (placeholder)

## Quick Start

### Prerequisites
- Docker & Docker Compose (for containerized deployment)
- Node.js 18+ (for local development)
- Telegram Bot Token (from @BotFather)
- PostgreSQL database (or use Docker)

### GitHub Deployment
This project is ready for GitHub. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Setup Instructions

1. **Clone and navigate to the project**
   ```bash
   cd "Telegram mini APP"
   ```

2. **Configure environment variables**
   
   Create `.env` file in `apps/api`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@db:5432/telegram_events?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```
   
   Create `.env.local` file in `apps/web`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   NEXT_PUBLIC_TELEGRAM_BOT_NAME="your_bot_name"
   ```

3. **Start with Docker Compose**
   ```bash
   docker compose up --build
   ```
   
   This will:
   - Start PostgreSQL database
   - Run Prisma migrations
   - Start NestJS API on port 3001
   - Start Next.js web app on port 3000

4. **For local development** (without Docker):
   ```bash
   # Terminal 1: Start database
   docker compose up db
   
   # Terminal 2: Setup and start API
   cd apps/api
   npm install
   npx prisma migrate dev
   npm run start:dev
   
   # Terminal 3: Setup and start Web
   cd apps/web
   npm install
   npm run dev
   ```

### Telegram Bot Configuration

1. **Create a bot** via [@BotFather](https://t.me/BotFather)
   - Use `/newbot` command
   - Save the bot token

2. **Set up Mini App**
   - Use `/newapp` command in BotFather
   - Select your bot
   - Provide app title and description
   - Upload app icon (optional)
   - Set web app URL: `https://yourdomain.com` (or use ngrok for local testing)

3. **For local testing with ngrok**:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL in BotFather
   ```

4. **Set webhook** (if needed):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/webhook"
   ```

### Database Schema

The Prisma schema includes:
- `User` - Telegram users
- `Event` - Events with metadata
- `EventHostRole` - Host/staff assignments
- `RSVP` - RSVP records
- `RSVPAnswer` - Answers to custom questions
- `CheckIn` - Check-in records
- `EventQuestion` - Custom RSVP questions
- `EventMedia` - Event cover images

See `packages/prisma/schema.prisma` for full schema.

## API Documentation

### Authentication
- `POST /auth/telegram` - Verify Telegram initData and create session

### Events
- `GET /events` - List events (with filters)
- `POST /events` - Create event (host only)
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event (host only)
- `DELETE /events/:id` - Delete event (host only)

### RSVP
- `POST /events/:id/rsvp` - Create RSVP
- `GET /events/:id/rsvp/me` - Get user's RSVP for event

### Host Dashboard
- `GET /events/:id/attendees` - List attendees (host/staff)
- `POST /events/:id/checkin` - Check in attendee (host/staff)
- `GET /events/:id/analytics` - Get analytics (host only)
- `GET /events/:id/export` - Export CSV (host only)

## Testing

Run tests:
```bash
cd apps/api
npm test
```

Seed database with demo data:
```bash
cd apps/api
npm run seed
```

## Deployment

1. Set up production environment variables
2. Configure HTTPS domain
3. Update Telegram bot web app URL
4. Run `docker compose up -d` in production

## Security Notes

- Telegram initData is verified using HMAC-SHA256
- JWT tokens expire after 7 days
- Rate limiting on RSVP endpoint (100 requests/hour)
- Role-based access control for host routes
- Input validation using class-validator

