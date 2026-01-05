import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, BedDouble, ArrowRight, ShieldCheck ,WashingMachine,TestTube2} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const modules = [
        {
            title: 'Doctor Management',
            description: 'Manage Doctors',
            icon: Stethoscope,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            path: '/admin/doctors'
        },
        {
            title: 'Staff Management',
            description: 'Manage Staffs',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/admin/staff'
        },
        {
            title: 'Bed Management',
            description: 'Manage Beds',
            icon: BedDouble,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            path: '/admin/beds'
        },
        {
            title: 'Equipment Management',
            description: 'Manage Equipments',
            icon: BedDouble,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            path: '/admin/equipment'
        },
        {
            title: 'Test Management',
            description: 'Manage Tests',
            icon: TestTube2,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            path: '/admin/tests'
        }

    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-800 rounded-lg text-white">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 text-white ">Manage hospital resources.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(module.path)}
                        className=" rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${module.bg} ${module.color}`}>
                                <module.icon size={24} />
                            </div>
                            <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-white">{module.title}</h3>
                        <p className="text-slate-500">{module.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
