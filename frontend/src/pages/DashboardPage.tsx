import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Activity,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { dashboardApi } from '../api/dashboard';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/LoadingSpinner';
import type { MemberStatus, PaymentStatus } from '../types';

const PLAN_COLORS: Record<string, string> = {
  basic: '#64748b',
  standard: '#3b82f6',
  premium: '#f97316',
  vip: '#a855f7',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 font-medium">Failed to load dashboard</p>
          <p className="text-gray-500 text-sm mt-1">Check your backend connection</p>
        </div>
      </div>
    );
  }

  const { stats, charts, recent } = data;

  const revenueChartData = charts.revenueByMonth.map((r) => ({
    month: format(parseISO(r.month + '-01'), 'MMM yy'),
    revenue: parseFloat(r.revenue),
    transactions: parseInt(r.transactions),
  }));

  const membershipPieData = charts.membershipDist.map((m) => ({
    name: m.membership_type.charAt(0).toUpperCase() + m.membership_type.slice(1),
    value: parseInt(m.count),
    key: m.membership_type,
  }));

  const newMembersData = charts.newMembersByMonth.map((m) => ({
    month: format(parseISO(m.month + '-01'), 'MMM yy'),
    members: parseInt(m.count),
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview of your gym operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          subtitle={`${stats.activeMembers} active`}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-600/20"
        />
        <StatCard
          title="Active Trainers"
          value={stats.totalTrainers}
          subtitle="Available now"
          icon={UserCheck}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-600/20"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          subtitle="This month"
          icon={DollarSign}
          iconColor="text-brand-400"
          iconBg="bg-brand-600/20"
          trend={stats.revenueGrowth}
          trendLabel="vs last month"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle="Needs attention"
          icon={CreditCard}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-600/20"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="All time"
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-600/20"
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayAttendance}
          subtitle="Members present"
          icon={Activity}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-600/20"
        />
        <StatCard
          title="Expiring Soon"
          value={recent.expiringMembers.length}
          subtitle="Within 7 days"
          icon={Clock}
          iconColor="text-orange-400"
          iconBg="bg-orange-600/20"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="xl:col-span-2 card p-6">
          <h2 className="text-base font-semibold text-white mb-5">Revenue Trend</h2>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#ea580c', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-600">No revenue data yet</div>
          )}
        </div>

        {/* Membership distribution */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-5">Membership Plans</h2>
          {membershipPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={membershipPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {membershipPieData.map((entry) => (
                      <Cell key={entry.key} fill={PLAN_COLORS[entry.key] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                    formatter={(v: number) => [v, 'Members']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {membershipPieData.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.key] }} />
                      <span className="text-gray-400 capitalize">{entry.name}</span>
                    </div>
                    <span className="text-gray-200 font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-600">No data</div>
          )}
        </div>
      </div>

      {/* New members bar chart */}
      {newMembersData.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-5">New Members / Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={newMembersData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} labelStyle={{ color: '#f3f4f6' }} />
              <Bar dataKey="members" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent payments */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-white">Recent Payments</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {recent.payments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No payments yet</p>
            )}
            {recent.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={p.member?.user?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.member?.user?.name || 'M')}&background=3b82f6&color=fff&size=36`}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{p.member?.user?.name}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(Number(p.amount))}</p>
                  <Badge variant={p.status as PaymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring memberships */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-400" />
              <h2 className="text-base font-semibold text-white">Expiring Memberships</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-800">
            {recent.expiringMembers.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No expiring memberships</p>
            )}
            {recent.expiringMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={m.user?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'M')}&background=ea580c&color=fff&size=36`}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{m.user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{m.membership_type} plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-400 font-medium">
                    Expires {format(new Date(m.end_date), 'MMM d')}
                  </p>
                  <Badge variant={m.status as MemberStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
