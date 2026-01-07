import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, FileText, AlertCircle, Save, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';


const Patients = () => {
    const navigate = useNavigate();
    // ... (state)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [notes, setNotes] = useState('');

    const [scheduledPatients, setScheduledPatients] = useState([]);
    const [opdPatients, setOpdPatients] = useState([]);
    const [activeTab, setActiveTab] = useState('opd'); // 'scheduled' or 'opd'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [opdRes, aptRes] = await Promise.all([
                    api.get('/api/doctors/my-patients'),
                    api.get('/api/appointments/my-schedule')
                ]);
                setOpdPatients(opdRes.data);

                // Filter appointments to unique patients if needed, or just list appointments
                setScheduledPatients(aptRes.data);
            } catch (err) {
                setError("Failed to load patient lists.");
                console.error(err);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... (filter)

    const handleEdit = (patient) => {
        setSelectedPatient(patient);
        setNotes(`Notes for ${patient.name}: Patient is stable.`);
    };

    const handleSave = () => {
        // Placeholder for future update API
        toast.success("Records updated successfully (Local only for now)!");
        setSelectedPatient(null);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center text-blue-600 gap-2">
            <Loader className="animate-spin" /> Loading Patient Records...
        </div>
    );

    if (error) return (
        <div className="h-full flex items-center justify-center text-red-500 gap-2">
            <AlertCircle /> {error}
        </div>
    );

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Patient Records</h1>
                <div className="relative group">
                    <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-10 pr-4 py-2.5 bg-[#0f1014] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-72 text-slate-200 placeholder:text-slate-600 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs & Search Header for Panel */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'scheduled'
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    Scheduled Patients
                </button>
                <button
                    onClick={() => setActiveTab('opd')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'opd'
                        ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    OPD / Admitted
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="glass-panel w-full h-full rounded-2xl border border-white/5 shadow-2xl shadow-black/50 flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/5 sticky top-0 backdrop-blur-md z-10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${activeTab === 'scheduled' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                            {activeTab === 'scheduled' ? 'Scheduled Patients (Appointments)' : 'Out Patients (OPD / Admitted)'}
                        </h2>
                        <div className="text-xs font-mono text-slate-500 uppercase">
                            Total: {activeTab === 'scheduled' ? scheduledPatients.length : opdPatients.length} records
                        </div>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                                <tr>
                                    {activeTab === 'scheduled' ? (
                                        <>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Time</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Patient Name</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Details</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">ID</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Patient Name</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Diagnosis</th>
                                            <th className="p-4 font-semibold text-slate-400 text-xs uppercase">Severity</th>
                                        </>
                                    )}
                                    <th className="p-4 font-semibold text-slate-400 text-xs uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeTab === 'scheduled' ? (
                                    scheduledPatients.length === 0 ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-slate-500">No appointments found.</td></tr>
                                    ) : (
                                        scheduledPatients.map(apt => (
                                            <tr key={apt.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-slate-300 font-mono font-bold">{apt.appointmentTime?.substring(0, 5)}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-200 text-lg">{apt.patientName}</div>
                                                    <div className="text-xs text-slate-500">ID: {apt.patientCustomId}</div>
                                                </td>
                                                <td className="p-4 text-xs text-slate-400">
                                                    {apt.patientGender}, {apt.patientAge} yrs
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${apt.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/doctor/consultation/${apt.patientId}`)}
                                                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Use Schedule to Attend
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    opdPatients.length === 0 ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-slate-500">No OPD patients assigned.</td></tr>
                                    ) : (
                                        opdPatients.map(patient => (
                                            <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-slate-500 font-mono text-xs">#{patient.customId || patient.id}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-200 text-lg">{patient.name}</div>
                                                    <div className="text-xs text-slate-500">{patient.age} / {patient.gender}</div>
                                                </td>
                                                <td className="p-4 text-slate-400 text-sm">{patient.diagnosis || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${patient.severity >= 4 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                        patient.severity === 3 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                        Lvl {patient.severity}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleEdit(patient)}
                                                        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                                                    >
                                                        <FileText size={16} /> View Record
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedPatient && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50 transition-opacity">
                    <div className="w-full max-w-md bg-[#0a0a0c] h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-100">Update Medical Record</h2>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-blue-900/10 rounded-xl border border-blue-500/20">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-blue-300">{selectedPatient.name}</h3>
                                    <span className="text-sm text-blue-400 font-mono">#{selectedPatient.id}</span>
                                </div>
                                <p className="text-sm text-blue-200/80">{selectedPatient.diagnosis}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Medical Notes</label>
                                <textarea
                                    className="w-full p-4 bg-[#18181b] border border-white/10 rounded-xl h-40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-200 placeholder:text-slate-600"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter detailed observation notes..."
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-violet-600 text-white py-3.5 rounded-xl font-bold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save Records
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
