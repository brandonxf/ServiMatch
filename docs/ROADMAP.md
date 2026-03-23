# Roadmap de Desarrollo — ServiMatch

## Principio: ship fast, iterate faster

Construir en este orden exacto. Cada fase debe estar funcionando antes de pasar a la siguiente. No añadir features de fases futuras antes de tiempo.

---

## Fase 1 — Fundación (Semanas 1–2)

**Objetivo:** El proyecto arranca, se puede hacer login y el mapa muestra trabajadores.

### Backend
- [ ] Setup NestJS + Prisma + PostgreSQL + PostGIS
- [ ] Variables de entorno y configuración base
- [ ] Schema de Prisma con todas las tablas
- [ ] Migraciones iniciales
- [ ] `AuthModule`: registro, login, JWT, refresh tokens
- [ ] `UsersModule`: CRUD básico de perfil
- [ ] `WorkersModule`: crear y leer perfil de trabajador
- [ ] `ServicesModule`: CRUD de categorías (seed inicial)
- [ ] `GeoModule`: endpoint de búsqueda `GET /geo/workers`
- [ ] Guard de autenticación y roles

### Frontend
- [ ] Setup Next.js 15 + TailwindCSS + shadcn/ui
- [ ] Layout base: navbar, footer
- [ ] Página `/auth/login` y `/auth/register`
- [ ] Integración con la API (axios/fetch + interceptors)
- [ ] Zustand store: usuario autenticado
- [ ] Página `/search` con mapa (Mapbox)
- [ ] Pins de trabajadores en el mapa
- [ ] Lista lateral de trabajadores

**Entregable:** Se puede buscar trabajadores en un mapa ✓

---

## Fase 2 — Perfiles y solicitudes (Semanas 3–4)

**Objetivo:** Un cliente puede ver el perfil de un trabajador y enviar una solicitud.

### Backend
- [ ] `WorkersModule`: actualizar perfil, subida de fotos
- [ ] Integración Supabase Storage para imágenes
- [ ] `RequestsModule`: crear solicitud, cambios de estado
- [ ] Validaciones de negocio (ej: no solicitar a worker no disponible)
- [ ] `NotificationsModule`: guardar notificaciones en DB

### Frontend
- [ ] Wizard de configuración de perfil de trabajador
- [ ] Página `/workers/[id]`: perfil público completo
- [ ] Galería de fotos del trabajador
- [ ] Formulario de solicitud de servicio
- [ ] Página `/dashboard/requests`: mis solicitudes (cliente)
- [ ] Página `/dashboard/worker/requests`: solicitudes recibidas
- [ ] Botones de aceptar/rechazar/completar solicitudes

**Entregable:** Flujo completo de solicitud sin tiempo real ✓

---

## Fase 3 — Tiempo real y chat (Semanas 5–6)

**Objetivo:** Chat funcionando entre cliente y trabajador.

### Backend
- [ ] Setup Socket.io + Gateway de NestJS
- [ ] `ChatModule`: mensajes persistidos en DB
- [ ] Rooms de Socket.io por `requestId`
- [ ] Eventos: `send_message`, `new_message`, `typing`
- [ ] Notificaciones en tiempo real por WebSocket
- [ ] Bull Queue + Redis para procesamiento de notificaciones

### Frontend
- [ ] Página `/chat/[requestId]`: interfaz de chat
- [ ] Lista de conversaciones `/dashboard/messages`
- [ ] Indicador de escritura (typing...)
- [ ] Badge de mensajes no leídos en navbar
- [ ] Notificaciones en tiempo real (toast + badge)
- [ ] Panel de notificaciones

**Entregable:** Chat en tiempo real funcionando ✓

---

## Fase 4 — Reseñas y pulido (Semana 7)

**Objetivo:** Sistema de calificaciones y experiencia de usuario completa.

### Backend
- [ ] `ReviewsModule`: crear reseña, responder reseña
- [ ] Trigger PostgreSQL para actualizar rating
- [ ] Filtros de búsqueda: min_rating, max_price
- [ ] Paginación en todos los listados
- [ ] Rate limiting con Redis
- [ ] Logging y manejo de errores global

### Frontend
- [ ] Flujo de calificación post-servicio
- [ ] Visualización de reseñas en perfil del trabajador
- [ ] Filtros en la búsqueda (rating, precio, disponibilidad)
- [ ] Estados de carga (skeletons)
- [ ] Manejo de errores con toasts
- [ ] Página 404 y error boundary

**Entregable:** MVP completo y pulido ✓

---

## Fase 5 — Admin y deploy (Semana 8)

**Objetivo:** Panel de administración y la app en producción.

### Backend
- [ ] `AdminModule`: stats, gestión de usuarios, verificación de workers
- [ ] Endpoints protegidos por rol ADMIN
- [ ] Docker Compose para producción
- [ ] Variables de entorno de producción
- [ ] HTTPS con Let's Encrypt

### Frontend
- [ ] Panel `/admin`: dashboard con métricas
- [ ] Listado y gestión de usuarios
- [ ] Verificación de trabajadores
- [ ] SEO básico: meta tags, OG tags
- [ ] PWA: manifest + service worker básico

### Infraestructura
- [ ] Deploy backend en Railway o Render
- [ ] Deploy frontend en Vercel
- [ ] PostgreSQL en Supabase o Neon
- [ ] Redis en Upstash
- [ ] Dominio y SSL

**Entregable:** ServiMatch MVP en producción 🚀

---

## Fase 6 — Crecimiento (Post-MVP)

Features para después de tener usuarios reales:

- [ ] **Pagos integrados**: Wompi, MercadoPago o Stripe
- [ ] **App móvil**: React Native (reutiliza la lógica de negocio)
- [ ] **Verificación de trabajadores**: subida de documentos, badge verificado
- [ ] **Tracking en tiempo real**: ubicación del trabajador en camino
- [ ] **Sistema de presupuestos**: trabajador envía cotización antes de aceptar
- [ ] **Asistente IA**: matching automático basado en historial y descripción
- [ ] **Suscripción premium**: workers pagan para aparecer primero
- [ ] **Multi-idioma**: i18n para expandir a otros países

---

## Priorización de decisiones técnicas

| Decisión | Recomendación | Cuándo |
|----------|---------------|--------|
| ¿ORM o SQL raw? | Prisma hasta 100k usuarios, luego SQL raw para queries críticas | Desde el inicio |
| ¿Redis obligatorio desde el MVP? | Sí — al menos para refresh tokens y rate limiting | Fase 1 |
| ¿Subir imágenes al backend o directo? | Directo a Supabase Storage desde el cliente (signed URLs) | Fase 2 |
| ¿Socket.io o SSE para notificaciones? | Socket.io — ya lo necesitas para el chat | Fase 3 |
| ¿Tests desde el inicio? | Solo tests de integración para endpoints críticos (auth, requests) | Fase 4 |
| ¿Monolito o microservicios? | Monolito modular hasta 50k usuarios activos | Post-MVP |
