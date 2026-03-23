# Arquitectura del Sistema — ServiMatch

## Visión general

ServiMatch sigue una arquitectura **cliente-servidor desacoplada** con tres capas principales: frontend, backend API y capa de datos. El sistema está diseñado para escalar horizontalmente desde el día uno.

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTES                           │
│          Browser (Next.js)  /  Mobile (futuro)          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / WSS
┌─────────────────────▼───────────────────────────────────┐
│                   NGINX (Reverse Proxy)                 │
│              Rate limiting · SSL · Load balancing       │
└──────┬──────────────────────────────────┬───────────────┘
       │ REST API                         │ WebSocket
┌──────▼──────────┐              ┌────────▼────────┐
│   NestJS API    │              │  Socket.io      │
│   (Port 3001)   │              │  Gateway        │
└──────┬──────────┘              └────────┬────────┘
       │                                  │
┌──────▼──────────────────────────────────▼────────────────┐
│                    CAPA DE SERVICIOS                     │
│  Auth · Users · Workers · Requests · Reviews · Geo      │
└──────┬──────────────────────────┬────────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│ PostgreSQL  │          │     Redis       │
│ + PostGIS   │          │  Cache · Queues │
└─────────────┘          └─────────────────┘
```

---

## Módulos del backend (NestJS)

### `AuthModule`
Responsabilidad: Registro, login, refresh tokens, logout.
- Estrategia: JWT Access Token (15min) + Refresh Token (7 días)
- Guards: `JwtAuthGuard`, `RolesGuard`
- El refresh token se guarda en Redis para poder invalidarlo

### `UsersModule`
Responsabilidad: CRUD de perfiles, gestión de roles (CLIENT / WORKER / ADMIN).
- Un usuario puede tener ambos roles (cliente y trabajador al mismo tiempo)
- Separación lógica por `role` en el mismo modelo

### `WorkersModule`
Responsabilidad: Perfil profesional del trabajador.
- Servicios que ofrece, zona de cobertura (radio en km), precio base
- Galería de fotos de trabajos realizados
- Estado: ACTIVE, INACTIVE, SUSPENDED

### `ServicesModule`
Responsabilidad: Catálogo de categorías de servicios.
- Tabla maestra: Plomería, Electricidad, Soldadura, Pintura, etc.
- Administrada por ADMIN únicamente

### `RequestsModule`
Responsabilidad: Solicitudes de servicio de clientes a trabajadores.
- Estados: PENDING → ACCEPTED / REJECTED → IN_PROGRESS → COMPLETED / CANCELLED
- Cada transición de estado genera una notificación

### `ReviewsModule`
Responsabilidad: Calificaciones (1-5 estrellas) y reseñas de texto.
- Solo se puede calificar si la solicitud está en estado COMPLETED
- El rating promedio se recalcula y se guarda desnormalizado en el perfil del worker

### `ChatModule`
Responsabilidad: Mensajería en tiempo real entre cliente y trabajador.
- Los mensajes se persisten en PostgreSQL
- Socket.io para entrega en tiempo real
- Un chat se crea automáticamente cuando se acepta una solicitud

### `GeoModule`
Responsabilidad: Búsqueda por proximidad.
- PostGIS para queries geoespaciales eficientes
- `ST_DWithin` para buscar workers en radio X km
- Endpoint: `GET /geo/workers?lat=&lng=&radius=&service=`

### `NotificationsModule`
Responsabilidad: Notificaciones en tiempo real y push.
- WebSocket para notificaciones en vivo
- Bull Queue + Redis para procesamiento asíncrono
- Tipos: NEW_REQUEST, REQUEST_ACCEPTED, NEW_MESSAGE, REVIEW_RECEIVED

---

## Frontend (Next.js — App Router)

### Páginas principales

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/` | Landing page | Público |
| `/auth/login` | Inicio de sesión | Público |
| `/auth/register` | Registro (cliente o trabajador) | Público |
| `/search` | Búsqueda con mapa | Cliente |
| `/workers/[id]` | Perfil público del trabajador | Cliente |
| `/dashboard` | Panel del usuario | Autenticado |
| `/dashboard/requests` | Mis solicitudes | Cliente |
| `/dashboard/worker` | Mi perfil profesional | Trabajador |
| `/dashboard/worker/portfolio` | Galería de trabajos | Trabajador |
| `/chat/[requestId]` | Chat con cliente/trabajador | Autenticado |
| `/admin` | Panel administrativo | Admin |

### Gestión de estado

- **Zustand** para estado global (usuario autenticado, notificaciones)
- **TanStack Query** para fetching, caché y sincronización de datos del servidor
- **Socket.io Client** para tiempo real (chat y notificaciones)

---

## Decisiones arquitectónicas clave

### ¿Por qué NestJS y no Express puro?
NestJS impone estructura modular desde el inicio. Con Express, a los 6 meses el código se convierte en espagueti. NestJS fuerza separación de responsabilidades, tiene DI nativa y el ecosistema de guards/interceptors es ideal para autorización por roles.

### ¿Por qué PostGIS y no Elasticsearch?
Para el MVP, PostGIS cubre el 100% de las necesidades geoespaciales con SQL estándar. Elasticsearch se agrega cuando se necesita búsqueda full-text avanzada o cuando hay >1M de registros.

### ¿Por qué Redis para los refresh tokens?
Los JWT son stateless por diseño, pero necesitamos poder invalidar tokens (logout, cuenta suspendida). Guardar el refresh token en Redis con TTL permite hacer esto eficientemente sin consultar PostgreSQL en cada request.

### ¿Por qué separar el rating promedio?
Recalcular el promedio de rating en cada búsqueda sería un JOIN costoso. Se guarda `average_rating` y `review_count` directamente en el perfil del worker y se actualiza con cada nueva reseña. Esto hace que las búsquedas sean O(1) en lugar de O(n).

---

## Escalabilidad

Para pasar de 100 a 100,000 usuarios, los cambios serían:

1. **Horizontal scaling del API**: múltiples instancias de NestJS detrás de NGINX
2. **Redis Cluster**: para distribuir caché y sesiones
3. **PostgreSQL Read Replicas**: las búsquedas van a la réplica, las escrituras al primario
4. **CDN**: para imágenes (Cloudflare o CloudFront)
5. **Message Queue**: migrar de Bull/Redis a RabbitMQ o Kafka para eventos de alta frecuencia
6. **Separar el servicio de chat**: puede convertirse en un microservicio independiente
