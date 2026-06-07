import api from '../lib/axios';
import type { ApiResponse, DashboardData } from '../types';

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<DashboardData>>('/dashboard/stats').then((r) => r.data),
};
