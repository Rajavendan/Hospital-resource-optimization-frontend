import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Calendar, Clock, User, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Schedule = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [opdPatients, setOpdPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [aptRes, opdRes] = await Promise.all([
                api.get('/api/appointments/my-schedule'),
                api.get('/api/doctors/my-patients')
            ]);
            setAppointments(aptRes.data);
            setOpdPatients(opdRes.data);
        } catch (error) {
            console.error("Failed to load schedule/patients", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading schedule...</div>;

    // Merge and sort lists could be done here if we wanted a strictly time-based single list.
    // For now, let's keep them in separate sections or a unified list with badges.
    // Unified list approach as requested:

    const unifiedList = [
        ...appointments.map(a => ({ ...a, type: 'APPOINTMENT', sortTime: a.appointmentTime || '00:00:00' })),
        ...opdPatients.map(p => ({
            id: p.id,
            patientId: p.id,
            patientName: p.name,
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: '00:00:00',
            status: 'OPD / WALK-IN',
            type: 'OPD',
            sortTime: '00:00:00'
        }))
    ].sort((a, b) => {
        const timeA = a.sortTime || '00:00:00';
        const timeB = b.sortTime || '00:00:00';
        return timeA.localeCompare(timeB);
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">My Schedule & Patients</h1>
                    <p className="text-slate-400 mt-1">Unified view of Appointments and OPD assignments</p>
                </div>
                <div className="bg-white/5 border border-white/10 text-blue-400 px-4 py-2 rounded-xl font-medium flex items-center gap-2 backdrop-blur-md">
                    <Calendar size={18} />
                    Today: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="glass-panel w-full h-full rounded-2xl border border-white/5 shadow-2xl shadow-black/50 flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <Activity className="text-violet-500" />
                            Patient Queue
                        </h2>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Type</th>
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Time / Date</th>
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Patient Name</th>
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Status</th>
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {unifiedList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <CheckCircle size={48} className="mb-4 opacity-50" />
                                                <h3 className="text-lg font-medium text-slate-400">No Patients</h3>
                                                <p className="text-sm">Your schedule is clear.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    unifiedList.map((item, index) => (
                                        <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'APPOINTMENT'
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    }`}>
                                                    {item.consultationType === 'VIDEO' ? 'VIDEO' : item.type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    {item.type === 'APPOINTMENT' ? (
                                                        <>
                                                            <span className="text-slate-200 font-mono font-bold text-lg">{item.appointmentTime?.substring(0, 5)}</span>
                                                            <span className="text-xs text-slate-500 uppercase font-bold">{item.appointmentDate}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">Walk-in</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-200 text-lg">{item.patientName || "Unknown"}</div>
                                                {item.type === 'OPD' && <div className="text-xs text-slate-500">ID: #{item.patientId}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-400 text-sm">{item.status}</span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {/* Video Join Button (VIDEO only, via secure join API) */}
                                                {item.consultationType === 'VIDEO' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await api.post(`/api/appointments/${item.id}/join`);
                                                                if (!res.data.allowed) {
                                                                    toast.error(res.data.reason || 'Unable to join this consultation.');
                                                                    return;
                                                                }
                                                                if (res.data.meetingLink) {
                                                                    window.open(res.data.meetingLink, '_blank', 'noopener,noreferrer');
                                                                } else {
                                                                    toast.error('No meeting link available.');
                                                                }
                                                            } catch (err) {
                                                                console.error('Join call failed', err);
                                                                toast.error('Failed to join video call.');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                    >
                                                        Join Call
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (item.patientId) navigate(`/doctor/consultation/${item.patientId}`);
                                                        else toast.error("Patient details missing");
                                                    }}
                                                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                                                >
                                                    Attend <ArrowRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
