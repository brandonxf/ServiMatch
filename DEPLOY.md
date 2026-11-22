# Guía de Deploy — ServiMatch

## Stack de producción

| Servicio | Plataforma | Costo |
|----------|-----------|-------|
| Frontend | Vercel | Gratis |
| Backend | Vercel (serverless) | Gratis |
| PostgreSQL | Neon | Gratis |

---

## 1. Deploy del Backend en Vercel (serverless)

El backend NestJS corre como una función serverless (`backend/api/index.js` → `dist/serverless.js`).

> **Limitación:** Vercel no mantiene conexiones WebSocket. El chat funciona por REST con consulta cada 4 s
> (el gateway de Socket.io sigue en el código, pero no se usa en producción).

### Paso 1 — Crear proyecto
1. [vercel.com](https://vercel.com) → **New Project** → importar `ServiMatch`
2. **Root Directory**: `backend` (proyecto distinto al del frontend)
3. Framework: *Other* (el `vercel.json` ya define build, salida y rewrites)

### Paso 2 — Variables de entorno
```
DATABASE_URL=<Postgres con pooling, p. ej. la URL "pooler" de Neon>
JWT_SECRET=<genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<otro string aleatorio diferente>
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://servi-match.vercel.app
```
Redis ya no se usa.

### Paso 3 — Migraciones (manual, desde tu máquina)
Las migraciones no corren en el deploy:
```bash
cd backend
DATABASE_URL='<url de producción>' npx prisma migrate deploy
```

### Paso 4 — Probar
`https://<tu-backend>.vercel.app/v1/services` debe responder JSON.

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
NEXT_PUBLIC_API_URL=https://<tu-backend>.vercel.app/v1
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
