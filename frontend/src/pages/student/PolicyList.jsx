import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { policyAPI } from '../../services/api';
import { Search, Filter, FileDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const catColors = {
    Academic: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Examination: 'bg-violet-50 text-violet-700 border-violet-200',
    Curriculum: 'bg-sky-50 text-sky-700 border-sky-200',
    Discipline: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PolicyList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await policyAPI.getAll({ search, category });
            setPolicies(res.data.policies);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [search, category]);

    useEffect(() => {
        if (category) setSearchParams({ category });
        else setSearchParams({});
    }, [category]);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div>
                <h1 className="page-title">Academic Policies</h1>
                <p className="text-slate-500 text-sm mt-1">{policies.length} approved policies available</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search by title or description..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field sm:w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {['Academic', 'Examination', 'Curriculum', 'Discipline'].map((c) => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setCategory('')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!category ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
                    All
                </button>
                {['Academic', 'Examination', 'Curriculum', 'Discipline'].map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Policies Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><LoadingSpinner /></div>
            ) : policies.length === 0 ? (
                <div className="text-center py-16">
                    <Search size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">No policies found matching your search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map((p) => (
                        <div key={p._id} onClick={() => { setSelected(p); setShowDetail(true); }}
                            className="card hover:shadow-md hover:border-indigo-100 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catColors[p.category]}`}>
                                    {p.category}
                                </span>
                                <span className="text-xs text-slate-400">v{p.version}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">{p.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{p.description}</p>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                <span className="text-xs text-slate-400">{formatDate(p.approvedAt || p.createdAt)}</span>
                                {p.fileUrl && (
                                    <span className="text-xs text-indigo-600 flex items-center gap-1">
                                        <FileDown size={12} /> PDF
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Policy Detail Modal */}
            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Policy Details" size="lg">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex-shrink-0 ${catColors[selected.category]}`}>
                                {selected.category}
                            </span>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg">{selected.title}</h3>
                                <p className="text-slate-500 text-sm">Version {selected.version}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-slate-700 text-sm leading-relaxed">{selected.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-400 text-xs block">Published by</span>
                                <span className="font-medium">{selected.approvedBy?.name || '—'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs block">Date</span>
                                <span className="font-medium">
                                    {new Date(selected.approvedAt || selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        {selected.fileUrl && (
                            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="btn-primary inline-flex items-center gap-2 text-sm">
                                <FileDown size={16} /> Download PDF
                            </a>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PolicyList;
