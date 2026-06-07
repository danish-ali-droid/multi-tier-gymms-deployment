import api from '../lib/axios';
import type { PaginatedApiResponse, ApiResponse, Payment } from '../types';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingCount: number;
  completedCount: number;
  monthlyData: { month: string; total: string }[];
}

interface CreatePaymentDto {
  member_id: string;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string;
  description?: string;
}

export const paymentsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api
      .get<PaginatedApiResponse<Payment>>('/payments', { params })
      .then((r) => r.data),

  getStats: () =>
    api.get<ApiResponse<PaymentStats>>('/payments/stats').then((r) => r.data),

  create: (dto: CreatePaymentDto) =>
    api
      .post<ApiResponse<{ payment: Payment }>>('/payments', dto)
      .then((r) => r.data),

  update: (id: string, dto: Partial<CreatePaymentDto>) =>
    api
      .put<ApiResponse<{ payment: Payment }>>(`/payments/${id}`, dto)
      .then((r) => r.data),
};
