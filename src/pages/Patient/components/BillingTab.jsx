import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { CreditCard, Download, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const BillingTab = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBilling();
    }, []);

    const fetchBilling = async () => {
        try {
            const res = await api.get('/api/patient/billing');
            setBills(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load billing history');
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = (bill) => {
        if (bill.invoicePath) {
            const url = import.meta.env.VITE_API_URL + bill.invoicePath;
            window.open(url, '_blank');
        } else {
            toast.error('Invoice not generated yet');
        }
    };

    const totalPaid = bills.reduce((acc, bill) => acc + (bill.paidAmount || 0), 0);
    const totalPending = bills.reduce((acc, bill) => acc + ((bill.totalAmount || 0) - (bill.paidAmount || 0)), 0);

    // handlePayment removed as patients cannot pay directly.

    if (loading) return <div>Loading billing info...</div>;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                    <p className="text-sm text-blue-300 font-medium">Total Billed</p>
                    <p className="text-2xl font-bold text-slate-100">${(totalPaid + totalPending).toFixed(2)}</p>
                </div>
                <div className="glass-card p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                    <p className="text-sm text-green-300 font-medium">Total Paid</p>
                    <p className="text-2xl font-bold text-slate-100">${totalPaid.toFixed(2)}</p>
                </div>
                <div className="glass-card p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                    <p className="text-sm text-red-300 font-medium">Pending Amount</p>
                    <p className="text-2xl font-bold text-slate-100">${totalPending.toFixed(2)}</p>
                </div>
            </div>

            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-100">
                <CreditCard className="w-5 h-5 text-violet-500" /> Transaction History
            </h3>

            <div className="overflow-x-auto glass-panel rounded-lg border border-white/10">
                <table className="min-w-full">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                    {new Date(bill.visitDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-100">{bill.billingType || 'SERVICE'}</span>
                                        <span className="text-xs text-slate-500">{bill.description || `Visit ID: ${bill.id}`}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                    ${bill.totalAmount?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300' :
                                        bill.paymentStatus === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                        }`}>
                                        {bill.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 flex gap-2">
                                    {bill.invoicePath ? (
                                        <button
                                            onClick={() => downloadInvoice(bill)}
                                            className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                                        >
                                            <Download className="w-4 h-4" /> Invoice
                                        </button>
                                    ) : (
                                        <span className="text-slate-600 text-xs italic">No Invoice</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bills.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-slate-500">No billing history available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillingTab;
