import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { FileText, Clock, CheckCircle, XCircle, ClipboardList, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color, textColor }) => (
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

const FacultyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.getFaculty()
            .then((res) => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-slate-500 text-sm mt-1">{user?.department || 'Faculty'} Portal</p>
                </div>
                <button onClick={() => navigate('/faculty/policies/new')} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Policy
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Draft" value={data?.analytics.draft ?? 0} icon={FileText} color="bg-slate-400" />
                <StatCard title="Pending" value={data?.analytics.pending ?? 0} icon={Clock} color="bg-amber-500" />
                <StatCard title="Approved" value={data?.analytics.approved ?? 0} icon={CheckCircle} color="bg-emerald-500" />
                <StatCard title="Rejected" value={data?.analytics.rejected ?? 0} icon={XCircle} color="bg-red-500" />
            </div>

            {/* Recent Policies */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                        <FileText size={18} className="text-violet-500" />
                        Recent Policies
                    </h2>
                    <button onClick={() => navigate('/faculty/policies')} className="text-sm text-indigo-600 hover:underline">
                        View all
                    </button>
                </div>
                {data?.recentPolicies.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText size={32} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No policies yet. Create your first policy!</p>
                        <button onClick={() => navigate('/faculty/policies/new')} className="btn-primary mt-3 text-sm">
                            Create Policy
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.recentPolicies.map((p) => (
                            <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{p.title}</p>
                                    <p className="text-xs text-slate-400">{p.category} · v{p.version}</p>
                                </div>
                                <StatusBadge status={p.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Submit Transport Request', to: '/faculty/requests/new?type=Transport+Requisition', icon: '🚌' },
                        { label: 'Annexure 2A Request', to: '/faculty/requests/new?type=Annexure+2A+-+Subject+Expert+Recommendation', icon: '📄' },
                        { label: 'Guest Accommodation', to: '/faculty/requests/new?type=Guest+Accommodation', icon: '🏨' },
                    ].map(({ label, to, icon }) => (
                        <button key={label} onClick={() => navigate(to)}
                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left">
                            <span className="text-2xl">{icon}</span>
                            <span className="text-sm font-medium text-slate-700">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
