import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Clock, Briefcase, Calendar } from 'lucide-react';
import api from '../../api/axios';

const Doctors = () => {
    const { doctors, setDoctors } = useData();
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [stats, setStats] = useState(null);

    const handleViewSchedule = async (doctor) => {
        setSelectedDoctor(doctor);
        setLoadingSchedule(true);
        setStats(null);
        try {
            const [scheduleRes, statsRes] = await Promise.all([
                api.get(`/doctors/${doctor.id}/appointments`),
                api.get(`/staff/doctors/${doctor.id}/stats`)
            ]);
            setSchedule(scheduleRes.data || []);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error("Failed to fetch doctor details", error);
            setSchedule([]);
        } finally {
            setLoadingSchedule(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200">Doctor Directory</h1>
                    <p className="text-slate-400">View doctor availability and schedules</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-[#0f1014]/60 backdrop-blur-md p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-[#0f1014]/80 transition-all duration-300"
                    >
                        {/* Hover Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-sm group-hover:blur-md transition-all duration-500"></div>

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 p-3 rounded-xl text-violet-300 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                                <User size={24} />
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${doc.currentWorkload >= doc.maxLoad
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    }`}
                            >
                                {doc.currentWorkload} / {doc.maxLoad} Load
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-200 mb-1 relative z-10">{doc.name}</h3>
                        <div className="flex items-center text-slate-400 text-sm mb-4">
                            <Briefcase size={16} className="mr-2" />
                            {doc.specialization}
                        </div>

                        <div className="border-t border-zinc-800 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Email</span>
                                <span className="font-medium text-slate-200">{doc.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Shift</span>
                                <span className="font-medium text-slate-200">
                                    {doc.shiftStartTime} - {doc.shiftEndTime}
                                </span>
                            </div>

                            <button
                                onClick={() => handleViewSchedule(doc)}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-violet-300 rounded-xl transition-all font-semibold text-sm border border-white/5 hover:border-violet-500/30 shadow-sm relative overflow-hidden group/btn"
                            >
                                <span className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                                <Calendar size={16} /> View Schedule & Stats
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Schedule Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0f1014] rounded-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.15)]">
                        <button
                            onClick={() => setSelectedDoctor(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold text-slate-200 mb-2">{selectedDoctor.name}</h2>
                        <p className="text-slate-400 text-sm mb-6">Daily Overview</p>

                        {/* Doctor Stats Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-blue-900/20 p-3 rounded-lg text-center border border-blue-900/50">
                                <span className="block text-xl font-bold text-blue-400">{stats?.opdCount || 0}</span>
                                <span className="text-xs text-blue-300 font-medium">OPD Pts</span>
                            </div>
                            <div className="bg-purple-900/20 p-3 rounded-lg text-center border border-purple-900/50">
                                <span className="block text-xl font-bold text-purple-400">{stats?.appointmentCount || 0}</span>
                                <span className="text-xs text-purple-300 font-medium">Appts</span>
                            </div>
                            <div className="bg-zinc-800 p-3 rounded-lg text-center border border-zinc-700">
                                <span className="block text-xl font-bold text-slate-200">{stats?.totalToday || 0}</span>
                                <span className="text-xs text-slate-400 font-medium">Total</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-200 mb-3 text-sm flex items-center gap-2">
                            <Clock size={16} /> Schedule Today
                        </h3>

                        {loadingSchedule ? (
                            <div className="text-center py-8 text-slate-400">Loading schedule...</div>
                        ) : (
                            <div className="space-y-3">
                                {schedule.length === 0 ? (
                                    <div className="text-center py-8 bg-zinc-800 rounded-lg border border-zinc-700 text-slate-400">
                                        No appointments scheduled today.
                                    </div>
                                ) : (
                                    schedule.map((appt) => (
                                        <div key={appt.id} className="flex gap-4 p-3 border border-zinc-800 rounded-lg hover:bg-zinc-800/50">
                                            <div className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded text-sm font-bold h-fit">
                                                {appt.appointmentTime || appt.time}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{appt.patientName || (appt.patient ? appt.patient.name : 'Unknown Patient')}</p>
                                                <p className="text-xs text-slate-400 font-mono">{appt.appointmentDate || appt.date}</p>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${appt.status === 'CONFIRMED' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
