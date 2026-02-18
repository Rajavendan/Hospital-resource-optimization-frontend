import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { Calendar, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VisitsTab = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await api.get('/api/patient/visits');
            setVisits(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load visit history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading visits...</div>;
    if (visits.length === 0) return <div className="p-4 text-center text-gray-500">No visit history found.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-100">
                <Calendar className="w-5 h-5 text-violet-500" /> Visit History
            </h2>
            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pl-6">
                {visits.map((visit) => (
                    <div key={visit.id} className="relative glass-card p-4 rounded-lg border border-white/5 shadow-lg hover:bg-white/5 transition-all">
                        <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-violet-600 border-2 border-zinc-900 ring-2 ring-violet-500/30"></div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm text-slate-400">{new Date(visit.date).toLocaleDateString()} at {new Date(visit.date).toLocaleTimeString()}</p>
                                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                    <User className="w-4 h-4 text-violet-400" /> Dr. {visit.doctor?.user?.name || 'Unknown'}
                                </h3>
                            </div>
                        </div>

                        <div className="mt-3 space-y-2">
                            {visit.symptoms && (
                                <p className="text-slate-200"><span className="font-medium text-violet-400">Symptoms:</span> {visit.symptoms}</p>
                            )}
                            {visit.diagnosis && (
                                <p className="text-slate-200"><span className="font-medium text-violet-400">Diagnosis:</span> {visit.diagnosis}</p>
                            )}
                            {visit.details && (
                                <p className="text-slate-300 text-sm bg-white/5 p-2 rounded border border-white/5">{visit.details}</p>
                            )}
                            {visit.followUpDate && (
                                <p className="text-slate-200 mt-2 flex items-center gap-2">
                                    <span className="font-medium text-violet-400">Next Scheduled Visit:</span>
                                    <span className="bg-violet-500/20 text-violet-200 px-2 py-0.5 rounded text-sm border border-violet-500/30">
                                        {new Date(visit.followUpDate).toLocaleDateString()}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Inline Prescriptions if any (Assuming nested or fetched separately, but mapped in backend) */}
                        {visit.prescriptions && visit.prescriptions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10">
                                <h4 className="font-medium text-sm text-slate-100 mb-2">Prescribed Medicines:</h4>
                                <ul className="list-disc list-inside text-sm text-slate-300">
                                    {visit.prescriptions.map((p) => (
                                        <li key={p.id}>
                                            <span className="font-medium text-violet-300">{p.medicineName}</span> - {p.dosage} ({p.frequency}) for {p.duration}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisitsTab;
