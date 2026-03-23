// Tipos espejo de Prisma para compilación sin DB conectada
// En producción, @prisma/client los genera automáticamente con `prisma generate`

export enum UserRole { CLIENT = 'CLIENT', WORKER = 'WORKER', ADMIN = 'ADMIN' }
export enum WorkerStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE', SUSPENDED = 'SUSPENDED' }
export enum RequestStatus { PENDING = 'PENDING', ACCEPTED = 'ACCEPTED', REJECTED = 'REJECTED', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED' }
export enum PriceUnit { HOUR = 'HOUR', SERVICE = 'SERVICE', DAY = 'DAY' }
export enum MessageType { TEXT = 'TEXT', IMAGE = 'IMAGE', LOCATION = 'LOCATION' }
export enum NotificationType { NEW_REQUEST = 'NEW_REQUEST', REQUEST_ACCEPTED = 'REQUEST_ACCEPTED', REQUEST_REJECTED = 'REQUEST_REJECTED', REQUEST_COMPLETED = 'REQUEST_COMPLETED', NEW_MESSAGE = 'NEW_MESSAGE', REVIEW_RECEIVED = 'REVIEW_RECEIVED' }

export interface User {
  id: string; email: string; passwordHash: string; fullName: string;
  phone?: string; avatarUrl?: string; role: UserRole;
  isWorker: boolean; isActive: boolean; isVerified: boolean;
  createdAt: Date; updatedAt: Date;
}
