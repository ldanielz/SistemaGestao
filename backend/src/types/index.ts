// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'LEAD' | 'DEVELOPER' | 'CLIENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  budget?: number;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateProjectDTO {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  priority: Priority;
  budget?: number;
  ownerId: string;
}

// Task types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  startDate?: Date;
  endDate: Date;
  estimatedHours?: number;
  actualHours: number;
  assignedTo?: string;
  createdBy: string;
  blockedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  projectId: string;
  priority: Priority;
  endDate: Date;
  startDate?: Date;
  estimatedHours?: number;
  assignedTo?: string[];
}

export interface UpdateTaskStatusDTO {
  status: TaskStatus;
  comment?: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationType = 
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'COMMENT_ADDED'
  | 'PROJECT_STARTED'
  | 'DEADLINE_ALERT'
  | 'STATUS_CHANGED'
  | 'MENTION';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request context
export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}
