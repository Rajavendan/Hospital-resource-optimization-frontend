import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AppointmentsTab = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/patient/appointments/upcoming');
            setAppointments(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load upcoming appointments');
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await api.post(`/api/patient/appointments/${id}/cancel`);
            toast.success('Appointment cancelled');
            fetchAppointments(); // Refresh
        } catch (err) {
            console.error(err);
            toast.error('Failed to cancel appointment');
        }
    };

    if (loading) return <div>Loading appointments...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
                    <Calendar className="w-5 h-5 text-violet-500" /> Upcoming Appointments
                </h2>
                <a href="/book-appointment" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all hover:scale-105">
                    + Book New
                </a>
            </div>

            <div className="space-y-4">
                {appointments.map((apt) => (
                    <div key={apt.id} className="glass-card border border-white/10 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 hover:border-violet-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 p-3 rounded-lg text-center min-w-[80px]">
                                <p className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</p>
                                <p className="text-2xl font-bold">{new Date(apt.date).getDate()}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-100">Dr. {apt.doctor?.user?.name}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-slate-400">{apt.doctor?.specialization || 'General Physician'}</p>
                                    {apt.consultationType === 'VIDEO' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">VIDEO</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {apt.time}</span>

                                    {/* Consultation Location / Link Logic */}
                                    {apt.consultationType === 'VIDEO' || apt.meetingLink ? (
                                        <div className="flex flex-col gap-1 items-start">
                                            {/* Video Logic */}
                                            {(() => {
                                                if (apt.status === 'CANCELLED') return <span className="text-red-500 text-xs font-bold">Cancelled</span>;
                                                if (apt.status === 'COMPLETED') return <span className="text-green-500 text-xs font-bold">Completed</span>;

                                                // Allow joining anytime if link exists for now to be safe, or use 24h window
                                                return (
                                                    <a href={`/video-consultation/${apt.id}?link=${encodeURIComponent(apt.meetingLink)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 bg-green-600/20 text-green-400 px-3 py-1.5 rounded hover:bg-green-600/30 border border-green-500/30 transition-colors animate-pulse text-xs font-bold">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Join Video Call
                                                    </a>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            Physical Visit • Reception
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Status</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${apt.status === 'CONFIRMED' || apt.status === 'BOOKED' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'
                                    }`}>
                                    {apt.status || 'BOOKED'}
                                </span>
                            </div>
                            <button
                                onClick={() => cancelAppointment(apt.id)}
                                disabled={apt.status === 'CANCELLED'}
                                className="text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-colors disabled:opacity-50"
                                title="Cancel Appointment"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}

                {appointments.length === 0 && (
                    <div className="text-center py-10 glass-panel rounded-lg text-slate-500 border-dashed border border-white/10">
                        No upcoming appointments.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsTab;
