import { useState, useEffect } from 'react';
import { policyAPI } from '../../services/api';
import { LayoutDashboard, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
            </div>
        </div>
    </div>
);

const HODDashboard = () => {
    const { user } = useAuth();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        policyAPI.getAll()
            .then((res) => setPolicies(res.data.policies || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const pending = policies.filter((p) => p.status === 'Pending').length;
    const approved = policies.filter((p) => p.status === 'Approved').length;
    const rejected = policies.filter((p) => p.status === 'Rejected').length;
    const total = policies.length;

    const recentPending = policies.filter((p) => p.status === 'Pending').slice(0, 5);

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">HOD Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Welcome back, {user?.name?.split(' ')[0]}. Review and manage submitted policies.
                    </p>
                </div>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Policies" value={total} icon={FileText} color="bg-indigo-500" />
                        <StatCard title="Awaiting Review" value={pending} icon={Clock} color="bg-amber-500" />
                        <StatCard title="Approved" value={approved} icon={CheckCircle} color="bg-emerald-500" />
                        <StatCard title="Rejected" value={rejected} icon={XCircle} color="bg-rose-500" />
                    </div>

                    {/* Pending Policies */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={18} className="text-amber-500" />
                            <h2 className="font-semibold text-slate-900">Policies Awaiting Your Review</h2>
                        </div>

                        {recentPending.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle size={36} className="text-emerald-400 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">All caught up! No pending policies.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPending.map((p) => (
                                    <div key={p._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {p.createdBy?.name} · {p.category}
                                            </p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Policy Breakdown */}
                    <div className="card">
                        <h2 className="font-semibold text-slate-900 mb-4">Policy Status Overview</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Total', value: total, color: 'bg-indigo-100 text-indigo-700' },
                                { label: 'Pending', value: pending, color: 'bg-amber-100 text-amber-700' },
                                { label: 'Approved', value: approved, color: 'bg-emerald-100 text-emerald-700' },
                                { label: 'Rejected', value: rejected, color: 'bg-rose-100 text-rose-700' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className={`${color} rounded-xl p-4 text-center`}>
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-sm font-medium mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HODDashboard;
