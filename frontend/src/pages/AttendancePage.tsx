import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, LogIn, LogOut, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/axios';
import { membersApi } from '../api/members';
import { PageLoader } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import type { Attendance } from '../types';

interface AttendanceStats { todayCount: number; weekCount: number; averageDaily: number; }
interface AttendanceResponse { success: boolean; data: AttendanceStats; }
interface ListResponse { success: boolean; data: Attendance[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; }; }

export default function AttendancePage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');

  const { data: statsData } = useQuery<AttendanceStats>({
    queryKey: ['attendance-stats'],
    queryFn: () => api.get<AttendanceResponse>('/attendance/stats').then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ['attendance', page],
    queryFn: () => api.get<ListResponse>('/attendance', { params: { page, limit: 15 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: membersData } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => membersApi.getAll({ limit: 100, status: 'active' }),
  });

  const checkInMutation = useMutation({
    mutationFn: (member_id: string) => api.post('/attendance/check-in', { member_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['attendance-stats'] });
      setIsCheckInOpen(false);
      setSelectedMember('');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => api.put(`/attendance/${id}/check-out`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const duration = (checkIn: string, checkOut: string | null): string => {
    if (!checkOut) return 'In progress';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track member check-ins and check-outs</p>
        </div>
        <button onClick={() => setIsCheckInOpen(true)} className="btn-primary flex items-center gap-2 self-start">
          <LogIn size={16} /> Check In Member
        </button>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today's Check-ins", value: statsData.todayCount, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-600/20' },
            { label: 'This Week', value: statsData.weekCount, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-600/20' },
            { label: 'Daily Average', value: statsData.averageDaily, icon: ClipboardList, color: 'text-brand-400', bg: 'bg-brand-600/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No attendance records" description="Check-in a member to start tracking attendance." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="table-header">Member</th>
                    <th className="table-header">Check In</th>
                    <th className="table-header hidden sm:table-cell">Check Out</th>
                    <th className="table-header hidden md:table-cell">Duration</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((a) => (
                    <tr key={a.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={a.member?.user?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.member?.user?.name || 'M')}&background=ea580c&color=fff&size=36`}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-200">{a.member?.user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{a.member?.membership_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-gray-300">
                        {format(new Date(a.check_in), 'MMM d, h:mm a')}
                      </td>
                      <td className="table-cell hidden sm:table-cell text-gray-400">
                        {a.check_out ? format(new Date(a.check_out), 'h:mm a') : (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-400">
                        {duration(a.check_in, a.check_out)}
                      </td>
                      <td className="table-cell text-right">
                        {!a.check_out && (
                          <button
                            onClick={() => checkOutMutation.mutate(a.id)}
                            disabled={checkOutMutation.isPending}
                            className="text-xs text-orange-400 hover:text-orange-300 px-2.5 py-1 bg-orange-600/10 rounded-lg border border-orange-600/20 hover:border-orange-600/40 transition-all flex items-center gap-1 ml-auto"
                          >
                            <LogOut size={11} /> Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.pagination.totalPages > 1 && (
              <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} total={data.pagination.total} limit={data.pagination.limit} />
            )}
          </>
        )}
      </div>

      {/* Check-in modal */}
      <Modal isOpen={isCheckInOpen} onClose={() => { setIsCheckInOpen(false); setSelectedMember(''); }} title="Check In Member" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Select Active Member *</label>
            <select className="input" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">Choose a member...</option>
              {membersData?.data.filter((m) => m.status === 'active').map((m) => (
                <option key={m.id} value={m.id}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          {checkInMutation.isError && (
            <p className="text-sm text-red-400 bg-red-600/10 px-3 py-2 rounded-lg border border-red-600/20">
              {(checkInMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Check-in failed.'}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
            <button onClick={() => { setIsCheckInOpen(false); setSelectedMember(''); }} className="btn-secondary">Cancel</button>
            <button
              onClick={() => selectedMember && checkInMutation.mutate(selectedMember)}
              disabled={!selectedMember || checkInMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <LogIn size={14} />
              {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
