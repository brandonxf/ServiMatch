# Guía de Deploy — ServiMatch

## Stack de producción

| Servicio | Plataforma | Costo |
|----------|-----------|-------|
| Frontend | Vercel | Gratis |
| Backend | Railway | Gratis (500h/mes) |
| PostgreSQL | Railway Plugin | Gratis (1GB) |
| Redis | Upstash | Gratis (10k req/día) |

---

## 1. Deploy del Backend en Railway

### Paso 1 — Crear proyecto
1. Ir a [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → elegir `ServiMatch`
3. Cuando pregunte el directorio: escribir **`backend`**

### Paso 2 — Agregar PostgreSQL
1. En el proyecto de Railway → **+ New** → **Database** → **PostgreSQL**
2. Railway conecta automáticamente la variable `DATABASE_URL`

### Paso 3 — Variables de entorno en Railway
En tu servicio backend → **Variables** → agregar:

```
JWT_SECRET=<genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<otro string aleatorio diferente>
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
REDIS_HOST=<host de Upstash>
REDIS_PORT=6379
REDIS_PASSWORD=<password de Upstash>
```

### Paso 4 — El deploy corre automáticamente
Railway detecta `nixpacks.toml` y ejecuta en orden:
1. `npm ci` — instala dependencias
2. `npx prisma generate` — genera el cliente Prisma
3. `npm run build` — compila NestJS
4. Al iniciar: `npx prisma migrate deploy && node dist/main`

### Paso 5 — Seed de datos (solo primera vez)
En Railway → tu servicio → **Shell**:
```bash
node -e "require('./prisma/seed')"
```

---

## 2. Deploy del Frontend en Vercel

### Paso 1 — Importar proyecto
1. Ir a [vercel.com](https://vercel.com) → **New Project**
2. Importar repo `ServiMatch`
3. **Root Directory**: escribir **`frontend`**
4. Framework: Next.js (se detecta automáticamente)

### Paso 2 — Variables de entorno en Vercel
En **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1... (opcional — consíguelo en mapbox.com gratis)
```

### Paso 3 — Deploy
Click **Deploy** — Vercel compila y despliega automáticamente.

Cada push a `main` redespliega ambos servicios.

---

## Comandos útiles

```bash
# Desarrollo local — backend
cd backend
cp .env.example .env   # llenar DATABASE_URL y JWT secrets
docker run -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=servimatch postgres:16
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev

# Desarrollo local — frontend
cd frontend
cp .env.local.example .env.local   # llenar NEXT_PUBLIC_API_URL
npm install
npm run dev
```

---

## Credenciales de prueba (después del seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@servimatch.com | Admin123! |
| Cliente | cliente@test.com | Cliente123! |
| Trabajador | plomero@test.com | Worker123! |
