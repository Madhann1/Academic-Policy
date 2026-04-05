import { useState, useEffect } from 'react';
import { requestAPI } from '../../services/api';
import { CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceRequestAdmin = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [selected, setSelected] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [action, setAction] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await requestAPI.getAll({ status: statusFilter });
            setRequests(res.data.requests);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchRequests(); }, [statusFilter]);

    const openAction = (req, act) => {
        setSelected(req);
        setAction(act);
        setRemarks('');
        setShowActionModal(true);
    };

    const handleAction = async () => {
        if (action === 'Rejected' && !remarks.trim()) {
            toast.error('Remarks required for rejection');
            return;
        }
        setSubmitting(true);
        try {
            await requestAPI.updateStatus(selected._id, { status: action, remarks });
            toast.success(`Request ${action.toLowerCase()}`);
            setShowActionModal(false);
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setSubmitting(false); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const renderDetails = (req) => {
        const d = req.details || {};
        const entries = Object.entries(d).filter(([, v]) => v);
        return (
            <div className="grid grid-cols-2 gap-3 mt-3 bg-slate-50 rounded-xl p-4">
                {entries.map(([key, val]) => (
                    <div key={key}>
                        <p className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm font-medium text-slate-700">{val instanceof Date ? formatDate(val) : String(val)}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Service Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage faculty service request forms</p>
                </div>
                <select className="input-field w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No requests found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Form Type', 'Faculty', 'Department', 'Status', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="table-header px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="table-cell font-medium">{r.formType}</td>
                                        <td className="table-cell">{r.facultyId?.name}</td>
                                        <td className="table-cell text-slate-500">{r.facultyId?.department || '—'}</td>
                                        <td className="table-cell"><StatusBadge status={r.status} /></td>
                                        <td className="table-cell text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => { setSelected(r); setShowDetailModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View">
                                                    <Eye size={15} />
                                                </button>
                                                {r.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => openAction(r, 'Approved')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve">
                                                            <CheckCircle size={15} />
                                                        </button>
                                                        <button onClick={() => openAction(r, 'Rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Reject">
                                                            <XCircle size={15} />
                                                        </button>
                                                    </>
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

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Request Details" size="lg">
                {selected && (
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">{selected.formType}</h3>
                                <p className="text-slate-500 text-sm">{selected.facultyId?.name} · {selected.facultyId?.department}</p>
                            </div>
                            <StatusBadge status={selected.status} />
                        </div>
                        {renderDetails(selected)}
                        {selected.remarks && (
                            <div className="bg-amber-50 text-amber-800 rounded-xl p-3 text-sm">
                                <strong>Remarks:</strong> {selected.remarks}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Action Modal */}
            <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title={`${action} Request`}>
                <div className="space-y-4">
                    <p className="text-slate-600 text-sm">{action} the request "{selected?.formType}"?</p>
                    <div>
                        <label className="form-label">{action === 'Rejected' ? 'Remarks *' : 'Remarks (optional)'}</label>
                        <textarea className="input-field resize-none" rows={3} value={remarks}
                            onChange={(e) => setRemarks(e.target.value)} placeholder="Add notes..." />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowActionModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleAction} disabled={submitting}
                            className={`flex-1 ${action === 'Approved' ? 'btn-success' : 'btn-danger'}`}>
                            {submitting ? 'Processing...' : action}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ServiceRequestAdmin;
