# Diseño de Base de Datos — ServiMatch

## Motor: PostgreSQL + PostGIS

PostGIS se usa para las columnas de tipo `GEOGRAPHY(POINT)` que permiten queries geoespaciales con `ST_DWithin`, `ST_Distance` y `ST_AsGeoJSON`.

---

## Diagrama de relaciones

```
users ──────────────────── worker_profiles
  │                               │
  │                    ┌──────────┴──────────┐
  │                    │                     │
  │              worker_services      worker_photos
  │              (pivot)
  │                    │
  │                service_categories
  │
  ├── requests ──────────────────── worker_profiles
  │      │
  │      ├── reviews
  │      └── messages
  │
  └── notifications
```

---

## Tablas

### `users`
Tabla central. Un usuario puede ser cliente, trabajador o ambos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | Identificador único |
| email | VARCHAR(255) UNIQUE | Correo electrónico |
| password_hash | VARCHAR(255) | Contraseña hasheada (bcrypt) |
| full_name | VARCHAR(150) | Nombre completo |
| phone | VARCHAR(20) | Teléfono de contacto |
| avatar_url | TEXT | URL de foto de perfil |
| role | ENUM('CLIENT','WORKER','ADMIN') | Rol principal |
| is_worker | BOOLEAN DEFAULT false | ¿Tiene perfil de trabajador? |
| is_active | BOOLEAN DEFAULT true | Cuenta activa |
| is_verified | BOOLEAN DEFAULT false | Email verificado |
| created_at | TIMESTAMPTZ | Fecha de registro |
| updated_at | TIMESTAMPTZ | Última actualización |

---

### `worker_profiles`
Perfil profesional del trabajador. Relación 1:1 con `users`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | |
| bio | TEXT | Descripción profesional |
| base_price | DECIMAL(10,2) | Precio base por hora/servicio |
| price_unit | ENUM('HOUR','SERVICE','DAY') | Unidad del precio |
| coverage_radius_km | INTEGER DEFAULT 10 | Radio de cobertura en km |
| location | GEOGRAPHY(POINT, 4326) | Posición GPS (PostGIS) |
| city | VARCHAR(100) | Ciudad |
| address | TEXT | Dirección aproximada |
| years_experience | SMALLINT | Años de experiencia |
| average_rating | DECIMAL(3,2) DEFAULT 0 | Rating promedio (desnormalizado) |
| review_count | INTEGER DEFAULT 0 | Total de reseñas |
| jobs_completed | INTEGER DEFAULT 0 | Trabajos completados |
| status | ENUM('ACTIVE','INACTIVE','SUSPENDED') | Estado del perfil |
| is_available | BOOLEAN DEFAULT true | Disponible ahora |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Índices:**
```sql
CREATE INDEX idx_worker_location ON worker_profiles USING GIST(location);
CREATE INDEX idx_worker_status ON worker_profiles(status, is_available);
CREATE INDEX idx_worker_rating ON worker_profiles(average_rating DESC);
```

---

### `service_categories`
Catálogo maestro de tipos de servicio. Solo ADMIN puede modificarlo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| name | VARCHAR(100) UNIQUE | Ej: "Plomería", "Electricidad" |
| slug | VARCHAR(100) UNIQUE | Ej: "plomeria", "electricidad" |
| icon_url | TEXT | Ícono de la categoría |
| description | TEXT | Descripción breve |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |

---

### `worker_services`
Tabla pivot: qué servicios ofrece cada trabajador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| worker_id | UUID FK → worker_profiles.id | |
| category_id | UUID FK → service_categories.id | |
| custom_price | DECIMAL(10,2) | Precio específico para este servicio |
| description | TEXT | Descripción específica del servicio |
| created_at | TIMESTAMPTZ | |

**Constraint:** `UNIQUE(worker_id, category_id)`

---

### `worker_photos`
Galería de fotos de trabajos realizados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| worker_id | UUID FK → worker_profiles.id | |
| url | TEXT | URL de la imagen |
| caption | VARCHAR(255) | Descripción opcional |
| order | SMALLINT DEFAULT 0 | Orden de visualización |
| created_at | TIMESTAMPTZ | |

---

