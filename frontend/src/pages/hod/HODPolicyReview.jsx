import { useState, useEffect } from 'react';
import { policyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckSquare, CheckCircle, XCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const HODPolicyReview = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [expanded, setExpanded] = useState(null);
    const [actionPolicy, setActionPolicy] = useState(null); // { policy, type: 'approve'|'reject' }
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPolicies = () => {
        setLoading(true);
        policyAPI.getAll()
            .then((res) => setPolicies(res.data.policies || []))
            .catch(() => toast.error('Failed to load policies'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const filtered = policies.filter((p) => {
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        const matchSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.createdBy?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const openAction = (policy, type) => {
        setActionPolicy({ policy, type });
        setRemarks('');
    };

    const handleSubmitAction = async () => {
        if (!actionPolicy) return;
        const { policy, type } = actionPolicy;
        if (type === 'reject' && !remarks.trim()) {
            toast.error('Rejection remarks are required');
            return;
        }
        setSubmitting(true);
        try {
            if (type === 'approve') {
                await policyAPI.approve(policy._id, { remarks });
                toast.success(`Policy "${policy.title}" approved`);
            } else {
                await policyAPI.reject(policy._id, { remarks });
                toast.success(`Policy "${policy.title}" rejected`);
            }
            setActionPolicy(null);
            fetchPolicies();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <CheckSquare size={22} className="text-indigo-600" />
                        Policy Review
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Review, approve, or reject submitted academic policies</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Policy List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <LoadingSpinner />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <CheckCircle size={36} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No policies found for the selected filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((p) => (
                        <div key={p._id} className="card">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {p.category}
                                        </span>
                                        <StatusBadge status={p.status} />
                                        <span className="text-xs text-slate-400">v{p.version}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800">{p.title}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        By {p.createdBy?.name} · {new Date(p.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                                    className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-1"
                                >
                                    {expanded === p._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>

                            {expanded === p._id && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                    <p className="text-sm text-slate-600">{p.description}</p>
                                    {p.fileUrl && (
                                        <a
                                            href={p.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-xs text-indigo-600 hover:underline"
                                        >
                                            📄 View Attached Document
                                        </a>
                                    )}
                                    {p.status === 'Pending' && (
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => openAction(p, 'approve')}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => openAction(p, 'reject')}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    )}
                                    {p.remarks && (
                                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                            <span className="font-medium text-slate-600">Remarks:</span> {p.remarks}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Approve / Reject Modal */}
            <Modal
                isOpen={!!actionPolicy}
                onClose={() => setActionPolicy(null)}
                title={actionPolicy?.type === 'approve' ? '✅ Approve Policy' : '❌ Reject Policy'}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        {actionPolicy?.type === 'approve'
                            ? 'Are you sure you want to approve this policy?'
                            : 'Please provide a reason for rejection.'}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">"{actionPolicy?.policy?.title}"</p>
                    <textarea
                        rows={3}
                        placeholder={
                            actionPolicy?.type === 'approve'
                                ? 'Optional remarks...'
                                : 'Rejection reason (required)...'
                        }
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setActionPolicy(null)}
                            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitAction}
                            disabled={submitting}
                            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60 ${
                                actionPolicy?.type === 'approve'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                        >
                            {submitting ? 'Processing...' : actionPolicy?.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HODPolicyReview;
