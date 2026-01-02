import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, CheckCircle, User, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const BillingDashboard = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/billing/pending');
            setPending(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch billing", err);
            setLoading(false);
        }
    };

    const handlePay = async (id) => {
        if (!window.confirm("Confirm payment receipt?")) return;
        try {
            await api.post(`/billing/pay/${id}`);
            toast.success("Payment marked as successful");
            fetchPending();
        } catch (err) {
            toast.error("Payment update failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <CreditCard className="text-green-600" /> Billing & Payments
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-700">Pending Test Payments</h2>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">
                        {pending.length} Pending
                    </span>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Patient</th>
                            <th className="p-4 font-medium">Test Details</th>
                            <th className="p-4 font-medium">Prescribed By</th>
                            <th className="p-4 font-medium">Amount</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading billing records...</td></tr>
                        ) : pending.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No pending payments found.</td></tr>
                        ) : (
                            pending.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{item.patient?.name}</div>
                                        <div className="text-xs text-slate-500">ID: {item.patient?.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-700">{item.test?.name}</div>
                                        <div className="text-xs text-slate-500">{item.test?.department}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        Dr. {item.doctor?.name}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-slate-800">${item.test?.cost}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handlePay(item.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 ml-auto">
                                            <CheckCircle size={16} /> Mark Paid
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default BillingDashboard;
