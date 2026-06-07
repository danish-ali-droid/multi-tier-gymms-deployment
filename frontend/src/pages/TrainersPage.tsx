import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCheck, Pencil, Trash2, Star } from 'lucide-react';
import { trainersApi } from '../api/trainers';
import Badge from '../components/ui/Badge';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/LoadingSpinner';
import TrainerFormModal from '../components/trainers/TrainerFormModal';
import type { Trainer } from '../types';

export default function TrainersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trainers', page, search],
    queryFn: () => trainersApi.getAll({ page, limit: 12, search: search || undefined }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: trainersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setDeletingId(null);
    },
  });

  const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trainers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.pagination.total ?? 0} trainers on staff</p>
        </div>
        <button onClick={() => { setEditingTrainer(null); setIsFormOpen(true); }} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search trainers..." />
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data || data.data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={UserCheck}
            title="No trainers found"
            description="Add your first trainer to get started."
            action={
              <button onClick={() => { setEditingTrainer(null); setIsFormOpen(true); }} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Add Trainer
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((trainer) => (
              <div key={trainer.id} className="card p-5 hover:border-gray-700 transition-all duration-200">
                {/* Trainer header */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={
                      trainer.user?.profile_image_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.user?.name || 'T')}&background=ea580c&color=fff&size=80`
                    }
                    alt={trainer.user?.name}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{trainer.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{trainer.user?.email}</p>
                      </div>
                      <Badge variant={trainer.is_available ? 'active' : 'inactive'} label={trainer.is_available ? 'Available' : 'Busy'} />
                    </div>

                    {trainer.rating !== null && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">{Number(trainer.rating).toFixed(1)}</span>
                        <span className="text-xs text-gray-600">rating</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {trainer.bio && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{trainer.bio}</p>
                )}

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(trainer.specialization || []).slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-brand-600/10 text-brand-400 text-xs rounded-lg border border-brand-600/20">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-3 mb-3">
                  <span>{trainer.experience_years} yrs exp.</span>
                  {trainer.hourly_rate && <span>${Number(trainer.hourly_rate).toFixed(0)}/hr</span>}
                  <span>{(trainer.certifications || []).length} certs</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingTrainer(trainer); setIsFormOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-brand-400 hover:bg-brand-600/10 rounded-lg transition-all border border-gray-800 hover:border-brand-600/30"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(trainer.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all border border-gray-800 hover:border-red-600/30"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="card">
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                total={data.pagination.total}
                limit={data.pagination.limit}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Remove Trainer</h3>
            <p className="text-sm text-gray-400 mb-6">This trainer will be deactivated from the system.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeletingId(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deletingId)} disabled={deleteMutation.isPending} className="btn-danger text-sm">
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TrainerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTrainer(null); }}
        trainer={editingTrainer}
      />
    </div>
  );
}
