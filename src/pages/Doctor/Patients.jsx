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
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Patient Records</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-100">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">ID</th>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Diagnosis</th>
                            <th className="p-4 font-semibold text-slate-600">Severity</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-400">
                                    No patients found.
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-500">#{patient.id}</td>
                                    <td className="p-4 font-medium text-slate-800">
                                        <div className="flex flex-col">
                                            <span>{patient.name}</span>
                                            <span className="text-xs text-slate-500">{patient.age} / {patient.gender}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{patient.diagnosis || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${patient.severity >= 4 ? 'bg-red-100 text-red-700' :
                                            patient.severity === 3 ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            Level {patient.severity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600">{patient.status}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleEdit(patient)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 flex justify-end z-50 transition-opacity">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Update Medical Record</h2>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-blue-900">{selectedPatient.name}</h3>
                                    <span className="text-sm text-blue-700">ID: #{selectedPatient.id}</span>
                                </div>
                                <p className="text-sm text-blue-800">{selectedPatient.diagnosis}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Medical Notes</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
