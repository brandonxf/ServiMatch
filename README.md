# ServiMatch 🔧

> Marketplace de servicios bajo demanda — conecta clientes con trabajadores calificados (plomeros, electricistas, soldadores, etc.) por geolocalización.

---

## ¿Qué es ServiMatch?

Plataforma SaaS tipo marketplace donde:
- **Clientes** buscan trabajadores calificados cerca de su ubicación
- **Trabajadores** ofrecen sus servicios, gestionan su perfil y reciben solicitudes
- **El sistema** conecta ambas partes en tiempo real con chat, calificaciones y geolocalización

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 15 (App Router) | SSR/SSG, SEO, performance |
| Backend | NestJS (Node.js) | Modular, escalable, TypeScript nativo |
| Base de datos | PostgreSQL + PostGIS | Relacional + queries geoespaciales |
| ORM | Prisma | Type-safe, migraciones automáticas |
| Cache / Colas | Redis | Sesiones, rate limiting, Bull queues |
| Tiempo real | Socket.io (WebSockets) | Chat y notificaciones en vivo |
| Almacenamiento | Supabase Storage / S3 | Fotos de perfil y trabajos |
| Auth | JWT + Refresh Tokens | Seguro y stateless |
| Mapas | Mapbox GL JS | Más flexible que Google Maps |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitectura completa del sistema |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Diseño de base de datos y relaciones |
| [`docs/API.md`](docs/API.md) | Endpoints REST documentados |
| [`docs/FLOW.md`](docs/FLOW.md) | Flujo principal del sistema |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Orden de desarrollo (MVP → Escala) |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Seguridad y buenas prácticas |
| [`docs/MONETIZATION.md`](docs/MONETIZATION.md) | Modelo de negocio y diferenciación |

---

## Estructura del repositorio

```
ServiMatch/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/         # Autenticación JWT
│   │   ├── users/        # Gestión de usuarios
│   │   ├── workers/      # Perfiles de trabajadores
│   │   ├── services/     # Categorías de servicios
│   │   ├── requests/     # Solicitudes de trabajo
│   │   ├── reviews/      # Calificaciones y reseñas
│   │   ├── chat/         # Mensajería en tiempo real
│   │   ├── notifications/# Notificaciones push
│   │   ├── geo/          # Geolocalización
│   │   └── common/       # Guards, pipes, filtros
│   ├── prisma/           # Schema y migraciones
│   └── test/             # Tests e2e
│
├── frontend/         # Next.js App
│   ├── src/
│   │   ├── app/          # App Router (páginas)
│   │   ├── components/   # Componentes reutilizables
│   │   ├── lib/          # API client, hooks, store
│   │   └── types/        # TypeScript types
│   └── public/
│
├── infra/            # Infraestructura
│   ├── docker/           # Docker Compose
│   ├── nginx/            # Configuración proxy
│   └── scripts/          # Scripts de deploy
│
└── docs/             # Documentación técnica
```

---

## Inicio rápido

```bash
# Clonar repositorio
git clone https://github.com/brandonxf/ServiMatch.git

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Variables de entorno necesarias

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/servimatch
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Equipo

Proyecto SENA CNCA — Nodo Tic ADSO17
