import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Plus, Search, UserCheck, UserX, Edit2, X, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLE_COLORS = { admin: 'bg-indigo-100 text-indigo-700', faculty: 'bg-violet-100 text-violet-700', student: 'bg-sky-100 text-sky-700' };

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'faculty', department: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await userAPI.getAll({ search, role: roleFilter });
            setUsers(res.data.users);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const openCreate = () => {
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'faculty', department: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditUser(u);
        setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '' });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (editUser) {
                await userAPI.update(editUser._id, { name: form.name, department: form.department });
                toast.success('User updated');
            } else {
                await userAPI.create(form);
                toast.success('User created successfully');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally { setSubmitting(false); }
    };

    const handleDeactivate = async (id, name) => {
        if (!window.confirm(`Deactivate user "${name}"? They will lose access.`)) return;
        try {
            await userAPI.delete(id);
            toast.success('User deactivated');
            fetchUsers();
        } catch { toast.error('Failed to deactivate user'); }
    };

    return (
        <div className="flex-1 p-6 space-y-5 fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage faculty and student accounts</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> Create User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search by name or email..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                </select>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className="table-header px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="table-cell font-medium">{u.name}</td>
                                        <td className="table-cell text-slate-500">{u.email}</td>
                                        <td className="table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role]}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="table-cell text-slate-500">{u.department || '—'}</td>
                                        <td className="table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors" title="Edit">
                                                    <Edit2 size={15} />
                                                </button>
                                                {u.isActive && (
                                                    <button onClick={() => handleDeactivate(u._id, u.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Deactivate">
                                                        <UserX size={15} />
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

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Create New User'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    <div>
                        <label className="form-label">Full Name *</label>
                        <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    {!editUser && (
                        <>
                            <div>
                                <label className="form-label">Email Address *</label>
                                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Temporary Password *</label>
                                <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                            </div>
                            <div>
                                <label className="form-label">Role *</label>
                                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                    <option value="faculty">Faculty</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="form-label">Department</label>
                        <input className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
