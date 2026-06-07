import api from '../lib/axios';
import type { PaginatedApiResponse, ApiResponse, Member, PaginationParams } from '../types';

export const membersApi = {
  getAll: (params?: PaginationParams) =>
    api
      .get<PaginatedApiResponse<Member>>('/members', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ member: Member }>>(`/members/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    api
      .post<ApiResponse<{ member: Member }>>('/members', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  update: (id: string, formData: FormData) =>
    api
      .put<ApiResponse<{ member: Member }>>(`/members/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/members/${id}`).then((r) => r.data),
};
