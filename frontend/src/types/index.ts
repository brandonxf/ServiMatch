export type UserRole = 'CLIENT' | 'WORKER' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PriceUnit = 'HOUR' | 'SERVICE' | 'DAY';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isWorker: boolean;
  isVerified: boolean;
  createdAt: string;
  workerProfile?: WorkerProfile | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
}

export interface WorkerService {
  id: string;
  customPrice?: number;
  description?: string;
  category: ServiceCategory;
}

export interface WorkerPhoto {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  bio?: string;
  basePrice?: number;
  priceUnit: PriceUnit;
  coverageRadiusKm: number;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  yearsExperience?: number;
  averageRating: number;
  reviewCount: number;
  jobsCompleted: number;
  status: string;
  isAvailable: boolean;
  user?: Pick<User, 'id' | 'fullName' | 'avatarUrl' | 'phone' | 'isVerified'>;
  workerServices?: WorkerService[];
  photos?: WorkerPhoto[];
  distanceKm?: string;
}

export interface Request {
  id: string;
  title: string;
  description?: string;
  address?: string;
  status: RequestStatus;
  budget?: number;
  finalPrice?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  client?: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  worker?: WorkerProfile;
  category?: ServiceCategory;
  review?: Review | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  workerReply?: string;
  createdAt: string;
  reviewer?: Pick<User, 'fullName' | 'avatarUrl'>;
}

export interface Message {
  id: string;
  requestId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'LOCATION';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  requestId: string;
  title: string;
  status: RequestStatus;
  otherUser: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  lastMessage?: Message;
  updatedAt: string;
}

export interface SearchResult {
  data: WorkerProfile[];
  meta: { total: number; page: number; limit: number; radius: number; lat: number; lng: number };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
