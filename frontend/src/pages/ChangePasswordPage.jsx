import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePasswordPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.newPassword !== form.confirmPassword) {
            return setError('New passwords do not match');
        }
        if (form.newPassword.length < 6) {
            return setError('New password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            updateUser({ firstLogin: false });
            toast.success('Password changed successfully!');
            const routes = { admin: '/admin/dashboard', faculty: '/faculty/dashboard', student: '/student/dashboard' };
            navigate(routes[user?.role] || '/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 border border-white/20 backdrop-blur-sm">
                        <ShieldCheck size={30} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Change Your Password</h1>
                    {user?.firstLogin && (
                        <p className="text-violet-200 mt-2 text-sm">
                            For security, you must set a new password before continuing.
                        </p>
                    )}
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-5 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {[
                            { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                            { name: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
                            { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                        ].map(({ name, label, placeholder }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-violet-100 mb-1.5">{label}</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300" />
                                    <input
                                        type="password"
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        required
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-violet-300 rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-violet-900 font-semibold py-3 rounded-lg hover:bg-violet-50 transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-60 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-violet-300 border-t-violet-700 rounded-full loading-spinner" />
                                    Updating...
                                </span>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
