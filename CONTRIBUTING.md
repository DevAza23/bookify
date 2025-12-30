# Contributing

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd packages/prisma && npm install && npx prisma generate
   cd ../../apps/api && npm install
   cd ../web && npm install
   ```

3. Set up environment variables (see `.env.example` files)

4. Start development servers:
   ```bash
   # Terminal 1: Database (if not using Docker)
   docker compose up db

   # Terminal 2: API
   cd apps/api
   npm run start:dev

   # Terminal 3: Web
   cd apps/web
   npm run dev
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Run linters before committing
- Write tests for new features

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description

