# Deployment Guide

## GitHub Deployment

This project is ready for GitHub deployment. All sensitive files are excluded via `.gitignore`.

### Pre-Deployment Checklist

✅ **Environment Variables**: No sensitive data in code
✅ **.gitignore**: Properly configured
✅ **Dependencies**: Fixed version conflicts
✅ **Build Scripts**: Ready for CI/CD

### Files Excluded from Git

- `node_modules/` - Dependencies
- `.env*` - Environment variables
- `.next/` - Next.js build output
- `dist/` - API build output
- `*.log` - Log files
- `.DS_Store`, `Thumbs.db` - OS files

### Setting Up GitHub Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Telegram Mini App"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/telegram-events-app.git
   git branch -M main
   git push -u origin main
   ```

### Environment Variables Setup

After deploying, set these in your hosting platform:

**For API** (NestJS):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT signing
- `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather
- `PORT` - API port (default: 3001)
- `FRONTEND_URL` - Your frontend URL for CORS

**For Web** (Next.js):
- `NEXT_PUBLIC_API_URL` - Your API URL
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` - Your bot username

### Deployment Platforms

#### Vercel (Recommended for Next.js)

1. Import your GitHub repository
2. Set environment variables
3. Deploy automatically on push

#### Railway / Render

1. Connect GitHub repository
2. Set environment variables
3. Configure build commands:
   - **API**: `cd apps/api && npm install && npm run build && npm run start:prod`
   - **Web**: `cd apps/web && npm install && npm run build && npm run start`

#### Docker Deployment

Use the provided `docker-compose.yml`:

```bash
docker compose up -d --build
```

### Post-Deployment

1. **Update Telegram Bot**:
   - Go to @BotFather
   - Use `/newapp` or edit existing app
   - Set Web App URL to your deployed frontend URL

2. **Database Setup**:
   - Run migrations: `npx prisma migrate deploy`
   - (Optional) Seed data: `npm run seed` in packages/prisma

3. **Verify**:
   - Test authentication flow
   - Create a test event
   - Test RSVP functionality

### CI/CD Pipeline

A basic GitHub Actions workflow is included (`.github/workflows/ci.yml`) that:
- Lints code on push
- Runs tests
- Validates build process

### Security Notes

⚠️ **Never commit**:
- `.env` files
- API keys or tokens
- Database credentials
- JWT secrets

✅ **Always use**:
- Environment variables
- GitHub Secrets for CI/CD
- Secure hosting platform secrets management

### Troubleshooting

**Build Fails**:
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

**Database Connection**:
- Verify DATABASE_URL format
- Check network/firewall rules
- Ensure database is accessible

**Telegram Auth Fails**:
- Verify TELEGRAM_BOT_TOKEN is correct
- Check HTTPS is enabled (required)
- Verify initData is being passed

