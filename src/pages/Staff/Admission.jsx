import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useData } from '../../context/DataContext';
import { Plus, Search, Bed, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Admission = () => {
    const { removePatient, patients, loading, setPatients } = useData();

    const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contact: '', severity: 1, diagnosis: '', ward: 'GENERAL' });
    const [showForm, setShowForm] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleAdmission = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/admission/admit', formData);
            setSuccessData(response.data); // Contains { message, patient, bed }
            setShowForm(false);
            setFormData({ name: '', age: '', gender: 'Male', contact: '', severity: 1, diagnosis: '', ward: 'GENERAL' });

            // Update context state with new patient
            if (response.data && response.data.patient) {
                setPatients(prev => [...prev, response.data.patient]);
            }

            toast.success("Patient admitted successfully");
        } catch (error) {
            console.error("Admission failed", error);
            toast.error("Admission Failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this admission record?")) {
            await removePatient(id);
            // Context removePatient already updates the state
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patients...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200">Patient Admission</h1>
                    <p className="text-slate-400">Manage patient registration and triage</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setSuccessData(null); }}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} /> New Admission
                </button>
            </div>

            {/* Success Message with Assigned Bed */}
            {successData && (
                <div className="mb-6 bg-green-900/20 border border-green-800/50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between animate-in slide-in-from-top">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-900/40 p-3 rounded-full text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-300">Admission Successful</h3>
                            <p className="text-green-400">
                                Patient <strong>{successData.patient.name}</strong> assigned to Bed <strong>{successData.bed.bedNumber}</strong> ({successData.bed.ward})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSuccessData(null)}
                        className="mt-4 md:mt-0 text-sm bg-zinc-900 text-green-400 border border-green-800/50 px-4 py-2 rounded-lg hover:bg-green-900/20"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {showForm && (
                <div className="mb-8 bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-800 animate-in slide-in-from-top duration-300">
                    <h3 className="font-bold text-slate-200 mb-4">Admit New Patient</h3>
                    <form onSubmit={handleAdmission} className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Full Name"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                placeholder="Age"
                                className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg w-1/3 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                            <select
                                className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>

                        {/* Ward Selection */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ward Selection (Auto-Assign Bed)</label>
                            <select
                                className="w-full p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                            >
                                <option value="GENERAL">General Ward</option>
                                <option value="ICU">ICU (Intensive Care)</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>

                        <input
                            placeholder="Contact Number"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Initial Diagnosis"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            required
                        />
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Severity Level (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <button
                                        type="button"
                                        key={lvl}
                                        onClick={() => setFormData({ ...formData, severity: lvl })}
                                        className={`flex-1 py-3 rounded-lg font-bold border transition-all ${formData.severity === lvl ? 'bg-red-600 text-white border-red-600' :
                                            'bg-zinc-950 text-slate-400 border-zinc-700 hover:bg-zinc-900'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Level 5 indicates immediate critical care needed.</p>
                        </div>

                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-slate-400 hover:bg-zinc-800 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700">Submit Admission</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {patients.map(patient => (
                    <div key={patient.id} className={`p-4 rounded-xl border flex items-center justify-between ${patient.severity >= 4 ? 'bg-red-900/10 border-red-900/40' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${patient.severity >= 4 ? 'bg-red-900/40 text-red-500' : 'bg-zinc-800 text-slate-400'
                                }`}>
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`font-bold ${patient.severity >= 4 ? 'text-red-400' : 'text-slate-200'}`}>
                                    {patient.name}
                                    {patient.severity >= 4 && <span className="ml-2 px-2 py-0.5 bg-red-900/40 text-red-400 text-xs rounded-full">CRITICAL</span>}
                                </h3>
                                <p className="text-sm text-slate-500">{patient.diagnosis} • Admitted: {patient.admissionDate}</p>
                            </div>
                        </div>

                        {/* We could fetch assigned bed via a separate call or from patient object if expanded */}
                        <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            title="Delete Record"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Admission;
