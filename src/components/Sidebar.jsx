import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    Calendar,
    Users,
    User,
    BedDouble,
    Stethoscope,
    Activity,
    FileText,
    Settings,
    Clipboard,
    UserPlus,
    CreditCard,
    TestTube
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['staff'] },
        { name: 'OPD Entry', path: '/opd-entry', icon: UserPlus, roles: ['staff'] },
        { name: 'My Schedule', path: '/schedule', icon: Calendar, roles: ['doctor'] },
        { name: 'My Patients', path: '/doctor/patients', icon: Users, roles: ['doctor'] },
        { name: 'Book Appointment', path: '/book-appointment', icon: CalendarPlus, roles: ['patient'] },
        { name: 'My Appointments', path: '/my-appointments', icon: Calendar, roles: ['patient'] },
        { name: 'Admission', path: '/admission', icon: FileText, roles: ['staff'] },
        { name: 'Bed Management', path: '/beds', icon: BedDouble, roles: ['staff'] },
        { name: 'Equipment', path: '/equipment', icon: Stethoscope, roles: ['staff'] },
        { name: 'Test Management', path: '/tests', icon: Activity, roles: ['staff'] },
        { name: 'Dashboard', path: '/reports', icon: FileText, roles: ['admin', 'doctor'] },
        { name: 'Doctor Management', path: '/admin/doctors', icon: FileText, roles: ['admin'] },
        { name: 'Staff Management', path: '/admin/staff', icon: FileText, roles: ['admin'] },
        { name: 'Bed Management', path: '/admin/beds', icon: FileText, roles: ['admin'] },
        { name: 'Equipment Management', path: '/admin/equipment', icon: FileText, roles: ['admin'] },
        { name: 'Test Management', path: '/admin/tests', icon: FileText, roles: ['admin'] },
        { name: 'Billing  Test Handler', path: '/admin/roles', icon: Users, roles: ['admin'] },
        { name: 'Billing', path: '/billing', icon: CreditCard, roles: ['billing'] },
        { name: 'Lab Dashboard', path: '/testhandler', icon: TestTube, roles: ['testhandler'] }
    ];

    const allowedLinks = links.filter(link => link.roles.includes(user.role));

    return (
        <div className="h-screen w-64 bg-zinc-950 text-slate-200 flex flex-col fixed left-0 top-0 border-r border-zinc-900">
            <div className="p-6">
                <h1 className="text-xl font-bold text-violet-400">Smart Hospital</h1>
                <p className="text-xs text-slate-500 mt-1">Resource Optimization</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {allowedLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                                    : "text-slate-400 hover:bg-zinc-900 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
