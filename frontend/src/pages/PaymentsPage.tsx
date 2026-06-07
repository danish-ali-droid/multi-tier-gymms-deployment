import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { paymentsApi } from '../api/payments';
import { membersApi } from '../api/members';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import type { PaymentStatus } from '../types';
import axios from 'axios';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newPayment, setNewPayment] = useState({
    member_id: '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    status: 'completed',
    payment_method: 'cash',
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, statusFilter],
    queryFn: () => paymentsApi.getAll({ page, limit: 15, status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  const { data: statsData } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => paymentsApi.getStats().then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => membersApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      paymentsApi.create({
        member_id: newPayment.member_id,
        amount: parseFloat(newPayment.amount),
        payment_date: newPayment.payment_date,
        status: newPayment.status,
        payment_method: newPayment.payment_method,
        description: newPayment.description || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setIsFormOpen(false);
      setNewPayment({ member_id: '', amount: '', payment_date: new Date().toISOString().slice(0, 10), status: 'completed', payment_method: 'cash', description: '' });
    },
    onError: (err) => {
      setFormError(axios.isAxiosError(err) ? err.response?.data?.message || 'Failed.' : 'Unexpected error.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => paymentsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.pagination.total ?? 0} transactions</p>
        </div>
        <button onClick={() => { setIsFormOpen(true); setFormError(''); }} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(statsData.totalRevenue), icon: DollarSign, color: 'text-brand-400', bg: 'bg-brand-600/20' },
            { label: 'This Month', value: formatCurrency(statsData.monthlyRevenue), icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-600/20' },
            { label: 'Completed', value: statsData.completedCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-600/20' },
            { label: 'Pending', value: statsData.pendingCount, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="card p-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input text-sm w-full sm:w-48">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments found" description="Record your first payment to get started." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="table-header">Member</th>
                    <th className="table-header hidden md:table-cell">Transaction ID</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header hidden sm:table-cell">Method</th>
                    <th className="table-header hidden md:table-cell">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.member?.user?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.member?.user?.name || 'M')}&background=ea580c&color=fff&size=36`}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{p.member?.user?.name}</p>
                            {p.description && <p className="text-xs text-gray-600 truncate">{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="font-mono text-xs text-gray-500">{p.transaction_id}</span>
                      </td>
                      <td className="table-cell font-semibold text-white">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="table-cell hidden sm:table-cell text-gray-400 capitalize">
                        {p.payment_method.replace('_', ' ')}
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-400">
                        {format(new Date(p.payment_date), 'MMM d, yyyy')}
                      </td>
                      <td className="table-cell">
                        <Badge variant={p.status as PaymentStatus} />
                      </td>
                      <td className="table-cell text-right">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'completed' })}
                            className="text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1 bg-emerald-600/10 rounded-lg border border-emerald-600/20 hover:border-emerald-600/40 transition-all"
                          >
                            Mark Paid
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

      {/* Add payment modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Record Payment" size="md">
        <div className="space-y-4">
          {formError && <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div>
            <label className="label">Member *</label>
            <select required className="input" value={newPayment.member_id} onChange={(e) => setNewPayment({ ...newPayment, member_id: e.target.value })}>
              <option value="">Select a member...</option>
              {membersData?.data.map((m) => (
                <option key={m.id} value={m.id}>{m.user?.name} — {m.membership_type}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($) *</label>
              <input required type="number" min="0" step="0.01" className="input" placeholder="99.99" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input required type="date" className="input" value={newPayment.payment_date} onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={newPayment.status} onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="label">Method</label>
              <select className="input" value={newPayment.payment_method} onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Monthly membership renewal..." value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-800">
            <button onClick={() => setIsFormOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newPayment.member_id || !newPayment.amount}
              className="btn-primary"
            >
              {createMutation.isPending ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
