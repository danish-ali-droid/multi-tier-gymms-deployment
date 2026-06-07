import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { membersApi } from '../api/members';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import MemberFormModal from '../components/members/MemberFormModal';
import type { Member, MemberStatus, MembershipType } from '../types';

const PLAN_BADGE: Record<MembershipType, string> = {
  basic: 'bg-gray-600/30 text-gray-400',
  standard: 'bg-blue-600/20 text-blue-400',
  premium: 'bg-brand-600/20 text-brand-400',
  vip: 'bg-purple-600/20 text-purple-400',
};

export default function MembersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter, membershipFilter],
    queryFn: () =>
      membersApi.getAll({ page, limit: 10, search: search || undefined, status: statusFilter || undefined, membership_type: membershipFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setDeletingId(null);
    },
  });

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const openCreate = () => { setEditingMember(null); setIsFormOpen(true); };
  const openEdit = (m: Member) => { setEditingMember(m); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingMember(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.pagination.total ?? 0} total members
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or email..." />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input text-sm w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={membershipFilter}
            onChange={(e) => { setMembershipFilter(e.target.value); setPage(1); }}
            className="input text-sm w-full sm:w-40"
          >
            <option value="">All Plans</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description={search ? 'Try a different search term.' : 'Add your first gym member to get started.'}
            action={
              !search && (
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                  <Plus size={16} /> Add Member
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="table-header">Member</th>
                    <th className="table-header hidden md:table-cell">Plan</th>
                    <th className="table-header hidden lg:table-cell">Phone</th>
                    <th className="table-header hidden md:table-cell">Joined</th>
                    <th className="table-header hidden lg:table-cell">Expires</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((member) => (
                    <tr key={member.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.user?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || 'M')}&background=ea580c&color=fff&size=40`}
                            alt={member.user?.name}
                            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-100 truncate">{member.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${PLAN_BADGE[member.membership_type]}`}>
                          {member.membership_type}
                        </span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        {member.phone || <span className="text-gray-600">—</span>}
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-400">
                        {format(new Date(member.start_date), 'MMM d, yyyy')}
                      </td>
                      <td className="table-cell hidden lg:table-cell text-gray-400">
                        {format(new Date(member.end_date), 'MMM d, yyyy')}
                      </td>
                      <td className="table-cell">
                        <Badge variant={member.status as MemberStatus} />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(member)}
                            className="p-1.5 text-gray-500 hover:text-brand-400 hover:bg-brand-600/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingId(member.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                total={data.pagination.total}
                limit={data.pagination.limit}
              />
            )}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Deactivate Member</h3>
            <p className="text-sm text-gray-400 mb-6">
              This member will be deactivated and their membership suspended. This action can be undone by editing the member.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeletingId(null)} className="btn-secondary text-sm">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="btn-danger text-sm"
              >
                {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member form modal */}
      <MemberFormModal isOpen={isFormOpen} onClose={closeForm} member={editingMember} />
    </div>
  );
}
