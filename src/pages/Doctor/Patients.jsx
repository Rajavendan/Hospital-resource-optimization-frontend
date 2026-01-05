import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, FileText, AlertCircle, Save, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Patients = () => {
    // ... (state)

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctors/my-patients');
                setPatients(response.data);
            } catch (err) {
                setError("Failed to load patients.");
                console.error(err);
                toast.error("Failed to load patients");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
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

            <div className="flex-1 overflow-auto glass-panel rounded-2xl border border-white/5 shadow-2xl shadow-black/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">ID</th>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">Name</th>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">Diagnosis</th>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">Severity</th>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">Status</th>
                            <th className="p-5 font-semibold text-slate-400 text-sm uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-500">
                                    No patients found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5 text-slate-500 font-mono text-sm">#{patient.id}</td>
                                    <td className="p-5 font-medium text-slate-200">
                                        <div className="flex flex-col">
                                            <span className="text-lg">{patient.name}</span>
                                            <span className="text-xs text-slate-500">{patient.age} / {patient.gender}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-slate-400">{patient.diagnosis || 'N/A'}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${patient.severity >= 4
                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                            : patient.severity === 3
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                            Level {patient.severity}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-400">{patient.status}</td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => handleEdit(patient)}
                                            className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors"
                                        >
                                            <FileText size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
