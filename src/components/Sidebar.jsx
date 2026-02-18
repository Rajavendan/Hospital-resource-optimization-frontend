import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LayoutDashboard, CalendarPlus, Calendar, Users, User, BedDouble, Stethoscope, Activity, FileText, Settings, Clipboard, UserPlus, CreditCard, TestTube, Pill, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import clsx from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [nextVideoCall, setNextVideoCall] = useState(null);

    useEffect(() => {
        if (user && user.role === 'patient') {
            fetchNextCall();
        }
    }, [user, location.pathname]); // Refresh on route change essentially

    const fetchNextCall = async () => {
        try {
            const res = await api.get('/api/patient/appointments/upcoming');
            // Filter video calls
            const videoCalls = res.data.filter(apt =>
                (apt.consultationType === 'VIDEO' || apt.meetingLink) &&
                apt.status !== 'CANCELLED' &&
                apt.status !== 'COMPLETED'
            );

            // Find the closest one
            // We assume the backend returns them sorted or we sort them
            // Backend "upcoming" typically means future, but we also want to catch "today's" active ones.
            // Let's just pick the first one that is either active (window) or future.

            const now = new Date();
            const relevant = videoCalls.find(apt => {
                // Convert backend array/string date
                let dateStr = apt.date;
                if (Array.isArray(apt.date)) dateStr = `${apt.date[0]}-${String(apt.date[1]).padStart(2, '0')}-${String(apt.date[2]).padStart(2, '0')}`;
                let timeStr = apt.time;
                if (Array.isArray(apt.time)) timeStr = `${String(apt.time[0]).padStart(2, '0')}:${String(apt.time[1] || 0).padStart(2, '0')}`;

                const start = new Date(`${dateStr}T${timeStr}`);
                const diffMins = (start - now) / 60000;

                // Show if it's within 24h window (past) OR any time in future
                // Actually, "Next Call" implies the immediate next one.
                // If diffMins > -1440, it is valid to handle.
                return diffMins > -1440;
            });

            setNextVideoCall(relevant || null);

        } catch (e) {
            console.error("Failed to check calls", e);
        }
    };

    if (!user) return null;

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['staff'] },
        { name: 'OPD Entry', path: '/opd-entry', icon: UserPlus, roles: ['staff'] },
        { name: 'My Schedule', path: '/schedule', icon: Calendar, roles: ['doctor'] },
        { name: 'Book Appointment', path: '/book-appointment', icon: CalendarPlus, roles: ['patient'] },
        { name: 'My Appointments', path: '/my-appointments', icon: Calendar, roles: ['patient'] },
        { name: 'Visit History', path: '/patient-dashboard?tab=visits', icon: Clipboard, roles: ['patient'] },
        { name: 'Reports & Docs', path: '/patient-dashboard?tab=reports', icon: FileText, roles: ['patient'] },
        { name: 'Prescriptions', path: '/patient-dashboard?tab=prescriptions', icon: Calendar, roles: ['patient'] },
        { name: 'Billing', path: '/patient-dashboard?tab=billing', icon: CreditCard, roles: ['patient'] },
        { name: 'Admissions', path: '/patient-dashboard?tab=admissions', icon: BedDouble, roles: ['patient'] },
        { name: 'Notifications', path: '/patient-dashboard?tab=notifications', icon: Activity, roles: ['patient'] },

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
        { name: 'Lab Dashboard', path: '/testhandler', icon: TestTube, roles: ['testhandler'] },
        { name: 'Pharmacy', path: '/pharmacist', icon: Pill, roles: ['pharmacist'] }
    ];

    const normalizedRole = user.role ? user.role.toLowerCase() : '';
    const allowedLinks = links.filter(link => link.roles.includes(normalizedRole));

    return (
        <div className={clsx(
            "h-screen bg-zinc-950 text-slate-200 flex flex-col fixed left-0 top-0 border-r border-zinc-900 z-50 transition-all duration-300 ease-in-out",
            isOpen ? "w-64" : "w-20"
        )}>
            <div className={clsx("h-16 flex items-center justify-between px-4 border-b border-zinc-900/50", !isOpen && "justify-center")}>
                {/* Title Area - Hidden when collapsed */}
                {isOpen && (
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="font-bold text-violet-400 whitespace-nowrap text-lg">
                            Smart Hospital
                        </h1>
                        <p className="text-[10px] text-slate-500 whitespace-nowrap tracking-wide uppercase">
                            Resource Optimization
                        </p>
                    </div>
                )}

                {/* Hamburger Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} />
                </button>
            </div>

            <div className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {/* Next Video Call Section (Patient Only) */}
                {normalizedRole === 'patient' && isOpen && (
                    <div className="mb-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <Video size={14} className="text-violet-500" />
                            Next Video Call
                        </div>
                        {nextVideoCall ? (
                            <div>
                                <div className="text-sm font-bold text-white mb-1">Dr. {nextVideoCall.doctor?.user?.name || 'Doctor'}</div>
                                <div className="text-xs text-slate-500 mb-2">
                                    {new Date(nextVideoCall.date).toLocaleDateString()} • {nextVideoCall.time}
                                </div>
                                <a
                                    href={`/video-consultation/${nextVideoCall.id}?link=${encodeURIComponent(nextVideoCall.meetingLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold transition-all animate-pulse"
                                >
                                    Join Now
                                </a>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500 italic">
                                No call scheduled
                            </div>
                        )}
                    </div>
                )}

                {allowedLinks.map((link) => {
                    const Icon = link.icon;
                    const currentPath = link.path.includes('?')
                        ? location.pathname + location.search
                        : location.pathname;
                    const isActive = currentPath === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative",
                                isActive
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                                    : "text-slate-400 hover:bg-zinc-900 hover:text-white",
                                !isOpen && "justify-center"
                            )}
                            title={!isOpen ? link.name : undefined}
                        >
                            <Icon size={20} className="min-w-[20px]" />
                            <span className={clsx(
                                "font-medium whitespace-nowrap transition-all duration-300",
                                isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 w-0 hidden"
                            )}>
                                {link.name}
                            </span>

                            {/* Tooltip for collapsed mode */}
                            {!isOpen && (
                                <div className="absolute left-full ml-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-[100]">
                                    {link.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-900 overflow-hidden">
                <div className={clsx("flex items-center gap-3", !isOpen && "justify-center")}>
                    <div className="min-w-[40px] w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    {isOpen && (
                        <div className="whitespace-nowrap">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
