import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Stethoscope, 
    BedDouble, 
    ArrowRight, 
    ShieldCheck, 
    TestTube2, 
    Briefcase,
    LayoutDashboard,
    Activity,
    ChevronRight,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const modules = [
        {
            title: 'Doctors',
            description: 'Registry & Scheduling',
            icon: Stethoscope,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            path: '/admin/doctors',
            stats: '24 Active'
        },
        {
            title: 'Medical Staff',
            description: 'Personnel Management',
            icon: Users,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            path: '/admin/staff',
            stats: '156 Total'
        },
        {
            title: 'Bed Inventory',
            description: 'Wards & Occupancy',
            icon: BedDouble,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            path: '/admin/beds',
            stats: '85% Full'
        },
        {
            title: 'Equipment',
            description: 'Assets & Maintenance',
            icon: Briefcase,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            path: '/admin/equipment',
            stats: '12 In Repair'
        },
        {
            title: 'Diagnostics',
            description: 'Test Definitions',
            icon: TestTube2,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
            path: '/admin/tests',
            stats: '42 Types'
        },
        {
            title: 'Access Roles',
            description: 'Permission Control',
            icon: ShieldCheck,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            path: '/admin/roles',
            stats: 'Admin Only'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Brand Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
                            <LayoutDashboard size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">System Admin</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <Activity size={14} className="text-emerald-500" />
                                Hospital Resource Command Center
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/5 p-2 rounded-2xl">
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                            System Live
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white">
                            <Users size={18} />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Revenue', value: '$12.4k', trend: '+12%', icon: TrendingUp, color: 'text-emerald-400' },
                        { label: 'Patient Inflow', value: '142', trend: '+5%', icon: Users, color: 'text-blue-400' },
                        { label: 'Urgent Tasks', value: '18', trend: 'High', icon: AlertCircle, color: 'text-rose-400' },
                        { label: 'App Uptime', value: '99.9%', trend: 'Stable', icon: ShieldCheck, color: 'text-cyan-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                                <stat.icon size={14} className={stat.color} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                <span className={`text-[10px] font-bold ${stat.trend.includes('+') ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(module.path)}
                            className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl cursor-pointer hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 overflow-hidden active:scale-[0.98]"
                        >
                            {/* Glow Effect */}
                            <div className={`absolute -right-12 -top-12 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity ${module.bg.replace('/10', '/30')}`} />
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 rounded-2xl ${module.bg} ${module.color} border ${module.border} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <module.icon size={28} />
                                </div>
                                <div className="text-slate-700 group-hover:text-white transition-colors duration-300 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {module.title}
                                    </h3>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${module.border} ${module.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {module.stats}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm">
                                    {module.description}
                                </p>
                            </div>

                            {/* Decorative Line */}
                            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 opacity-20`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
