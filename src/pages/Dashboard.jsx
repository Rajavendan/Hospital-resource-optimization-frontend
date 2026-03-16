import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Bed,
    Stethoscope,
    Activity,
    AlertTriangle,
    Users,
    Clock,
    CalendarCheck,
    Bell,
    BarChart2,
    CheckCircle,
    Siren
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const isStaff = user.role === 'staff' || user.role === 'STAFF';

    useEffect(() => {
        if (isStaff) {
            fetchStats();
            const interval = setInterval(fetchStats, 30000); // Live update every 30s
            return () => clearInterval(interval);
        }
    }, [user.role]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/staff/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [patientInfo, setPatientInfo] = useState('');
    const [emergencyType, setEmergencyType] = useState('');
    const [alertSuccess, setAlertSuccess] = useState(null); // stores {notifiedDoctors, timestamp, type}

    const handleEmergencyAlert = (type) => {
        setEmergencyType(type);
        setShowEmergencyModal(true);
    };

    const confirmEmergencyAlert = async () => {
        setEmergencyLoading(true);
        setShowEmergencyModal(false);
        try {
            const res = await api.post('/api/staff/emergency-alert', {
                reportedBy: user?.name || user?.username || 'Staff Member',
                patientInfo: `[${emergencyType}] ` + (patientInfo.trim() || 'High emergency case - details not specified')
            });
            setAlertSuccess({
                notifiedDoctors: res.data.notifiedDoctors || [],
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                type: emergencyType
            });
            setPatientInfo('');
        } catch (err) {
            toast.error('Failed to send emergency alert: ' + (err.response?.data?.error || err.message), {
                duration: 5000,
                style: { background: '#ef4444', color: '#fff' }
            });
        } finally {
            setEmergencyLoading(false);
        }
    };

    if (isStaff) {
        if (loading && !stats) return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-200">Staff Dashboard</h1>
                        <p className="text-slate-400">Overview &amp; Real-time Metrics</p>
                    </div>
                    <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-slate-400 hidden sm:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Emergency Alert Section - 3 large centered buttons */}
                <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-red-600/20 p-2 rounded-full">
                            <Siren size={20} className="text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-400">Emergency Alert System</h2>
                            <p className="text-sm text-slate-500">Instantly notify on-call doctors (doctor1 &amp; doctor2) via email</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Poison Emergency */}
                        <button
                            onClick={() => handleEmergencyAlert('POISON')}
                            disabled={emergencyLoading}
                            className="bg-yellow-950/40 hover:bg-yellow-900/50 border-2 border-yellow-700/50 hover:border-yellow-500 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="text-5xl mb-3">☠️</div>
                            <h3 className="text-xl font-bold text-yellow-400">POISON</h3>
                            <p className="text-xs text-slate-500 mt-1">Toxic substance ingestion</p>
                        </button>
                        {/* Accident Emergency */}
                        <button
                            onClick={() => handleEmergencyAlert('ACCIDENT')}
                            disabled={emergencyLoading}
                            className="bg-orange-950/40 hover:bg-orange-900/50 border-2 border-orange-700/50 hover:border-orange-500 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="text-5xl mb-3">🚑</div>
                            <h3 className="text-xl font-bold text-orange-400">ACCIDENT</h3>
                            <p className="text-xs text-slate-500 mt-1">Trauma / physical injury</p>
                        </button>
                        {/* Others Emergency */}
                        <button
                            onClick={() => handleEmergencyAlert('OTHERS')}
                            disabled={emergencyLoading}
                            className="bg-red-950/40 hover:bg-red-900/50 border-2 border-red-700/50 hover:border-red-500 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="text-5xl mb-3">🚨</div>
                            <h3 className="text-xl font-bold text-red-400">OTHERS</h3>
                            <p className="text-xs text-slate-500 mt-1">All other emergencies</p>
                        </button>
                    </div>
                    {emergencyLoading && (
                        <p className="text-center text-red-400 font-bold mt-4 animate-pulse">⏳ Sending emergency alert to doctors...</p>
                    )}
                </div>

                {/* Stats Cards */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Patients Today</p>
                            <h3 className="text-3xl font-bold text-slate-200 mt-1">{stats?.totalPatientsToday || 0}</h3>
                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                <span className="font-bold text-violet-400">{stats?.opdCount || 0} OPD</span>
                                <span>|</span>
                                <span className="font-bold text-purple-400">{stats?.appointmentCount || 0} Appts</span>
                            </div>
                        </div>
                        <div className="bg-violet-900/20 p-3 rounded-full text-violet-400"><Users size={24} /></div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Pending Tests</p>
                            <h3 className="text-3xl font-bold text-orange-400 mt-1">{stats?.pendingTests || 0}</h3>
                        </div>
                        <div className="bg-orange-900/20 p-3 rounded-full text-orange-400"><Clock size={24} /></div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Tests Completed</p>
                            <h3 className="text-3xl font-bold text-green-400 mt-1">{stats?.completedTests || 0}</h3>
                        </div>
                        <div className="bg-green-900/20 p-3 rounded-full text-green-400"><CheckCircle size={24} /></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area (Left 2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Patient Activity Table */}
                        <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                                    <Activity size={20} className="text-violet-500" /> Recent Patient Activity
                                </h3>
                                <span className="text-xs font-medium bg-zinc-800 text-slate-400 px-2 py-1 rounded">Today</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-950 text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Patient</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Assigned Doctor</th>
                                            <th className="px-6 py-3">Time</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {stats?.recentActivity?.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No activity recorded today</td>
                                            </tr>
                                        ) : (
                                            stats?.recentActivity?.map((activity, idx) => (
                                                <tr key={idx} className="hover:bg-zinc-800/50">
                                                    <td className="px-6 py-3 font-medium text-slate-200">{activity.name}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${activity.type === 'OPD' ? 'bg-violet-900/20 text-violet-400' : 'bg-purple-900/20 text-purple-400'
                                                            }`}>
                                                            {activity.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-400">{activity.doctor}</td>
                                                    <td className="px-6 py-3 text-slate-500">{activity.time}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="px-2 py-1 rounded-full text-xs bg-zinc-800 text-slate-400">
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Doctor Test Counts Bar Chart */}
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <BarChart2 size={20} className="text-purple-500" /> Doctor Workload (Tests)
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(stats?.doctorTestCounts || {}).length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">No data available</p>
                                ) : (
                                    Object.entries(stats.doctorTestCounts).map(([doctor, count]) => (
                                        <div key={doctor}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-slate-400">{doctor}</span>
                                                <span className="text-slate-500">{count} tests</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${Math.min((count / (stats.pendingTests + 1)) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Daily Volume Visual (Simple Bars for Last 7 Days) */}
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-violet-500" /> Daily Test Volume (Last 7 Days)
                            </h3>
                            <div className="flex items-end justify-between h-32 gap-2">
                                {Object.entries(stats?.dailyVolume || {}).map(([date, count]) => (
                                    <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div
                                            className="w-full bg-violet-900/40 hover:bg-violet-600 rounded-t-lg transition-all relative group-hover:bg-violet-500"
                                            style={{ height: `${Math.max((count / 20) * 100, 5)}%` }} // Scaling roughly
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {count}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-500 rotate-0 truncate w-full text-center">{date.slice(5)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications Panel (Right 1/3) */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm h-fit">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-amber-500" /> Notifications
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {stats?.notifications?.map((note, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-3 bg-zinc-800/50 rounded-lg border border-zinc-800 text-sm">
                                    <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                                    <p className="text-slate-400">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default / Other Roles View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200">Dashboard Overview</h1>
                    <p className="text-slate-400">Welcome back, {user.name} ({user.role})</p>
                </div>
                <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-slate-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="bg-violet-900/10 p-8 rounded-xl border border-violet-900/20 text-center">
                <h2 className="text-xl font-bold text-violet-400 mb-2">Welcome to Your Smart Hospital Portal</h2>
                <p className="text-violet-300 mb-6">Select an action from below to get started.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {user.role === 'staff' && (
                        // Fallback link if someone manually navigates or if logic fails
                        <div onClick={() => window.location.reload()} className="bg-zinc-900 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 hover:border-violet-500/50">
                            <Activity className="mx-auto text-violet-500 mb-4" size={32} />
                            <h3 className="font-bold text-slate-200">Refresh Dashboard</h3>
                        </div>
                    )}

                    {user.role === 'doctor' && (
                        <>
                            <div onClick={() => navigate('/doctor/patients')} className="bg-zinc-900 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 hover:border-violet-500/50">
                                <Users className="mx-auto text-violet-500 mb-4" size={32} />
                                <h3 className="font-bold text-slate-200">My Patients</h3>
                            </div>
                            <div className="bg-zinc-900 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 pointer-events-none opacity-60">
                                <CalendarCheck className="mx-auto text-slate-500 mb-4" size={32} />
                                <h3 className="font-bold text-slate-400">Appointments (Coming Soon)</h3>
                            </div>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <div onClick={() => navigate('/admin/equipment')} className="bg-zinc-900 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 hover:border-violet-500/50">
                                <Stethoscope className="mx-auto text-violet-500 mb-4" size={32} />
                                <h3 className="font-bold text-slate-200">Equipment</h3>
                            </div>
                            <div onClick={() => navigate('/admin/tests')} className="bg-zinc-900 p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 hover:border-violet-500/50">
                                <Activity className="mx-auto text-violet-500 mb-4" size={32} />
                                <h3 className="font-bold text-slate-200">Test Definitions</h3>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Emergency Confirmation Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-red-700 shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-600/20 p-3 rounded-full">
                                <Siren size={24} className="text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-red-400">Confirm Emergency Alert</h2>
                                <p className="text-slate-500 text-sm">This will send urgent emails to doctor1 and doctor2</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Patient / Situation Details</label>
                            <textarea
                                rows={3}
                                value={patientInfo}
                                onChange={e => setPatientInfo(e.target.value)}
                                placeholder="e.g. Patient John Doe, ICU Room 5 - cardiac arrest..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEmergencyAlert}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-all shadow-lg shadow-red-900/30"
                            >
                                🚨 Send Emergency Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Success Modal */}
            {alertSuccess && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl border border-green-700/60 shadow-2xl w-full max-w-md p-6">
                        {/* Animated checkmark header */}
                        <div className="flex flex-col items-center mb-5">
                            <div className="bg-green-600/20 rounded-full p-4 mb-3">
                                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-green-400">Alert Sent Successfully!</h2>
                            <p className="text-slate-500 text-sm mt-1">Emergency doctors have been notified</p>
                        </div>

                        {/* Emergency type badge */}
                        <div className="flex justify-center mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${alertSuccess.type === 'POISON'
                                ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50'
                                : alertSuccess.type === 'ACCIDENT'
                                    ? 'bg-orange-900/30 text-orange-400 border-orange-700/50'
                                    : 'bg-red-900/30 text-red-400 border-red-700/50'
                                }`}>
                                {alertSuccess.type === 'POISON' ? '☠️' : alertSuccess.type === 'ACCIDENT' ? '🚑' : '🚨'} {alertSuccess.type} EMERGENCY
                            </span>
                        </div>

                        {/* Notified doctors */}
                        <div className="bg-zinc-800/60 rounded-xl p-4 mb-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Doctors Notified via Email</p>
                            <div className="space-y-2">
                                {alertSuccess.notifiedDoctors.map((doc, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
                                        <span className="text-slate-200 text-sm font-medium">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-600 mb-4">Sent at {alertSuccess.timestamp}</p>

                        <button
                            onClick={() => setAlertSuccess(null)}
                            className="w-full py-2.5 bg-green-700 hover:bg-green-600 rounded-xl font-bold text-white transition-colors"
                        >
                            ✓ Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
