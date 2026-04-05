import { useState, useEffect } from 'react';
import { policyAPI } from '../../services/api';
import { Plus, Edit2, Send, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyPolicies = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await policyAPI.getAll({ search, status: statusFilter });
            setPolicies(res.data.policies);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [search, statusFilter]);

    const handleSubmit = async (id) => {
        setSubmitting(true);
        try {
            await policyAPI.submit(id);
            toast.success('Policy submitted for approval');
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submit failed');
        } finally { setSubmitting(false); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Policies</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage your policy submissions</p>
                </div>
                <button onClick={() => navigate('/faculty/policies/new')} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Policy
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field sm:w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {['Draft', 'Pending', 'Approved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                </select>
            </div>

            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : policies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 mb-3">No policies found</p>
                        <button onClick={() => navigate('/faculty/policies/new')} className="btn-primary text-sm">Create your first policy</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Title', 'Category', 'Status', 'Version', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="table-header px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {policies.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelected(p); setShowDetail(true); }}>
                                        <td className="table-cell font-medium">{p.title}</td>
                                        <td className="table-cell">
                                            <span className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-md font-medium">{p.category}</span>
                                        </td>
                                        <td className="table-cell" onClick={(e) => e.stopPropagation()}><StatusBadge status={p.status} /></td>
                                        <td className="table-cell text-center font-mono">v{p.version}</td>
                                        <td className="table-cell text-slate-500 whitespace-nowrap">{formatDate(p.updatedAt)}</td>
                                        <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1.5">
                                                {(p.status === 'Draft' || p.status === 'Rejected') && (
                                                    <button onClick={() => navigate(`/faculty/policies/edit/${p._id}`)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Edit">
                                                        <Edit2 size={15} />
                                                    </button>
                                                )}
                                                {p.status === 'Draft' && (
                                                    <button onClick={() => handleSubmit(p._id)} disabled={submitting}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Submit for approval">
                                                        <Send size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Policy Detail Modal */}
            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Policy Details" size="lg">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg">{selected.title}</h3>
                                <p className="text-slate-500 text-sm">{selected.category} · v{selected.version}</p>
                            </div>
                            <StatusBadge status={selected.status} />
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-slate-700 text-sm leading-relaxed">{selected.description}</p>
                        </div>
                        {selected.remarks && (
                            <div className={`rounded-xl p-3 text-sm ${selected.status === 'Rejected' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                                <strong>Remarks:</strong> {selected.remarks}
                            </div>
                        )}
                        {selected.fileUrl && (
                            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 text-sm">
                                📄 Download PDF
                            </a>
                        )}
                        {(selected.status === 'Draft' || selected.status === 'Rejected') && (
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDetail(false); navigate(`/faculty/policies/edit/${selected._id}`); }}
                                    className="btn-secondary flex items-center gap-2">
                                    <Edit2 size={15} /> Edit Policy
                                </button>
                                {selected.status === 'Draft' && (
                                    <button onClick={() => { handleSubmit(selected._id); setShowDetail(false); }}
                                        className="btn-primary flex items-center gap-2">
                                        <Send size={15} /> Submit for Approval
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyPolicies;
