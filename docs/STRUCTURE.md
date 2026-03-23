# Estructura de Carpetas — ServiMatch

## Backend (NestJS)

```
backend/
├── src/
│   ├── main.ts                     # Entry point: configura NestJS, Helmet, CORS, Swagger
│   ├── app.module.ts               # Módulo raíz: importa todos los módulos
│   ├── app.controller.ts           # Health check endpoint GET /health
│   │
│   ├── auth/                       # Autenticación y autorización
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # POST /auth/register, login, refresh, logout
│   │   ├── auth.service.ts         # Lógica de JWT, bcrypt, refresh tokens en Redis
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts     # Valida access token en cada request
│   │   │   └── refresh.strategy.ts # Valida refresh token para renovar access
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   │
│   ├── users/                      # Gestión de perfiles de usuario
│   │   ├── users.module.ts
│   │   ├── users.controller.ts     # GET/PATCH /users/me, GET /users/:id
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── workers/                    # Perfiles profesionales de trabajadores
│   │   ├── workers.module.ts
│   │   ├── workers.controller.ts   # CRUD perfil, servicios, fotos, disponibilidad
│   │   ├── workers.service.ts
│   │   └── dto/
│   │       ├── create-worker.dto.ts
│   │       └── update-worker.dto.ts
│   │
│   ├── services/                   # Catálogo de categorías de servicios
│   │   ├── services.module.ts
│   │   ├── services.controller.ts  # CRUD categorías (admin) + listar (público)
│   │   └── services.service.ts
│   │
│   ├── requests/                   # Solicitudes de trabajo (corazón del negocio)
│   │   ├── requests.module.ts
│   │   ├── requests.controller.ts  # Crear, listar, cambiar estados
│   │   ├── requests.service.ts     # Validaciones de negocio + transiciones de estado
│   │   └── dto/
│   │       └── create-request.dto.ts
│   │
│   ├── reviews/                    # Sistema de calificaciones
│   │   ├── reviews.module.ts
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts      # Valida que la solicitud esté COMPLETED antes de calificar
│   │   └── dto/
│   │       └── create-review.dto.ts
│   │
│   ├── chat/                       # Mensajería en tiempo real
│   │   ├── chat.module.ts
│   │   ├── chat.gateway.ts         # Socket.io gateway: rooms, events
│   │   ├── chat.service.ts         # Persistir mensajes en PostgreSQL
│   │   └── dto/
│   │       └── send-message.dto.ts
│   │
│   ├── notifications/              # Sistema de notificaciones
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts # Crear y leer notificaciones
│   │   └── notifications.processor.ts # Bull processor para notificaciones async
│   │
│   ├── geo/                        # Búsqueda geoespacial
│   │   ├── geo.module.ts
│   │   ├── geo.controller.ts       # GET /geo/workers?lat&lng&radius&category
│   │   ├── geo.service.ts          # Queries con PostGIS ST_DWithin
│   │   └── dto/
│   │       └── search-workers.dto.ts
│   │
│   ├── common/                     # Utilidades compartidas
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts   # Protege rutas que requieren autenticación
│   │   │   └── roles.guard.ts      # Protege rutas por rol (CLIENT, WORKER, ADMIN)
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts  # @Roles('ADMIN') para marcar rutas
│   │   │   └── current-user.decorator.ts # @CurrentUser() para obtener usuario del request
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Formato de error estándar
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts   # Log de requests/responses
│   │   └── pipes/
│   │       └── (validación global con class-validator)
│   │
│   └── config/                     # Configuración de servicios externos
│       ├── database.config.ts      # Prisma / PostgreSQL
│       ├── redis.config.ts         # Redis / Bull
│       └── jwt.config.ts           # JWT secrets y TTLs
│
├── prisma/
│   ├── schema.prisma               # Definición completa del schema
│   └── migrations/                 # Generadas automáticamente con prisma migrate
│
├── test/
│   └── app.e2e-spec.ts             # Tests de integración
│
├── .env.example                    # Template de variables de entorno
└── package.json.example            # Dependencias del proyecto
```

---

