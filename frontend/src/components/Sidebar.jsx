import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, FileText, CheckSquare, ClipboardList,
    ScrollText, BookOpen, Search, LogOut, GraduationCap, Menu, X,
    Settings, ShieldCheck, BookMarked
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/policies', label: 'Policy Approval', icon: CheckSquare },
    { to: '/admin/requests', label: 'Service Requests', icon: ClipboardList },
    { to: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
    { to: '/admin/academic', label: 'Academic Settings', icon: Settings },
];

const hodLinks = [
    { to: '/hod/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hod/policies', label: 'Policy Review', icon: CheckSquare },
    { to: '/hod/academic', label: 'Academic Info', icon: BookMarked },
];

const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/policies', label: 'My Policies', icon: FileText },
    { to: '/faculty/requests', label: 'My Requests', icon: ClipboardList },
];

const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/policies', label: 'Browse Policies', icon: BookOpen },
];

const roleLinks = { admin: adminLinks, hod: hodLinks, faculty: facultyLinks, student: studentLinks };
const roleColors = {
    admin: 'from-indigo-900 to-indigo-800',
    hod: 'from-teal-900 to-teal-800',
    faculty: 'from-violet-900 to-violet-800',
    student: 'from-sky-900 to-sky-800',
};
const roleLabels = { admin: 'Administrator', hod: 'Head of Department', faculty: 'Faculty', student: 'Student' };

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const links = roleLinks[user?.role] || [];
    const gradientClass = roleColors[user?.role] || 'from-indigo-900 to-indigo-800';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className={`flex flex-col h-full bg-gradient-to-b ${gradientClass} text-white`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                    <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm leading-tight">APM System</p>
                    <p className="text-xs text-white/60 leading-tight">{roleLabels[user?.role]}</p>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="bg-white/10 rounded-xl px-3 py-3">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                    {user?.department && (
                        <p className="text-xs text-white/50 mt-0.5 truncate">{user?.department}</p>
                    )}
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link-active' : 'text-white/70 hover:text-white hover:bg-white/10'}`
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="sidebar-link text-white/70 hover:text-white hover:bg-white/10 w-full"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-indigo-700 text-white p-2 rounded-lg shadow-lg"
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-shrink-0">
                <div className="w-full">
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
