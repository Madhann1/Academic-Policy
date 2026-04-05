import { useState, useEffect } from 'react';
import { policyAPI } from '../../services/api';
import { CheckCircle, XCircle, Search, Filter, Eye, Archive } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PolicyApproval = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [action, setAction] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const res = await policyAPI.getAll({ search, status: statusFilter, category: categoryFilter });
            setPolicies(res.data.policies);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchPolicies(); }, [search, statusFilter, categoryFilter]);

    const openAction = (policy, act) => {
        setSelected(policy);
        setAction(act);
        setRemarks('');
        setShowActionModal(true);
    };

    const handleAction = async () => {
        setSubmitting(true);
        try {
            if (action === 'approve') {
                await policyAPI.approve(selected._id, { remarks });
                toast.success('Policy approved and published');
            } else if (action === 'reject') {
                if (!remarks.trim()) { toast.error('Rejection remarks are required'); setSubmitting(false); return; }
                await policyAPI.reject(selected._id, { remarks });
                toast.success('Policy rejected');
            } else if (action === 'archive') {
                await policyAPI.archive(selected._id);
                toast.success('Policy archived');
            }
            setShowActionModal(false);
            fetchPolicies();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setSubmitting(false); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Policy Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Review, approve, and manage all policies</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field sm:w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {['Draft', 'Pending', 'Approved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select className="input-field sm:w-40" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {['Academic', 'Examination', 'Curriculum', 'Discipline'].map((c) => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : policies.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No policies found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Title', 'Category', 'Created By', 'Status', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="table-header px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {policies.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="table-cell">
                                            <p className="font-medium text-slate-800">{p.title}</p>
                                            <p className="text-xs text-slate-400">v{p.version}</p>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">{p.category}</span>
                                        </td>
                                        <td className="table-cell text-slate-500">{p.createdBy?.name}</td>
                                        <td className="table-cell"><StatusBadge status={p.status} /></td>
                                        <td className="table-cell text-slate-500 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => { setSelected(p); setShowDetailModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View">
                                                    <Eye size={15} />
                                                </button>
                                                {p.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => openAction(p, 'approve')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve">
                                                            <CheckCircle size={15} />
                                                        </button>
                                                        <button onClick={() => openAction(p, 'reject')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Reject">
                                                            <XCircle size={15} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => openAction(p, 'archive')} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Archive">
                                                    <Archive size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Policy Details" size="lg">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg">{selected.title}</h3>
                                <p className="text-slate-500 text-sm">v{selected.version} · {selected.category}</p>
                            </div>
                            <StatusBadge status={selected.status} />
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-slate-700 text-sm leading-relaxed">{selected.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Created by:</span> <span className="font-medium">{selected.createdBy?.name}</span></div>
                            <div><span className="text-slate-500">Department:</span> <span className="font-medium">{selected.createdBy?.department || '—'}</span></div>
                            {selected.approvedBy && <div><span className="text-slate-500">Approved by:</span> <span className="font-medium">{selected.approvedBy?.name}</span></div>}
                            {selected.remarks && <div className="col-span-2"><span className="text-slate-500">Remarks:</span> <span className="text-slate-700"> {selected.remarks}</span></div>}
                        </div>
                        {selected.fileUrl && (
                            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 text-sm">
                                📄 Download PDF
                            </a>
                        )}
                    </div>
                )}
            </Modal>

            {/* Action Modal */}
            <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}
                title={action === 'approve' ? 'Approve Policy' : action === 'reject' ? 'Reject Policy' : 'Archive Policy'}>
                <div className="space-y-4">
                    <p className="text-slate-600 text-sm">
                        {action === 'approve' && `Approve "${selected?.title}"? It will be published and visible to students.`}
                        {action === 'reject' && `Reject "${selected?.title}"? Faculty will be notified with your remarks.`}
                        {action === 'archive' && `Archive "${selected?.title}"? It will be soft-deleted and hidden.`}
                    </p>
                    <div>
                        <label className="form-label">
                            {action === 'reject' ? 'Rejection Remarks *' : 'Remarks (optional)'}
                        </label>
                        <textarea className="input-field resize-none" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                            placeholder={action === 'reject' ? 'Explain why the policy is rejected...' : 'Optional notes...'} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowActionModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleAction} disabled={submitting}
                            className={`flex-1 ${action === 'approve' ? 'btn-success' : action === 'reject' ? 'btn-danger' : 'btn-secondary'}`}>
                            {submitting ? 'Processing...' : action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Archive'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PolicyApproval;
