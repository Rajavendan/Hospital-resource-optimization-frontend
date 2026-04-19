import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';
import VisitsTab from './components/VisitsTab';
import ReportsTab from './components/ReportsTab';
import PrescriptionsTab from './components/PrescriptionsTab';
import BillingTab from './components/BillingTab';
import AppointmentsTab from './components/AppointmentsTab';
import NotificationsTab from './components/NotificationsTab';
import AdmissionsTab from './components/AdmissionsTab';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'visits';



    const getTitle = () => {
        switch (activeTab) {
            case 'visits': return 'Visit History';
            case 'reports': return 'Reports & Documents';
            case 'prescriptions': return 'My Prescriptions';
            case 'billing': return 'Billing & Payments';
            case 'appointments': return 'My Appointments';
            case 'admissions': return 'Admissions';
            case 'notifications': return 'Notifications';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="p-8">
            <Toaster position="top-right" />
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">
                        {getTitle()}
                    </h2>
                    <p className="text-slate-400">
                        Welcome back, <span className="text-violet-400 font-semibold">{user?.name || 'Patient'}</span>
                        {user?.customId && <span className="ml-2 bg-slate-800 px-2 py-0.5 rounded text-xs border border-white/5 text-slate-500 uppercase tracking-wider">ID: {user.customId}</span>}
                    </p>
                </div>

            </header>

            <div className="glass-panel rounded-2xl p-6 min-h-[600px]">
                {activeTab === 'visits' && <VisitsTab />}
                {activeTab === 'reports' && <ReportsTab />}
                {activeTab === 'prescriptions' && <PrescriptionsTab />}
                {activeTab === 'billing' && <BillingTab />}
                {activeTab === 'appointments' && <AppointmentsTab />}
                {activeTab === 'admissions' && <AdmissionsTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
            </div>
        </div>
    );
};

export default PatientDashboard;
