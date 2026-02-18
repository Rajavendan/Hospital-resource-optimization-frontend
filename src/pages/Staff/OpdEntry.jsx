import React, { useState } from 'react';
import api from '../../api/axios';
import { UserPlus, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const OpdEntry = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contact: '',
        email: '', // Added Email
        diagnosis: '',
        severity: 1
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [assignedDoctor, setAssignedDoctor] = useState(null);

    // New State for Fee Collection
    const [registeredPatientId, setRegisteredPatientId] = useState(null);
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [feeLoading, setFeeLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setAssignedDoctor(null);
        setRegisteredPatientId(null); // Reset

        try {
            const response = await api.post('/api/staff/opd', formData);
            setAssignedDoctor(response.data.assignedDoctor);
            setRegisteredPatientId(response.data.id); // Capture ID
            setMessage({ type: 'success', text: 'Patient registered and doctor assigned successfully! Please collect fee.' });
            setFormData({
                name: '',
                age: '',
                gender: 'Male',
                contact: '',
                diagnosis: '',
                severity: 1
            });
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Failed to register patient. Please check system status.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleCollectFee = async () => {
        if (!registeredPatientId) return;
        setFeeLoading(true);
        try {
            await api.post('/api/staff/collect-fee', {
                patientId: registeredPatientId,
                paymentMode: paymentMode,
                appointmentId: null // Walk-in
            });
            setMessage({ type: 'success', text: 'Consultation Fee Collected & Invoice Generated.' });
            setRegisteredPatientId(null); // Hide UI after success
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to collect fee.' });
        } finally {
            setFeeLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-zinc-900 rounded-xl shadow-sm border border-zinc-800">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <UserPlus className="text-violet-500" />
                OPD Patient Registration
            </h2>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {assignedDoctor && (
                <div className="mb-8 p-4 bg-violet-900/20 border border-violet-800/50 rounded-lg">
                    <h3 className="font-semibold text-violet-300 mb-2">Assigned Doctor</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg text-slate-200">{assignedDoctor.name}</p>
                            <p className="text-sm text-violet-400">{assignedDoctor.specialization}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold bg-violet-900/50 text-violet-300 px-2 py-1 rounded">
                                OPD #{assignedDoctor.currentWorkload}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Patient Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            required
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Age"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Contact Number</label>
                        <input
                            type="tel"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Phone Number"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address (Optional)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        placeholder="Enter email for patient login (optional)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Symptoms / Diagnosis</label>
                    <textarea
                        name="diagnosis"
                        required
                        value={formData.diagnosis}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none h-24"
                        placeholder="Describe symptoms..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Priority (Severity)</label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <label key={level} className={`flex-1 cursor-pointer border rounded-lg p-2 text-center transition-colors ${formData.severity === level
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'hover:bg-zinc-800 border-zinc-700 bg-zinc-950 text-slate-400'
                                }`}>
                                <input
                                    type="radio"
                                    name="severity"
                                    value={level}
                                    checked={formData.severity === level}
                                    onChange={() => setFormData(prev => ({ ...prev, severity: level }))}
                                    className="hidden"
                                />
                                <div className="font-bold">{level}</div>
                                <div className="text-[10px] uppercase">{level === 1 ? 'Low' : level === 5 ? 'Critical' : 'Med'}</div>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Registering...' : <><UserPlus size={20} /> Register & Assign Doctor</>}
                </button>
            </form>

            {registeredPatientId && (
                <div className="mt-8 p-6 bg-emerald-900/10 border border-emerald-800/50 rounded-xl">
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <CheckCircle /> Collect Consultation Fee
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300">Consultation Fee</span>
                        <span className="text-xl font-bold text-white">₹500</span>
                    </div>
                    <div className="flex gap-4 mb-4">
                        {['CASH', 'UPI', 'CARD'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setPaymentMode(mode)}
                                className={`flex-1 py-2 rounded-lg border font-semibold transition ${paymentMode === mode
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/20'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCollectFee}
                        disabled={feeLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        {feeLoading ? 'Processing...' : 'Confirm Payment & Generate Invoice'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OpdEntry;
