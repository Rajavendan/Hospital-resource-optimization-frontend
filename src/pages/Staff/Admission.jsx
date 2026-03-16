import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useData } from '../../context/DataContext';
import { Plus, Search, Bed, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Admission = () => {
    const { removePatient, patients, loading, setPatients } = useData();

    const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contact: '', roomType: 'Standard Room', diagnosis: '', ward: 'GENERAL' });
    const [showForm, setShowForm] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [billData, setBillData] = useState(null); // To store and show bill modal

    const handleAdmission = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/admission/admit', formData);
            setSuccessData(response.data); // Contains { message, patient, bed }
            setShowForm(false);
            setFormData({ name: '', age: '', gender: 'Male', contact: '', roomType: 'Standard Room', diagnosis: '', ward: 'GENERAL' });

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


    const handleDischarge = async (id) => {
        try {
            const response = await api.post(`/api/admission/${id}/discharge`);
            setBillData(response.data); // sets patient, daysStayed, totalRent
            
            // Immediately remove the patient from the list or mark as discharged locally
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success("Patient Discharged Successfully");
        } catch (error) {
            console.error("Discharge failed", error);
            toast.error("Discharge Failed: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patients...</div>;

    const downloadBill = () => {
        if (!billData) return;
        const content = `Hospital Bill - ${billData.patient.name}\n-----------------------------------\nPatient ID: ${billData.patient.id}\nRoom Type: ${billData.patient.roomType}\nAdmission Date: ${billData.patient.admissionDate}\nDischarge Date: ${billData.patient.dischargeDate}\nDays Stayed: ${billData.daysStayed}\nRoom Rent Per Day: $${billData.patient.roomRentPerDay}\n-----------------------------------\nTotal Billed Amount: $${billData.totalRent}\n`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bill_${billData.patient.name.replace(/\s+/g, '_')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
                            <label className="block text-sm font-medium text-slate-400 mb-2">Type of Room</label>
                            <select
                                className="w-full p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.roomType}
                                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                            >
                                <option value="Standard Room">Standard Room ($1000/day)</option>
                                <option value="Semi-Private">Semi-Private ($2500/day)</option>
                                <option value="Private Room">Private Room ($5000/day)</option>
                            </select>
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
                    <div key={patient.id} className="p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between bg-zinc-900 border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-violet-900/40 text-violet-400">
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-200">
                                    {patient.name}
                                    <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-slate-400 border border-zinc-700 text-xs rounded-full">{patient.roomType || 'Standard Room'}</span>
                                </h3>
                                <p className="text-sm text-slate-500">{patient.diagnosis} • Admitted: {patient.admissionDate}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => handleDischarge(patient.id)}
                                className="text-sm bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600 hover:text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Discharge & Bill
                            </button>
                            <button
                                onClick={() => handleDelete(patient.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Delete Record"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bill Modal */}
            {billData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                        <div className="absolute top-4 right-4 text-green-400 bg-green-900/30 p-2 rounded-full">
                            <CheckCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-6">Patient Discharged</h2>
                        <div className="space-y-4 mb-8 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-slate-400">Patient Name</span>
                                <span className="text-slate-100 font-medium">{billData.patient.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-slate-400">Room Type</span>
                                <span className="text-slate-100 font-medium">{billData.patient.roomType}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-slate-400">Admission Date</span>
                                <span className="text-slate-100 font-medium">{billData.patient.admissionDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-slate-400">Days Stayed</span>
                                <span className="text-slate-100 font-medium">{billData.daysStayed} Days</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-slate-300 font-bold">Total Final Bill</span>
                                <span className="text-green-400 font-bold text-xl">${billData.totalRent}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={downloadBill}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-bold transition-all"
                            >
                                Download Bill .txt
                            </button>
                            <button 
                                onClick={() => setBillData(null)}
                                className="px-6 py-3 bg-zinc-800 text-slate-300 hover:bg-zinc-700 rounded-lg font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Admission;