## Frontend (Next.js — App Router)

```
frontend/
├── src/
│   ├── app/                        # Páginas (App Router)
│   │   ├── layout.tsx              # Layout raíz: providers, navbar, footer
│   │   ├── page.tsx                # Landing page pública
│   │   ├── globals.css
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Formulario de login
│   │   │   └── register/page.tsx   # Registro (cliente o trabajador)
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx            # Mapa + lista de trabajadores
│   │   │
│   │   ├── workers/
│   │   │   └── [id]/page.tsx       # Perfil público del trabajador
│   │   │
│   │   ├── dashboard/              # Área autenticada
│   │   │   ├── page.tsx            # Dashboard según rol
│   │   │   ├── requests/page.tsx   # Mis solicitudes (cliente)
│   │   │   ├── worker/
│   │   │   │   ├── page.tsx        # Mi perfil profesional
│   │   │   │   └── setup/page.tsx  # Wizard de configuración inicial
│   │   │   └── messages/page.tsx   # Lista de conversaciones
│   │   │
│   │   ├── chat/
│   │   │   └── [requestId]/page.tsx # Interfaz de chat
│   │   │
│   │   └── admin/
│   │       └── page.tsx            # Panel administrativo
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui + componentes base
│   │   │
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Navegación principal + notificaciones
│   │   │   ├── footer.tsx          # Footer con links e info
│   │   │   └── sidebar.tsx         # Sidebar del dashboard
│   │   │
│   │   ├── maps/
│   │   │   ├── search-map.tsx      # Mapa Mapbox con workers
│   │   │   └── worker-pin.tsx      # Pin personalizado del trabajador
│   │   │
│   │   ├── cards/
│   │   │   ├── worker-card.tsx     # Card de trabajador en lista/mapa
│   │   │   ├── request-card.tsx    # Card de solicitud
│   │   │   └── review-card.tsx     # Card de reseña con estrellas
│   │   │
│   │   ├── forms/
│   │   │   ├── request-form.tsx    # Formulario de nueva solicitud
│   │   │   └── worker-profile-form.tsx # Editar perfil de trabajador
│   │   │
│   │   └── chat/
│   │       ├── chat-window.tsx     # Ventana de chat completa
│   │       └── message-bubble.tsx  # Burbuja de mensaje individual
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance con interceptors (token + refresh)
│   │   │   ├── auth.api.ts         # Funciones para endpoints de auth
│   │   │   ├── workers.api.ts      # Funciones para workers
│   │   │   ├── requests.api.ts     # Funciones para solicitudes
│   │   │   ├── reviews.api.ts      # Funciones para reseñas
│   │   │   └── chat.api.ts         # Funciones para mensajes REST
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-auth.ts         # Estado de autenticación
│   │   │   ├── use-geo.ts          # Geolocalización del navegador
│   │   │   ├── use-socket.ts       # Conexión Socket.io
│   │   │   └── use-notifications.ts # Notificaciones en tiempo real
│   │   │
│   │   ├── store/
│   │   │   ├── auth.store.ts       # Zustand: usuario, tokens
│   │   │   └── notifications.store.ts # Zustand: notificaciones no leídas
│   │   │
│   │   └── utils/
│   │       ├── format.ts           # Formateo de precios, fechas, distancias
│   │       └── geo.ts              # Utilidades de coordenadas
│   │
│   └── types/                      # TypeScript interfaces
│       ├── user.types.ts
│       ├── worker.types.ts
│       ├── request.types.ts
│       └── chat.types.ts
│
├── public/                         # Assets estáticos
└── .env.example
```

---

## Infraestructura

```
infra/
├── docker/
│   ├── docker-compose.yml          # PostgreSQL + Redis + backend + frontend
│   ├── Dockerfile.backend          # Build del NestJS
│   └── Dockerfile.frontend         # Build del Next.js
│
├── nginx/
│   └── nginx.conf                  # Proxy reverso, SSL, compresión
│
└── scripts/
    ├── deploy.sh                   # Script de deploy en producción
    └── backup-db.sh                # Backup automático de PostgreSQL
```
