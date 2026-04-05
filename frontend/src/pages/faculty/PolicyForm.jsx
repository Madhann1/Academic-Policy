import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { policyAPI } from '../../services/api';
import { AlertCircle, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Examination', 'Curriculum', 'Discipline'];

const PolicyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ title: '', description: '', category: 'Academic' });
    const [file, setFile] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            policyAPI.getById(id)
                .then((res) => {
                    const p = res.data.policy;
                    setForm({ title: p.title, description: p.description, category: p.category });
                    setExistingFile(p.fileUrl);
                })
                .catch(() => { toast.error('Failed to load policy'); navigate('/faculty/policies'); })
                .finally(() => setFetching(false));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description);
        data.append('category', form.category);
        if (file) data.append('file', file);

        try {
            if (isEdit) {
                await policyAPI.update(id, data);
                toast.success('Policy updated');
            } else {
                await policyAPI.create(data);
                toast.success('Policy created as Draft');
            }
            navigate('/faculty/policies');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save policy');
        } finally { setLoading(false); }
    };

    if (fetching) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full loading-spinner" />
        </div>
    );

    return (
        <div className="flex-1 p-6 fade-in">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">{isEdit ? 'Edit Policy' : 'Create New Policy'}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {isEdit ? 'Update your policy details' : 'Draft a new academic policy for approval'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="form-label">Policy Title *</label>
                        <input
                            className="input-field"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Academic Integrity Policy"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Category *</label>
                        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Description *</label>
                        <textarea
                            className="input-field resize-none"
                            rows={8}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the policy in detail..."
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Attach PDF (optional)</label>
                        {existingFile && !file && (
                            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm mb-2">
                                📄 <a href={existingFile} target="_blank" rel="noopener noreferrer" className="hover:underline">Current PDF attached</a>
                                <button type="button" onClick={() => setExistingFile(null)} className="ml-auto"><X size={14} /></button>
                            </div>
                        )}
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                            <Upload size={20} className="text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">
                                {file ? file.name : 'Click to upload PDF (max 10MB)'}
                            </span>
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/faculty/policies')} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Saving...' : isEdit ? 'Update Policy' : 'Create Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PolicyForm;
