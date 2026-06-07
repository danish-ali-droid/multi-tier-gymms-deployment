// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'member' | 'trainer';
  profile_image_url: string | null;
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// ── Member ────────────────────────────────────────────────────────────────────
export type MembershipType = 'basic' | 'standard' | 'premium' | 'vip';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'expired';

export interface Member {
  id: string;
  user_id: string;
  membership_type: MembershipType;
  start_date: string;
  end_date: string;
  status: MemberStatus;
  phone: string | null;
  emergency_contact: string | null;
  health_notes: string | null;
  assigned_trainer_id: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// ── Trainer ───────────────────────────────────────────────────────────────────
export interface Trainer {
  id: string;
  user_id: string;
  specialization: string[];
  experience_years: number;
  bio: string | null;
  certifications: string[];
  hourly_rate: number | null;
  is_available: boolean;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';

export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  due_date: string | null;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  description: string | null;
  transaction_id: string | null;
  createdAt: string;
  member?: Member;
}

// ── Attendance ────────────────────────────────────────────────────────────────
export interface Attendance {
  id: string;
  member_id: string;
  check_in: string;
  check_out: string | null;
  notes: string | null;
  member?: Member;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  pendingPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  todayAttendance: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: string;
  transactions: string;
}

export interface MembershipDist {
  membership_type: MembershipType;
  count: string;
}

export interface NewMembersByMonth {
  month: string;
  count: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: {
    revenueByMonth: RevenueByMonth[];
    membershipDist: MembershipDist[];
    newMembersByMonth: NewMembersByMonth[];
  };
  recent: {
    payments: Payment[];
    expiringMembers: Member[];
  };
}

// ── API response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  membership_type?: string;
}
