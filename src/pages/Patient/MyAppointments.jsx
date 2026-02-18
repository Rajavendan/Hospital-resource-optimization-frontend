import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, Clock, MapPin, XCircle, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MyAppointments = () => {
    const { user } = useAuth();
    const { appointments, cancelAppointment, doctors, refreshAppointments } = useData();
    const [refreshing, setRefreshing] = useState(false);

    // Backend already filters by patient context, so we trust the response.
    const myAppointments = appointments;

    const getDoctorName = (id) => {
        // Handle both object and ID references if backend returns mixed or populated
        const doc = doctors.find(u => u.id === id || u.id === (id?.id));
        return doc?.name || 'Unknown Doctor';
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshAppointments();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Refresh on mount if appointments are empty
    useEffect(() => {
        if (appointments.length === 0 && user && refreshAppointments) {
            handleRefresh();
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">My Appointments</h1>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid gap-4">
                {myAppointments.map(apt => {
                    const isVideo = apt.consultationType === 'VIDEO';
                    const statusLabel = apt.consultationStatus || apt.status;

                    return (
                        <div key={apt.id} className="bg-black p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                {apt.appointmentDate ? new Date(apt.appointmentDate).getDate() : 'N/A'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{apt.doctor?.name || getDoctorName(apt.doctor?.id || apt.doctorId)}</h3>
                                <p className="text-white text-sm">
                                    {isVideo ? 'Video Consult' : 'In‑Person Visit'}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                    <span className="flex items-center gap-1 text-white">
                                        <Clock size={14} /> {apt.appointmentTime}
                                    </span>
                                    {!isVideo && (
                                        <span className="flex items-center gap-1 text-white">
                                            <MapPin size={14} /> General Ward
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabel === 'ACTIVE' ? 'bg-green-100 text-green-700' : statusLabel === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {statusLabel}
                            </span>

                            {isVideo && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.post(`/api/appointments/${apt.id}/join`);
                                            if (!res.data.allowed) {
                                                toast.error(res.data.reason || 'Unable to join this video consultation.');
                                                return;
                                            }
                                            if (res.data.meetingLink) {
                                                window.open(res.data.meetingLink, '_blank', 'noopener,noreferrer');
                                            } else {
                                                toast.error('No meeting link available.');
                                            }
                                        } catch (err) {
                                            console.error('Join video failed', err);
                                            toast.error('Failed to join video call.');
                                        }
                                    }}
                                    className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                                >
                                    Join Video
                                </button>
                            )}
                            <button
                                onClick={() => cancelAppointment(apt.id)}
                                className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                            >
                                <XCircle size={14} /> Cancel
                            </button>
                        </div>
                    </div>
                    );
                })}

                {myAppointments.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No upcoming appointments found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
