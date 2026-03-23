import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { CreditCard, Download, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const BillingTab = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBillId, setExpandedBillId] = useState(null);

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

            <div className="grid grid-cols-1 gap-4">
                {bills.map((bill) => (
                    <div 
                        key={bill.id} 
                        className="glass-panel p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                        onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                    >
                        <div className="flex justify-between items-center relative">
                            <div className="flex flex-col w-2/3">
                                <span className="text-sm text-slate-400">{new Date(bill.visitDate).toLocaleDateString()}</span>
                                <span className="font-semibold text-slate-100 text-lg truncate whitespace-nowrap">{bill.billingType || 'SERVICE'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 w-1/3 justify-end">
                                <span className="font-bold text-slate-100 text-lg sm:text-xl">${bill.totalAmount?.toFixed(2)}</span>
                                {expandedBillId === bill.id ? <ChevronUp className="w-5 h-5 text-slate-400 hidden sm:block" /> : <ChevronDown className="w-5 h-5 text-slate-400 hidden sm:block" />}
                            </div>
                        </div>

                        {expandedBillId === bill.id && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-300">
                                        <span className="text-slate-500">Description:</span> {bill.description || `Visit ID: ${bill.id}`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">Status:</span>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            bill.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300' :
                                            bill.paymentStatus === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                        }`}>
                                            {bill.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    {bill.invoicePath ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadInvoice(bill);
                                            }}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                                        >
                                            <Download className="w-4 h-4" /> Download Invoice
                                        </button>
                                    ) : (
                                        <span className="text-slate-500 text-sm italic py-2">No Invoice Available</span>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="mt-2 flex justify-center sm:hidden">
                            {expandedBillId === bill.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </div>
                    </div>
                ))}
                {bills.length === 0 && (
                    <div className="glass-panel p-8 text-center text-slate-400 rounded-lg border border-white/10">
                        No billing history available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingTab;
