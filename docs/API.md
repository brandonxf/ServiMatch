# API REST — ServiMatch

Base URL: `https://api.servimatch.com/v1`

Autenticación: `Authorization: Bearer <access_token>`

---

## Auth `/auth`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registro de usuario | No |
| POST | `/auth/login` | Inicio de sesión | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/logout` | Cerrar sesión (invalida refresh token) | Sí |
| POST | `/auth/forgot-password` | Solicitar reset de contraseña | No |
| POST | `/auth/reset-password` | Establecer nueva contraseña | No |
| GET | `/auth/me` | Perfil del usuario autenticado | Sí |

### POST /auth/register
```json
// Request
{
  "full_name": "Carlos Perez",
  "email": "carlos@email.com",
  "password": "SecurePass123!",
  "phone": "+573001234567",
  "role": "CLIENT"  // CLIENT | WORKER
}

// Response 201
{
  "user": { "id": "uuid", "email": "carlos@email.com", "role": "CLIENT" },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### POST /auth/login
```json
// Request
{ "email": "carlos@email.com", "password": "SecurePass123!" }

// Response 200
{
  "user": { "id": "uuid", "full_name": "Carlos Perez", "role": "CLIENT" },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

---

## Usuarios `/users`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Mi perfil completo | Sí |
| PATCH | `/users/me` | Actualizar mi perfil | Sí |
| POST | `/users/me/avatar` | Subir foto de perfil | Sí |
| DELETE | `/users/me` | Eliminar mi cuenta | Sí |
| GET | `/users/:id` | Perfil público de un usuario | Sí |

---

## Trabajadores `/workers`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/workers/profile` | Crear perfil de trabajador | Sí |
| GET | `/workers/me` | Mi perfil de trabajador | Sí (WORKER) |
| PATCH | `/workers/me` | Actualizar mi perfil | Sí (WORKER) |
| PATCH | `/workers/me/location` | Actualizar ubicación | Sí (WORKER) |
| PATCH | `/workers/me/availability` | Cambiar disponibilidad | Sí (WORKER) |
| GET | `/workers/:id` | Perfil público del trabajador | No |
| GET | `/workers/:id/reviews` | Reseñas del trabajador | No |
| GET | `/workers/:id/photos` | Galería del trabajador | No |

### GET /workers/:id (perfil público)
```json
// Response 200
{
  "id": "uuid",
  "full_name": "Juan Electricista",
  "avatar_url": "https://...",
  "bio": "10 años de experiencia...",
  "base_price": 50000,
  "price_unit": "HOUR",
  "average_rating": 4.8,
  "review_count": 127,
  "jobs_completed": 312,
  "years_experience": 10,
  "is_available": true,
  "distance_km": 2.3,
  "services": [
    { "name": "Electricidad", "slug": "electricidad", "custom_price": 60000 }
  ],
  "photos": [{ "url": "https://...", "caption": "Instalación panel" }]
}
```

---

## Búsqueda geoespacial `/geo`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/geo/workers` | Buscar workers por ubicación | No |
| GET | `/geo/categories` | Categorías disponibles | No |

### GET /geo/workers
```
Query params:
  lat        float    requerido   Latitud del cliente
  lng        float    requerido   Longitud del cliente
  radius     int      default:10  Radio en km
  category   string   opcional    Slug del servicio (ej: "plomeria")
  min_rating float    opcional    Rating mínimo (ej: 4.0)
  max_price  int      opcional    Precio máximo
  available  bool     default:true Solo disponibles
  page       int      default:1
  limit      int      default:20
```

```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Juan García",
      "avatar_url": "https://...",
      "average_rating": 4.8,
      "base_price": 45000,
      "price_unit": "HOUR",
      "distance_km": 1.2,
      "is_available": true,
      "services": ["Plomería", "Gasfitería"],
      "location": { "lat": 4.710989, "lng": -74.072092 }
    }
  ],
  "meta": { "total": 48, "page": 1, "limit": 20 }
}
```

---

## Servicios (categorías) `/services`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/services` | Listar categorías activas | No |
| GET | `/services/:slug` | Detalle de categoría | No |
| POST | `/services` | Crear categoría | ADMIN |
| PATCH | `/services/:id` | Actualizar categoría | ADMIN |
| DELETE | `/services/:id` | Eliminar categoría | ADMIN |

### POST /workers/me/services (agregar servicio al perfil)
```json
// Request
{
  "category_id": "uuid",
  "custom_price": 80000,
  "description": "Instalaciones eléctricas residenciales y comerciales"
}
```

---

## Solicitudes `/requests`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/requests` | Crear solicitud | CLIENT |
| GET | `/requests` | Mis solicitudes (cliente o worker) | Sí |
| GET | `/requests/:id` | Detalle de solicitud | Sí |
| PATCH | `/requests/:id/accept` | Aceptar solicitud | WORKER |
| PATCH | `/requests/:id/reject` | Rechazar solicitud | WORKER |
| PATCH | `/requests/:id/start` | Iniciar trabajo | WORKER |
| PATCH | `/requests/:id/complete` | Marcar como completado | WORKER |
| PATCH | `/requests/:id/cancel` | Cancelar solicitud | CLIENT/WORKER |

### POST /requests
```json
// Request
{
  "worker_id": "uuid",
  "category_id": "uuid",
  "title": "Reparación tubería cocina",
  "description": "Se rompió la tubería debajo del lavaplatos...",
  "lat": 4.710989,
  "lng": -74.072092,
  "address": "Calle 85 #15-32, Bogotá",
  "scheduled_at": "2026-03-25T10:00:00Z",
  "budget": 150000
}
```

---

## Reseñas `/reviews`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/reviews` | Crear reseña | CLIENT |
| GET | `/reviews/worker/:workerId` | Reseñas de un trabajador | No |
| PATCH | `/reviews/:id/reply` | Responder reseña | WORKER |

### POST /reviews
```json
// Request
{
  "request_id": "uuid",
  "rating": 5,
  "comment": "Excelente trabajo, muy puntual y profesional"
}
```

---

## Chat `/chat`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/chat/conversations` | Mis conversaciones | Sí |
| GET | `/chat/:requestId/messages` | Mensajes de una conversación | Sí |
| POST | `/chat/:requestId/messages` | Enviar mensaje (REST fallback) | Sí |

### WebSocket Events

**Cliente → Servidor:**
```
join_room     { requestId }          Unirse a sala del chat
send_message  { requestId, content, type }
typing        { requestId }
read_messages { requestId }
```

**Servidor → Cliente:**
```
new_message      { message }
user_typing      { userId }
messages_read    { userId }
notification     { type, data }
worker_location  { lat, lng }      (trabajador en camino)
```

---

## Notificaciones `/notifications`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Mis notificaciones | Sí |
| PATCH | `/notifications/:id/read` | Marcar como leída | Sí |
| PATCH | `/notifications/read-all` | Marcar todas como leídas | Sí |

---

## Admin `/admin`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Estadísticas globales | ADMIN |
| GET | `/admin/users` | Listar usuarios | ADMIN |
| PATCH | `/admin/users/:id/suspend` | Suspender usuario | ADMIN |
| GET | `/admin/workers/pending` | Workers pendientes de verificación | ADMIN |
| PATCH | `/admin/workers/:id/verify` | Verificar trabajador | ADMIN |
| GET | `/admin/requests` | Todas las solicitudes | ADMIN |

---

## Fotos `/uploads`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/uploads/avatar` | Subir avatar | Sí |
| POST | `/uploads/worker-photo` | Agregar foto al portafolio | WORKER |
| DELETE | `/uploads/worker-photo/:id` | Eliminar foto | WORKER |

---

## Códigos de error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request — datos inválidos |
| 401 | Unauthorized — token inválido o expirado |
| 403 | Forbidden — sin permisos para esta acción |
| 404 | Not Found — recurso no existe |
| 409 | Conflict — ej: ya existe una reseña para esta solicitud |
| 422 | Unprocessable Entity — validación de negocio fallida |
| 429 | Too Many Requests — rate limit excedido |
| 500 | Internal Server Error |

```json
// Formato de error estándar
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Worker profile not found",
  "timestamp": "2026-03-22T10:00:00Z",
  "path": "/v1/workers/uuid-inexistente"
}
```
