import React, { useState } from 'react';
import BillingDashboard from '../Billing/Dashboard';
import TestHandlerDashboard from '../TestHandler/TestHandlerDashboard';
import { CreditCard, TestTube, LayoutDashboard } from 'lucide-react';

const BillingTestHandler = () => {
    const [activeTab, setActiveTab] = useState('billing');

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-violet-600/20 rounded-xl">
                                <LayoutDashboard className="text-violet-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Billing & Lab Operations</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base">
                            Administrative oversight for billing records and laboratory test processing
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'billing'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <CreditCard size={20} />
                        Billing Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'lab'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <TestTube size={20} />
                        Lab Dashboard
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                    {activeTab === 'billing' ? (
                        <div className="p-0">
                            <BillingDashboard />
                        </div>
                    ) : (
                        <div className="p-0">
                            <TestHandlerDashboard />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingTestHandler;
