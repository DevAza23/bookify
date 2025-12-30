# Setup Instructions

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development without Docker)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

## Quick Start with Docker

1. **Clone the repository** (if not already done)

2. **Set up environment variables**

   Create `apps/api/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@db:5432/telegram_events?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   NEXT_PUBLIC_TELEGRAM_BOT_NAME="your_bot_name"
   ```

3. **Start all services**
   ```bash
   docker compose up --build
   ```

   This will:
   - Start PostgreSQL database on port 5432
   - Run Prisma migrations automatically
   - Start NestJS API on port 3001
   - Start Next.js web app on port 3000

4. **Access the application**
   - Web app: http://localhost:3000
   - API: http://localhost:3001

## Local Development (without Docker)

### 1. Start Database

```bash
docker compose up db -d
```

### 2. Setup API

```bash
cd apps/api
npm install

# Copy Prisma schema
cp -r ../../packages/prisma ./packages/prisma
cd packages/prisma
npm install
npx prisma generate
cd ../../..

# Run migrations
npx prisma migrate dev --schema=./packages/prisma/schema.prisma

# Start API
npm run start:dev
```

### 3. Setup Web

```bash
cd apps/web
npm install
npm run dev
```

## Telegram Bot Setup

### 1. Create a Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Save the bot token (you'll need it for `TELEGRAM_BOT_TOKEN`)

### 2. Create Mini App

1. In BotFather, send `/newapp`
2. Select your bot
3. Provide:
   - App title: "Event Registration"
   - Description: "Register for events"
   - Upload icon (optional)
   - **Web App URL**: Your domain (e.g., `https://yourdomain.com`)

### 3. For Local Testing (ngrok)

1. Install ngrok: https://ngrok.com/download
2. Start your web app locally
3. Run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Use this URL in BotFather's `/newapp` command

### 4. Set Webhook (Optional)

If you need webhook support:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/webhook"
```

## Database Seeding

To populate the database with demo events:

```bash
cd apps/api
npm run seed
```

Or with Docker:

```bash
docker compose exec api npm run seed
```

## Testing

Run API tests:

```bash
cd apps/api
npm test
```

## Production Deployment

1. **Set production environment variables**
   - Use strong `JWT_SECRET`
   - Set `FRONTEND_URL` to your production domain
   - Set `DATABASE_URL` to production database

2. **Configure HTTPS**
   - Use a reverse proxy (nginx, Caddy) or hosting platform
   - Ensure SSL certificate is valid

3. **Update Telegram Bot**
   - Update Mini App URL to production domain
   - Set webhook if needed

4. **Deploy**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker compose ps`
- Check DATABASE_URL format
- Verify network connectivity between containers

### Telegram Authentication Fails

- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check that initData is being passed correctly
- Ensure HTTPS is configured (required for Telegram WebApp)

### Prisma Issues

- Run `npx prisma generate` in `packages/prisma`
- Check that schema.prisma is accessible
- Verify DATABASE_URL is correct

### CORS Errors

- Ensure `FRONTEND_URL` matches your actual frontend URL
- Check CORS settings in `apps/api/src/main.ts`

## API Endpoints

### Authentication
- `POST /auth/telegram` - Verify Telegram initData

### Events
- `GET /events` - List events
- `POST /events` - Create event (auth required)
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event (host only)
- `DELETE /events/:id` - Delete event (host only)
- `GET /events/:id/attendees` - List attendees (host/staff)
- `GET /events/:id/analytics` - Get analytics (host only)
- `GET /events/:id/export` - Export CSV (host only)

### RSVP
- `POST /events/:id/rsvp` - Create RSVP (auth required)
- `GET /events/:id/rsvp/me` - Get user's RSVP
- `DELETE /events/:id/rsvp` - Cancel RSVP

### Check-In
- `POST /events/:id/checkin` - Check in attendee (host/staff)

## Environment Variables Reference

### API (`apps/api/.env`)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `TELEGRAM_BOT_TOKEN` - Bot token from BotFather
- `PORT` - API server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` - Bot username for sharing

