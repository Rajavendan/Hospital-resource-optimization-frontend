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

    const handleChangePassword = async () => {
        try {
            await api.post('/api/patient/change-password-link');
            toast.success('Reset link sent to your email!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send reset link.');
        }
    };

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
                    <p className="text-slate-400">Welcome back, {user?.name || 'Patient'}</p>
                </div>
                <button
                    onClick={handleChangePassword}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition font-medium shadow-sm"
                >
                    Change Password
                </button>
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
