import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { Users, FileText, Clock, CheckCircle, ClipboardList, TrendingUp } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className="stat-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </div>
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
            </div>
        </div>
    </div>
);
const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.getAdmin()
            .then((res) => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
    if (!data) return null;

    const { analytics, recentPolicies, recentRequests } = data;

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">System overview and analytics</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <TrendingUp size={16} />
                    Live
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={analytics.users.total} icon={Users} color="bg-indigo-500"
                    sub={`${analytics.users.faculty} faculty · ${analytics.users.students} students`} />
                <StatCard title="Total Policies" value={analytics.policies.total} icon={FileText} color="bg-violet-500"
                    sub={`${analytics.policies.draft} drafts`} />
                <StatCard title="Pending Approval" value={analytics.policies.pending} icon={Clock} color="bg-amber-500" />
                <StatCard title="Approved Policies" value={analytics.policies.approved} icon={CheckCircle} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Policies */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-500" />
                            Recent Policies
                        </h2>
                    </div>
                    {recentPolicies.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No policies yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentPolicies.map((p) => (
                                <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                                        <p className="text-xs text-slate-400">{p.createdBy?.name} · {p.category}</p>
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Requests */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <ClipboardList size={18} className="text-violet-500" />
                            Recent Requests
                        </h2>
                    </div>
                    {recentRequests.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No requests yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentRequests.map((r) => (
                                <div key={r._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-800 truncate">{r.formType}</p>
                                        <p className="text-xs text-slate-400">{r.facultyId?.name}</p>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Policy status breakdown */}
            <div className="card">
                <h2 className="font-semibold text-slate-900 mb-4">Policy Status Breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Draft', value: analytics.policies.draft, color: 'bg-slate-100 text-slate-700' },
                        { label: 'Pending', value: analytics.policies.pending, color: 'bg-amber-100 text-amber-700' },
                        { label: 'Approved', value: analytics.policies.approved, color: 'bg-emerald-100 text-emerald-700' },
                        { label: 'Rejected', value: analytics.policies.rejected, color: 'bg-red-100 text-red-700' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`${color} rounded-xl p-4 text-center`}>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-sm font-medium mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
