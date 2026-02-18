import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { Pill, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PrescriptionsTab = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch visits to extract prescriptions since they are linked to medical records
        const fetchPrescriptions = async () => {
            try {
                const res = await api.get('/api/patient/visits');
                // Flatten prescriptions from all visits
                const allPrescriptions = res.data.flatMap(visit =>
                    (visit.prescriptions || []).map(p => ({
                        ...p,
                        prescribedDate: visit.date,
                        doctorName: visit.doctor?.user?.name
                    }))
                );
                setPrescriptions(allPrescriptions);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load prescriptions');
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    if (loading) return <div>Loading prescriptions...</div>;
    if (prescriptions.length === 0) return <div className="text-center py-8 text-gray-500">No active prescriptions found.</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-100">
                <Pill className="w-5 h-5 text-violet-500" /> My Medicines
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                {prescriptions.map((p, index) => (
                    <div key={index} className="glass-card p-4 rounded-lg border border-white/10 shadow-lg flex flex-col justify-between hover:border-violet-500/30 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-violet-400">{p.medicineName}</h3>
                                <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded border border-white/5">
                                    {new Date(p.prescribedDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p><span className="font-semibold text-slate-400">Dosage:</span> {p.dosage}</p>
                                <p><span className="font-semibold text-slate-400">Duration:</span> {p.duration}</p>
                                <p className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" /> {p.frequency}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-500">
                            Prescribed by Dr. {p.doctorName}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrescriptionsTab;
