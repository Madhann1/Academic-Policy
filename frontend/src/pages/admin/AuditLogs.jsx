import { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await auditAPI.getLogs({ page, limit: 20 });
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [page]);

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const actionColor = (action) => {
        if (action.toLowerCase().includes('approv')) return 'text-emerald-600 bg-emerald-50';
        if (action.toLowerCase().includes('reject')) return 'text-red-600 bg-red-50';
        if (action.toLowerCase().includes('creat')) return 'text-indigo-600 bg-indigo-50';
        if (action.toLowerCase().includes('archiv')) return 'text-orange-600 bg-orange-50';
        return 'text-slate-600 bg-slate-50';
    };

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p className="text-slate-500 text-sm mt-1">{total} total actions recorded</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm">
                    <ScrollText size={16} />
                    System Log
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No audit logs found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {['Action', 'Performed By', 'Timestamp'].map((h) => (
                                            <th key={h} className="table-header px-4 py-3">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="table-cell">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${actionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <p className="font-medium text-slate-800">{log.performedBy?.name || '—'}</p>
                                                <p className="text-xs text-slate-400 capitalize">{log.performedBy?.role}</p>
                                            </td>
                                            <td className="table-cell text-slate-500 whitespace-nowrap">
                                                {formatDateTime(log.timestamp)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                                <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
