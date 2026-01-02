import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';

const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await api.get('/appointments/my-schedule');
            setAppointments(response.data);
        } catch (error) {
            console.error("Failed to load schedule", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading schedule...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                    <p className="text-slate-500">Upcoming appointments and patient visits</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    <Calendar size={18} />
                    Today: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid gap-4">
                {appointments.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100">
                        <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-800">No Appointments</h3>
                        <p className="text-slate-500">Your schedule is clear for now.</p>
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-6">
                                <div className="bg-purple-100 text-purple-600 p-4 rounded-lg flex flex-col items-center min-w-[100px]">
                                    <span className="text-sm font-bold uppercase">{apt.date}</span>
                                    <span className="text-2xl font-bold">{apt.time}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{apt.patient?.name || "Unknown Patient"}</h3>
                                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                                        <span className="flex items-center gap-1"><User size={14} /> {apt.patient?.gender || "N/A"}, {apt.patient?.age || "N/A"} yrs</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> 30 min slot</span>
                                    </div>
                                    {apt.patient?.diagnosis && (
                                        <div className="mt-2 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block">
                                            Diagnosis: {apt.patient.diagnosis}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Schedule;
