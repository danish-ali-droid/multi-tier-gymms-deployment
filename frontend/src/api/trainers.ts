import api from '../lib/axios';
import type { PaginatedApiResponse, ApiResponse, Trainer, PaginationParams } from '../types';

export const trainersApi = {
  getAll: (params?: PaginationParams) =>
    api
      .get<PaginatedApiResponse<Trainer>>('/trainers', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<{ trainer: Trainer }>>(`/trainers/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    api
      .post<ApiResponse<{ trainer: Trainer }>>('/trainers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  update: (id: string, formData: FormData) =>
    api
      .put<ApiResponse<{ trainer: Trainer }>>(`/trainers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/trainers/${id}`).then((r) => r.data),
};
