import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Users, Stethoscope, Activity, CreditCard, TestTube, Pill, UserPlus } from 'lucide-react';
import clsx from 'clsx';

const BottomNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const navItems = [
        // Staff
        { name: 'Home', path: '/', icon: LayoutDashboard, roles: ['staff'] },
        { name: 'OPD', path: '/opd-entry', icon: UserPlus, roles: ['staff'] },
        { name: 'Beds', path: '/beds', icon: Activity, roles: ['staff'] },
        { name: 'Tests', path: '/tests', icon: Activity, roles: ['staff'] },

        // Patient
        { name: 'Home', path: '/patient-dashboard', icon: LayoutDashboard, roles: ['patient'] },
        { name: 'Book', path: '/book-appointment', icon: Calendar, roles: ['patient'] },
        { name: 'Appts', path: '/my-appointments', icon: Calendar, roles: ['patient'] },
        { name: 'Billing', path: '/patient-dashboard?tab=billing', icon: CreditCard, roles: ['patient'] },

        // Admin
        { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope, roles: ['admin'] },
        { name: 'Staff', path: '/admin/staff', icon: Users, roles: ['admin'] },
        { name: 'Beds', path: '/admin/beds', icon: Activity, roles: ['admin'] },
        { name: 'Tests', path: '/admin/tests', icon: Activity, roles: ['admin'] },

        // Doctor
        { name: 'Schedule', path: '/schedule', icon: Calendar, roles: ['doctor'] },
        { name: 'Patients', path: '/doctor/patients', icon: Users, roles: ['doctor'] },

        // Others
        { name: 'Billing', path: '/billing', icon: CreditCard, roles: ['billing'] },
        { name: 'Lab', path: '/testhandler', icon: TestTube, roles: ['testhandler'] },
        { name: 'Pharmacy', path: '/pharmacist', icon: Pill, roles: ['pharmacist'] }
    ];

    const normalizedRole = user.role ? user.role.toLowerCase() : '';
    const allowedItems = navItems.filter(item => item.roles.includes(normalizedRole)).slice(0, 5); // Limit to 5 for mobile

    if (allowedItems.length === 0) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-900 z-50 md:hidden flex items-center justify-around h-16 px-2">
            {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path.includes('?') && (location.pathname + location.search) === item.path);

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-300",
                            isActive ? "text-violet-400" : "text-slate-500"
                        )}
                    >
                        <div className={clsx(
                            "p-1.5 rounded-xl transition-all duration-300",
                            isActive && "bg-violet-400/10 scale-110"
                        )}>
                            <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-medium tracking-tight">
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