### `requests`
Solicitudes de servicio. Corazón del negocio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| client_id | UUID FK → users.id | |
| worker_id | UUID FK → worker_profiles.id | |
| category_id | UUID FK → service_categories.id | |
| title | VARCHAR(200) | Título del trabajo |
| description | TEXT | Descripción detallada |
| location | GEOGRAPHY(POINT, 4326) | Ubicación del trabajo |
| address | TEXT | Dirección del trabajo |
| scheduled_at | TIMESTAMPTZ | Fecha/hora propuesta |
| status | ENUM | Ver estados abajo |
| budget | DECIMAL(10,2) | Presupuesto del cliente |
| final_price | DECIMAL(10,2) | Precio acordado |
| client_notes | TEXT | Notas del cliente |
| worker_notes | TEXT | Notas del trabajador |
| cancelled_by | UUID FK → users.id | Quién canceló |
| cancel_reason | TEXT | Motivo de cancelación |
| completed_at | TIMESTAMPTZ | Fecha de finalización |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Estados de la solicitud:**
```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
        ↘ REJECTED
        
Desde cualquier estado → CANCELLED
```

---

### `reviews`
Calificaciones y reseñas. Solo después de COMPLETED.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| request_id | UUID FK → requests.id UNIQUE | Una reseña por solicitud |
| reviewer_id | UUID FK → users.id | Quien califica |
| worker_id | UUID FK → worker_profiles.id | Quien recibe |
| rating | SMALLINT CHECK (1-5) | Estrellas |
| comment | TEXT | Comentario |
| worker_reply | TEXT | Respuesta del trabajador |
| created_at | TIMESTAMPTZ | |

**Trigger:** Al insertar una review, recalcular `average_rating` y `review_count` en `worker_profiles`.

---

### `messages`
Mensajes del chat entre cliente y trabajador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| request_id | UUID FK → requests.id | Chat asociado a la solicitud |
| sender_id | UUID FK → users.id | Quién envió |
| content | TEXT | Contenido del mensaje |
| type | ENUM('TEXT','IMAGE','LOCATION') | Tipo de mensaje |
| media_url | TEXT | URL si es imagen |
| is_read | BOOLEAN DEFAULT false | Leído |
| read_at | TIMESTAMPTZ | Cuándo fue leído |
| created_at | TIMESTAMPTZ | |

**Índice:** `CREATE INDEX idx_messages_request ON messages(request_id, created_at);`

---

### `notifications`
Notificaciones del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | Destinatario |
| type | ENUM | Tipo de notificación |
| title | VARCHAR(200) | Título |
| body | TEXT | Contenido |
| data | JSONB | Metadata (request_id, etc.) |
| is_read | BOOLEAN DEFAULT false | Leída |
| created_at | TIMESTAMPTZ | |

**Tipos de notificación:**
- `NEW_REQUEST` — Trabajador recibe solicitud
- `REQUEST_ACCEPTED` — Cliente: solicitud aceptada
- `REQUEST_REJECTED` — Cliente: solicitud rechazada
- `REQUEST_COMPLETED` — Ambos: trabajo completado
- `NEW_MESSAGE` — Nuevo mensaje de chat
- `REVIEW_RECEIVED` — Trabajador recibe reseña

---

### `refresh_tokens`
Tokens de refresco para invalidación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | |
| user_id | UUID FK → users.id | |
| token_hash | VARCHAR(255) | Hash del token |
| expires_at | TIMESTAMPTZ | Expiración |
| is_revoked | BOOLEAN DEFAULT false | Invalidado |
| created_at | TIMESTAMPTZ | |

---

## SQL de creación (resumen)

```sql
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE user_role AS ENUM ('CLIENT', 'WORKER', 'ADMIN');
CREATE TYPE worker_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE request_status AS ENUM (
  'PENDING', 'ACCEPTED', 'REJECTED',
  'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);
CREATE TYPE price_unit AS ENUM ('HOUR', 'SERVICE', 'DAY');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'LOCATION');
CREATE TYPE notification_type AS ENUM (
  'NEW_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED',
  'REQUEST_COMPLETED', 'NEW_MESSAGE', 'REVIEW_RECEIVED'
);
```

---

## Trigger para actualizar rating

```sql
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE worker_profiles
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews WHERE worker_id = NEW.worker_id
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE worker_id = NEW.worker_id
    )
  WHERE id = NEW.worker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_worker_rating();
```
