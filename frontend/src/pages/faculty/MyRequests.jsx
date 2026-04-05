import { useState, useEffect } from 'react';
import { requestAPI } from '../../services/api';
import { Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        requestAPI.getAll()
            .then((res) => setRequests(res.data.requests))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const renderDetails = (req) => {
        const d = req.details || {};
        return Object.entries(d)
            .filter(([, v]) => v)
            .map(([key, val]) => (
                <div key={key}>
                    <p className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm font-medium text-slate-700">{String(val)}</p>
                </div>
            ));
    };

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your service request status</p>
                </div>
                <button onClick={() => navigate('/faculty/requests/new')} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Request
                </button>
            </div>

            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 mb-3">No requests submitted yet</p>
                        <button onClick={() => navigate('/faculty/requests/new')} className="btn-primary text-sm">
                            Submit First Request
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Form Type', 'Status', 'Remarks', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="table-header px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="table-cell font-medium">{r.formType}</td>
                                        <td className="table-cell"><StatusBadge status={r.status} /></td>
                                        <td className="table-cell text-slate-500 max-w-[200px] truncate">{r.remarks || '—'}</td>
                                        <td className="table-cell text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                        <td className="table-cell">
                                            <button onClick={() => { setSelected(r); setShowDetail(true); }}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Request Details" size="lg">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-slate-900">{selected.formType}</h3>
                            <StatusBadge status={selected.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
                            {renderDetails(selected)}
                        </div>
                        {selected.remarks && (
                            <div className={`rounded-xl p-3 text-sm ${selected.status === 'Rejected' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                <strong>Admin Remarks:</strong> {selected.remarks}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyRequests;
