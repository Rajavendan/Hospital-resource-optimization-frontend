import React, { useState } from 'react';
import api from '../../api/axios';
import { UserPlus, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const OpdEntry = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contact: '',
        diagnosis: '',
        severity: 1
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [assignedDoctor, setAssignedDoctor] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setAssignedDoctor(null);

        try {
            const response = await api.post('/api/staff/opd', formData);
            setAssignedDoctor(response.data.assignedDoctor);
            setMessage({ type: 'success', text: 'Patient registered and doctor assigned successfully!' });
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
            setMessage({ type: 'error', text: 'Failed to register patient. Please check system status.' });
        } finally {
            setLoading(false);
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
                        <label className="block text-sm font-medium text-slate-400 mb-1">Contact</label>
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
        </div>
    );
};

export default OpdEntry;
