import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
    CalendarCheck, 
    Clock, 
    MapPin, 
    XCircle, 
    RefreshCw, 
    Video, 
    User, 
    ChevronRight, 
    X,
    Calendar,
    Activity,
    VideoIcon,
    AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import VideoMeeting from '../../components/VideoMeeting';

const MyAppointments = () => {
    const { user } = useAuth();
    const { appointments, cancelAppointment, doctors, refreshAppointments } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const myAppointments = appointments;

    const getDoctorName = (id) => {
        const doc = doctors.find(u => u.id === id || u.id === (id?.id));
        return doc?.name || 'Unknown Doctor';
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshAppointments();
            toast.success('Appointments updated');
        } catch (error) {
            console.error('Refresh failed:', error);
            toast.error('Failed to sync appointments');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (appointments.length === 0 && user && refreshAppointments) {
            handleRefresh();
        }
    }, []);

    const handleCardClick = (apt) => {
        setSelectedAppointment(apt);
        setShowDetailModal(true);
    };

    const handleJoinVideo = async (apt) => {
        console.log("Attempting to join appointment:", apt.id);
        try {
            const res = await api.post(`/api/appointments/${apt.id}/join`);
            if (!res.data.allowed) {
                toast.error(res.data.reason || 'Unable to join this video consultation.');
                return;
            }

            if (res.data.meetingLink) {
                setActiveMeeting(res.data.meetingLink);
                setShowDetailModal(false);
            } else {
                toast.error('No meeting link received from server.');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join video call.');
        }
    };

    const handleCancelFromDetail = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await cancelAppointment(id);
            setShowDetailModal(false);
            // toast success is handled in context usually, but we could add one here if needed
        } catch (err) {
            toast.error("Failed to cancel appointment");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
                {/* Embedded Video Call Overlay */}
                {activeMeeting && (
                    <VideoMeeting
                        meetingLink={activeMeeting}
                        isDoctor={false}
                        onClose={() => setActiveMeeting(null)}
                    />
                )}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 rounded-xl">
                                <CalendarCheck className="text-blue-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">My Schedule</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            View and manage your upcoming medical consultations
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all font-bold text-sm"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-500' : ''} />
                        {refreshing ? 'Syncing...' : 'Sync'}
                    </button>
                </div>

                {/* List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {myAppointments.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Appointments Found</h3>
                            <p className="text-slate-500">You don't have any upcoming consultations scheduled.</p>
                        </div>
                    ) : (
                        myAppointments.map(apt => {
                            const isVideo = apt.consultationType === 'VIDEO';
                            const statusLabel = apt.consultationStatus || apt.status;
                            const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
                            const day = aptDate ? aptDate.getDate() : '--';
                            const month = aptDate ? aptDate.toLocaleString('default', { month: 'short' }) : 'N/A';

                            return (
                                <div 
                                    key={apt.id}
                                    onClick={() => handleCardClick(apt)}
                                    className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center gap-5"
                                >
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl border border-blue-500/20 shadow-inner group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-500">
                                        <span className="text-[10px] uppercase font-black tracking-tighter text-blue-400 group-hover:text-blue-100 leading-none">{month}</span>
                                        <span className="text-xl font-black text-white leading-none mt-0.5">{day}</span>
                                    </div>

                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors truncate">
                                            {apt.doctor?.name || getDoctorName(apt.doctor?.id || apt.doctorId)}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5 grayscale group-hover:grayscale-0 transition-all">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <Clock size={12} className="text-blue-400" />
                                                {apt.appointmentTime}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {isVideo ? <Video size={12} className="text-indigo-400" /> : <MapPin size={12} className="text-emerald-400" />}
                                                {isVideo ? 'Digital' : 'In-Clinic'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${
                                            statusLabel === 'ACTIVE' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : statusLabel === 'EXPIRED' 
                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {statusLabel}
                                        </div>
                                        <ChevronRight size={18} className="text-slate-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Header BG */}
                            <div className={`h-32 bg-gradient-to-r relative ${
                                selectedAppointment.consultationType === 'VIDEO' ? 'from-indigo-600 to-blue-700' : 'from-emerald-600 to-teal-700'
                            }`}>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        Ref: #{selectedAppointment.id.toString().slice(-6)}
                                    </div>
                                </div>
                            </div>

                            {/* Icon Overlay */}
                            <div className="px-6 relative text-white">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className={`w-full h-full bg-gradient-to-br rounded-2xl flex items-center justify-center text-white text-3xl font-bold ${
                                        selectedAppointment.consultationType === 'VIDEO' ? 'from-indigo-500 to-blue-600' : 'from-emerald-500 to-teal-600'
                                    }`}>
                                        {selectedAppointment.consultationType === 'VIDEO' ? <VideoIcon size={40} /> : <Calendar size={40} />}
                                    </div>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div className="p-6 pt-0 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white leading-tight">
                                        {selectedAppointment.doctor?.name || getDoctorName(selectedAppointment.doctor?.id || selectedAppointment.doctorId)}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Medical Consultation</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Schedule</p>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className="text-blue-400" />
                                            <p className="font-bold">{selectedAppointment.appointmentDate}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Clock size={18} className="text-blue-400" />
                                            <p className="font-bold">{selectedAppointment.appointmentTime}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Information</p>
                                        <div className="flex items-center gap-3">
                                            <Activity size={18} className="text-emerald-400" />
                                            <p className="font-bold">{selectedAppointment.consultationType === 'VIDEO' ? 'Digital Meeting' : 'In-Person Visit'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <AlertCircle size={18} className="text-amber-400" />
                                            <p className="font-bold">{selectedAppointment.consultationStatus || selectedAppointment.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Actions */}
                                <div className="flex flex-col gap-3 pt-2">
                                    {selectedAppointment.consultationType === 'VIDEO' && (
                                        <button
                                            onClick={() => handleJoinVideo(selectedAppointment)}
                                            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            <VideoIcon size={20} />
                                            Enter Video Consultation
                                        </button>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <button
                                            disabled
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-500 py-4 rounded-2xl font-bold opacity-50 cursor-not-allowed border border-white/5"
                                        >
                                            <RefreshCw size={18} />
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleCancelFromDetail(selectedAppointment.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-2xl font-bold transition-all border border-rose-500/20"
                                        >
                                            <XCircle size={18} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-center text-[10px] text-slate-600 font-medium px-4">
                                    Please arrive 15 minutes prior for in-person visits. For digital consults, ensure your camera and microphone are functional.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
