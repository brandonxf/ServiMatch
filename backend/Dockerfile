FROM node:20-alpine AS builder

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Copiar manifests
COPY package*.json ./
COPY prisma ./prisma/

# Instalar deps (incluye prisma cli)
RUN npm ci

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# ─── Imagen de producción ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Solo dependencias de producción
RUN npm ci --only=production && npx prisma generate

# Copiar build
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Migrar BD y arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
