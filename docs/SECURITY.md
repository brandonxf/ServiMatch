# Seguridad y Buenas Prácticas — ServiMatch

## Autenticación y autorización

### JWT Strategy
- **Access Token**: TTL de 15 minutos. Viaja en `Authorization: Bearer` header.
- **Refresh Token**: TTL de 7 días. Viaja en cookie `HttpOnly; Secure; SameSite=Strict`.
- Los refresh tokens se almacenan hasheados en Redis. Al hacer logout, se elimina el token de Redis → invalidación inmediata.
- **No guardar JWT en localStorage**. Es vulnerable a XSS. Usar cookies HttpOnly para el refresh token.

### Guards de NestJS
```
JwtAuthGuard     → Verifica que el access token sea válido
RolesGuard       → Verifica que el usuario tenga el rol requerido
OwnershipGuard   → Verifica que el recurso pertenece al usuario autenticado
```

### Reglas de autorización
- Un cliente **no puede** aceptar/rechazar solicitudes (solo el worker asignado)
- Un worker **no puede** calificar (solo el cliente)
- Un usuario **solo puede** ver sus propios mensajes y notificaciones
- Los datos de ubicación exacta del trabajador **solo se revelan** cuando hay una solicitud aceptada

---

## Seguridad de la API

### Rate Limiting (con Redis)
```
/auth/login          → 5 intentos por IP por minuto
/auth/register       → 3 registros por IP por hora
/auth/forgot-password → 3 intentos por email por hora
GET /geo/workers     → 60 requests por IP por minuto
POST /requests       → 10 solicitudes por usuario por hora
```

### Validación de datos
- Usar `class-validator` en todos los DTOs de NestJS
- Sanitizar inputs para prevenir SQL Injection (Prisma ya lo hace por defecto)
- Validar y sanitizar URLs de imágenes antes de guardarlas
- Limitar tamaño de uploads: máximo 5MB por imagen

### Headers de seguridad (Helmet)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...
```

### CORS
Solo permitir origins del dominio propio:
```
origins: ['https://servimatch.com', 'https://www.servimatch.com']
```

---

## Seguridad de datos

### Contraseñas
- Hash con **bcrypt**, costo mínimo de 12 rounds
- Nunca loggear contraseñas, ni siquiera hasheadas
- Validar complejidad: mínimo 8 caracteres, una mayúscula, un número

### Datos sensibles
- El número de teléfono del trabajador **no se expone** en la búsqueda pública
- Solo se comparte cuando hay una solicitud aceptada
- La ubicación exacta del trabajador se redondea a 2 decimales en búsquedas públicas (precisión ~1km)

### Uploads de imágenes
- Validar tipo MIME en el servidor (no confiar en la extensión)
- Regenerar el nombre del archivo con UUID (no usar el nombre original)
- Escaneo de virus en producción (opcional pero recomendado)
- Almacenar en Supabase Storage / S3, nunca en el servidor

---

## Prevención de fraude

### Reseñas
- Solo se puede dejar reseña si la solicitud está en estado `COMPLETED`
- Un usuario solo puede dejar una reseña por solicitud (`UNIQUE` constraint)
- No permitir auto-calificación (cliente ≠ trabajador)

### Solicitudes
- Un trabajador no puede tener más de X solicitudes activas simultáneamente (configurable)
- Detectar y bloquear patrones de spam de solicitudes

### Cuentas
- Verificación de email obligatoria para operar
- Detección de múltiples cuentas por mismo teléfono/dispositivo
- Sistema de reportes: usuarios pueden reportar trabajadores y viceversa

---

## Buenas prácticas de código

### Variables de entorno
- Nunca hardcodear secrets en el código
- Usar `.env.example` con las keys sin valores
- En producción, usar secrets manager (Railway secrets, AWS Secrets Manager)

### Logging
```
INFO  → Acciones normales del negocio (solicitud creada, usuario registrado)
WARN  → Situaciones anómalas pero no críticas (login fallido, rate limit)
ERROR → Errores que requieren atención (DB caída, fallo de pago)
```
- Nunca loggear datos personales (email, teléfono, ubicación exacta)

### Base de datos
- Usar transacciones para operaciones que modifican múltiples tablas
- Índices en todas las foreign keys y columnas de búsqueda frecuente
- Backups automáticos diarios en producción
- Conexión con pool máximo de 20 conexiones por instancia

### API
- Versionar la API desde el inicio: `/v1/`
- Usar códigos HTTP correctos (no devolver 200 con `{ error: true }`)
- Formato de error consistente en toda la API
- Documentar con Swagger/OpenAPI desde el inicio

---

## Checklist de seguridad pre-producción

- [ ] HTTPS habilitado con certificado válido
- [ ] Variables de entorno fuera del repositorio
- [ ] Rate limiting configurado
- [ ] Helmet configurado en NestJS
- [ ] CORS restringido al dominio propio
- [ ] JWT con TTL corto + refresh tokens en cookies HttpOnly
- [ ] Backups automáticos de PostgreSQL configurados
- [ ] Logs sin datos personales
- [ ] Imágenes en storage externo (no en el servidor)
- [ ] Validación de inputs en todos los endpoints
- [ ] Tests de seguridad básicos (OWASP Top 10)
