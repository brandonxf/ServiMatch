# Flujo Principal del Sistema — ServiMatch

## Flujo 1: Cliente busca y contacta a un trabajador

```
1. Cliente abre la app
   └─ Si no está autenticado → redirige a /auth/login
   └─ Si está autenticado → carga /search con su ubicación

2. El navegador solicita permiso de geolocalización
   └─ Si acepta: se obtiene lat/lng automáticamente
   └─ Si rechaza: se muestra input de dirección manual

3. Cliente selecciona una categoría (ej: "Plomería")
   └─ GET /geo/workers?lat=&lng=&radius=10&category=plomeria
   └─ Backend ejecuta: SELECT ... ST_DWithin(location, point, radius)
   └─ Se retorna lista ordenada por: disponibilidad + distancia + rating

4. Se muestra el mapa con pins de los trabajadores
   + Lista lateral con cards: nombre, rating, precio, distancia

5. Cliente hace clic en un trabajador
   └─ GET /workers/:id (perfil completo)
   └─ Se muestra: bio, galería, servicios, reseñas, precio

6. Cliente toca "Solicitar servicio"
   └─ Se abre formulario: descripción, fecha, presupuesto
   └─ POST /requests
   └─ Status inicial: PENDING
   └─ WebSocket event → trabajador recibe notificación NEW_REQUEST

7. Trabajador acepta la solicitud
   └─ PATCH /requests/:id/accept
   └─ Status cambia a: ACCEPTED
   └─ Se crea automáticamente la sala de chat
   └─ Cliente recibe notificación: "Tu solicitud fue aceptada"

8. Chat habilitado entre ambas partes
   └─ Socket.io: room = requestId
   └─ Mensajes se guardan en PostgreSQL
   └─ Soporte para texto, imágenes y ubicación

9. Trabajador llega y comienza el trabajo
   └─ PATCH /requests/:id/start → IN_PROGRESS

10. Trabajo finaliza
    └─ PATCH /requests/:id/complete → COMPLETED
    └─ Cliente recibe notificación para calificar

11. Cliente deja reseña
    └─ POST /reviews { request_id, rating, comment }
    └─ Trigger actualiza average_rating del trabajador
```

---

## Flujo 2: Registro de trabajador

```
1. Usuario se registra con role: "WORKER"
   └─ POST /auth/register { role: "WORKER" }

2. Redirige a /dashboard/worker/setup (wizard de configuración)

   Paso 1: Información básica
   └─ Bio, años de experiencia, foto de perfil

   Paso 2: Servicios que ofrece
   └─ Selecciona de la lista de categorías
   └─ Define precio por servicio

   Paso 3: Zona de cobertura
   └─ Mueve pin en el mapa (su ubicación base)
   └─ Define radio de cobertura (5, 10, 20, 30 km)

   Paso 4: Portafolio
   └─ Sube fotos de trabajos anteriores (opcional)

3. Perfil activo → el trabajador aparece en búsquedas

4. Trabajador puede actualizar su ubicación en tiempo real
   └─ PATCH /workers/me/location { lat, lng }
```

---

## Flujo 3: Sistema de notificaciones en tiempo real

```
Trabajador online:
  ├─ Socket conectado → Room: "user:{userId}"
  └─ Recibe eventos:
       new_request     → Sonido + badge en navbar
       new_message     → Badge en chat
       review_received → Notificación con rating

Cliente online:
  └─ Recibe eventos:
       request_accepted → "¡Tu solicitud fue aceptada!"
       request_rejected → "El trabajador no está disponible"
       new_message      → Badge en chat
       worker_location  → Pin del trabajador se mueve en el mapa

Usuario offline:
  └─ La notificación se guarda en la tabla notifications
  └─ Al conectarse, se carga el historial de no leídas
```

---

## Flujo 4: Transiciones de estado de una solicitud

```
                    [Cliente crea]
                         │
                      PENDING
                    /         \
             [Worker acepta]  [Worker rechaza]
                 │                  │
             ACCEPTED           REJECTED
                 │
         [Worker inicia]
                 │
           IN_PROGRESS
                 │
         [Worker completa]
                 │
           COMPLETED ──→ [Cliente puede calificar]

Desde cualquier estado (excepto COMPLETED/REJECTED):
  └─ CANCELLED (por cliente o trabajador)
```

---

## Flujo 5: Búsqueda geoespacial (detalle técnico)

```sql
-- Query que ejecuta GET /geo/workers
SELECT
  u.full_name,
  u.avatar_url,
  wp.id,
  wp.base_price,
  wp.average_rating,
  wp.is_available,
  ST_Distance(wp.location, ST_MakePoint($lng, $lat)::geography) / 1000 AS distance_km
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
WHERE
  wp.status = 'ACTIVE'
  AND wp.is_available = true
  AND ST_DWithin(
    wp.location,
    ST_MakePoint($lng, $lat)::geography,
    $radius_km * 1000  -- convertir km a metros
  )
  AND (
    $category IS NULL
    OR EXISTS (
      SELECT 1 FROM worker_services ws
      JOIN service_categories sc ON sc.id = ws.category_id
      WHERE ws.worker_id = wp.id AND sc.slug = $category
    )
  )
ORDER BY
  wp.is_available DESC,
  distance_km ASC,
  wp.average_rating DESC
LIMIT $limit OFFSET $offset;
```
