import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CheckCircle, Search, UserCheck, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
    email: '',
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    roomType: 'Standard Room',
    diagnosis: '',
    ward: 'GENERAL'
};

const Admission = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [emailLookupState, setEmailLookupState] = useState('idle'); // idle | loading | found | not_found
    const [successData, setSuccessData] = useState(null);
    const [billData, setBillData] = useState(null);

    // ─── Load active (non-discharged) admitted patients ───────────────────────
    const fetchAdmittedPatients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admission/patients');
            // Extra client-side guard: exclude discharged
            setPatients((res.data || []).filter(p => p.status !== 'DISCHARGED'));
        } catch (err) {
            console.error('Failed to load patients', err);
            toast.error('Failed to load admission list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmittedPatients(); }, []);

    // ─── Email lookup: pre-fill form from DB ──────────────────────────────────
    const handleEmailLookup = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            toast.error('Enter a valid email to look up');
            return;
        }
        setEmailLookupState('loading');
        try {
            const res = await api.get(`/api/admission/patient-by-email?email=${encodeURIComponent(formData.email)}`);
            const p = res.data;
            setFormData(prev => ({
                ...prev,
                name: p.name || prev.name,
                age: p.age || prev.age,
                gender: p.gender || prev.gender,
                contact: p.contact || prev.contact,
                diagnosis: p.diagnosis || prev.diagnosis,
            }));
            setEmailLookupState('found');
            toast.success(`Patient found: ${p.name}`);
        } catch (err) {
            setEmailLookupState('not_found');
            toast('No existing patient found – you can enter details manually.', { icon: 'ℹ️' });
        }
    };

    // ─── Submit admission ─────────────────────────────────────────────────────
    const handleAdmission = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/admission/admit', formData);
            setSuccessData(response.data);
            setShowForm(false);
            setFormData(EMPTY_FORM);
            setEmailLookupState('idle');

            // Add the newly admitted patient to the local list
            if (response.data?.patient) {
                setPatients(prev => [...prev, response.data.patient]);
            }
            toast.success('Patient admitted successfully');
        } catch (error) {
            console.error('Admission failed', error);
            toast.error('Admission Failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    // ─── Discharge ────────────────────────────────────────────────────────────
    const handleDischarge = async (id) => {
        try {
            const response = await api.post(`/api/admission/${id}/discharge`);
            setBillData(response.data);
            // Remove discharged patient from active list immediately
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success('Patient discharged successfully');
        } catch (error) {
            console.error('Discharge failed', error);
            toast.error('Discharge Failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this patient record?')) return;
        try {
            await api.delete(`/api/admission/patients/${id}`);
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success('Record deleted');
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Delete Failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    // ─── Bill download ────────────────────────────────────────────────────────
    const downloadBill = () => {
        if (!billData) return;
        const content = `Hospital Bill - ${billData.patient.name}\n-----------------------------------\nPatient ID: ${billData.patient.id}\nRoom Type: ${billData.patient.roomType}\nAdmission Date: ${billData.patient.admissionDate}\nDischarge Date: ${billData.patient.dischargeDate}\nDays Stayed: ${billData.daysStayed}\nRoom Rent Per Day: ₹${billData.patient.roomRentPerDay}\n-----------------------------------\nTotal Billed Amount: ₹${billData.totalRent}\n`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bill_${billData.patient.name.replace(/\s+/g, '_')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patients...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200">Patient Admission</h1>
                    <p className="text-slate-400">Search by patient email or enter details manually</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setSuccessData(null); setFormData(EMPTY_FORM); setEmailLookupState('idle'); }}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} /> New Admission
                </button>
            </div>

            {/* ── Success banner ── */}
            {successData && (
                <div className="mb-6 bg-green-900/20 border border-green-800/50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-900/40 p-3 rounded-full text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-300">Admission Successful</h3>
                            <p className="text-green-400">
                                Patient <strong>{successData.patient?.name}</strong> assigned to Bed&nbsp;
                                <strong>{successData.bed?.bedNumber}</strong> ({successData.bed?.ward})
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

            {/* ── Admission Form ── */}
            {showForm && (
                <div className="mb-8 bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-800">
                    <h3 className="font-bold text-slate-200 mb-4">Admit Patient</h3>

                    {/* Email Lookup Row */}
                    <div className="mb-5 p-4 bg-zinc-950 border border-violet-500/20 rounded-lg">
                        <label className="block text-sm font-semibold text-violet-400 mb-2">
                            Step 1 — Enter Patient Email to Auto-Fill Details
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="patient@example.com"
                                className="flex-1 p-3 border border-zinc-700 bg-zinc-900 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.email}
                                onChange={e => {
                                    setFormData({ ...formData, email: e.target.value });
                                    setEmailLookupState('idle');
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleEmailLookup}
                                disabled={emailLookupState === 'loading'}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60"
                            >
                                {emailLookupState === 'loading'
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <Search size={18} />}
                                {emailLookupState === 'loading' ? 'Looking…' : 'Search'}
                            </button>
                        </div>
                        {emailLookupState === 'found' && (
                            <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                <UserCheck size={14} /> Patient found — details pre-filled below.
                            </p>
                        )}
                        {emailLookupState === 'not_found' && (
                            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                                <XCircle size={14} /> Not in system — fill in details manually.
                            </p>
                        )}
                    </div>

                    {/* Patient Detail Fields */}
                    <p className="text-sm font-semibold text-slate-400 mb-3">Step 2 — Confirm / Complete Details</p>
                    <form onSubmit={handleAdmission} className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Full Name *"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                placeholder="Age *"
                                className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg w-1/3 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                            <select
                                className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <input
                            placeholder="Contact Number *"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Initial Diagnosis *"
                            className="p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.diagnosis}
                            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                            required
                        />

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ward (Auto-Assign Bed)</label>
                            <select
                                className="w-full p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.ward}
                                onChange={e => setFormData({ ...formData, ward: e.target.value })}
                            >
                                <option value="GENERAL">General Ward</option>
                                <option value="ICU">ICU (Intensive Care)</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Room Type</label>
                            <select
                                className="w-full p-3 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={formData.roomType}
                                onChange={e => setFormData({ ...formData, roomType: e.target.value })}
                            >
                                <option value="Standard Room">Standard Room (₹1000/day)</option>
                                <option value="Semi-Private">Semi-Private (₹2500/day)</option>
                                <option value="Private Room">Private Room (₹5000/day)</option>
                            </select>
                        </div>

                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setEmailLookupState('idle'); }}
                                className="px-6 py-2 text-slate-400 hover:bg-zinc-800 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700">
                                Confirm Admission &amp; Book Room
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Admitted Patients List ── */}
            <div className="space-y-4">
                {patients.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-zinc-800 rounded-xl">
                        No active admissions
                    </div>
                )}
                {patients.map(patient => (
                    <div key={patient.id} className="p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between bg-zinc-900 border-zinc-800 hover:border-violet-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-violet-900/40 text-violet-400">
                                {patient.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-200">
                                    {patient.name}
                                    <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-slate-400 border border-zinc-700 text-xs rounded-full">
                                        {patient.roomType || 'Standard Room'}
                                    </span>
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-semibold ${
                                        patient.status === 'ADMITTED' ? 'bg-green-900/30 text-green-400 border border-green-700/40'
                                        : patient.status === 'WAITING' ? 'bg-amber-900/30 text-amber-400 border border-amber-700/40'
                                        : 'bg-zinc-800 text-slate-400 border border-zinc-700'
                                    }`}>
                                        {patient.status}
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {patient.diagnosis} • Admitted: {patient.admissionDate}
                                    {patient.email && <span className="ml-2 text-slate-600">• {patient.email}</span>}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => handleDischarge(patient.id)}
                                className="text-sm bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600 hover:text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Discharge &amp; Bill
                            </button>
                            <button
                                onClick={() => handleDelete(patient.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Delete Record"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bill Modal ── */}
            {billData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                        <div className="absolute top-4 right-4 text-green-400 bg-green-900/30 p-2 rounded-full">
                            <CheckCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-6">Patient Discharged</h2>
                        <div className="space-y-3 mb-8 bg-zinc-950 p-4 border border-zinc-800 rounded-lg text-sm">
                            {[
                                ['Patient Name', billData.patient?.name],
                                ['Room Type', billData.patient?.roomType],
                                ['Admission Date', billData.patient?.admissionDate],
                                ['Discharge Date', billData.patient?.dischargeDate],
                                ['Days Stayed', `${billData.daysStayed} Days`],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-slate-400">{label}</span>
                                    <span className="text-slate-100 font-medium">{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2">
                                <span className="text-slate-300 font-bold">Total Final Bill</span>
                                <span className="text-green-400 font-bold text-xl">₹{billData.totalRent}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={downloadBill}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-bold transition-all"
                            >
                                Download Bill
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
        </div>
    );
};

export default Admission;
