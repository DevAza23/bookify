FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY ../../packages/prisma ./packages/prisma
WORKDIR /app/packages/prisma
RUN npm install
RUN npx prisma generate
WORKDIR /app

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/prisma ./packages/prisma
COPY . .
WORKDIR /app/packages/prisma
RUN npx prisma generate
WORKDIR /app
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/prisma ./packages/prisma

WORKDIR /app/packages/prisma
RUN npm install --production
RUN npx prisma generate
WORKDIR /app

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

