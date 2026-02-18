import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { BedDouble, ClipboardList } from 'lucide-react';

const AdmissionsTab = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const res = await api.get('/api/patient/admissions');
                setAdmissions(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmissions();
    }, []);

    if (loading) return <div>Loading admission history...</div>;
    if (admissions.length === 0) return <div className="text-center py-8 text-gray-500">No admission history records.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-100">
                <BedDouble className="w-5 h-5" /> Admission & Discharge Summary
            </h2>
            <div className="space-y-4">
                {admissions.map((admit) => (
                    <div key={admit.id} className="glass-card border border-white/10 rounded-lg p-5 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100">Inpatient Summary</h3>
                                <p className="text-sm text-slate-400">Date: {new Date(admit.admissionDate).toLocaleDateString()} - {admit.dischargeDate ? new Date(admit.dischargeDate).toLocaleDateString() : 'Ongoing'}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${admit.status === 'DISCHARGED' ? 'bg-slate-500/20 text-slate-300' : 'bg-green-500/20 text-green-300'}`}>
                                {admit.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-md border border-white/5">
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Ward</p>
                                <p className="font-medium text-slate-200">{admit.ward}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Bed Number</p>
                                <p className="font-medium text-slate-200">{admit.bedNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Admission Date</p>
                                <p className="font-medium text-slate-200">{new Date(admit.admissionDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Discharge Date</p>
                                <p className="font-medium text-slate-200">{admit.dischargeDate ? new Date(admit.dischargeDate).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-white/10 flex justify-end">
                            <button className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 font-medium transition-colors">
                                <ClipboardList className="w-4 h-4" /> Download Discharge Summary
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdmissionsTab;
