FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generar cliente con URL dummy — solo necesita leer el schema, no conectarse
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY . .
RUN npm run build

# ── Imagen de producción ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY --from=builder /app/dist ./dist


# En runtime SÍ usa la DATABASE_URL real de las variables de Railway
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
