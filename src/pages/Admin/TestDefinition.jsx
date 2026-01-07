import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const TestDefinition = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Updated Schema compliance: Name, Department, Cost, MaxCapacity, Description, Status
    const [formData, setFormData] = useState({
        name: '',
        department: 'General',
        cost: '',
        maxCapacity: 20,
        description: '',
        status: 'ACTIVE'
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/tests');
            setTests(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/admin/tests/${editId}`, formData);
            } else {
                await api.post('/api/admin/tests', formData);
            }
            setShowModal(false);
            setFormData({ name: '', department: 'General', cost: '', maxCapacity: 20, description: '', status: 'ACTIVE' });
            setEditId(null);
            fetchTests();
        } catch (err) {
            setError('Failed to save test.');
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', department: 'General', cost: '', maxCapacity: 20, description: '', status: 'ACTIVE' });
        setEditId(null);
        setShowModal(true);
    };

    const openEditModal = (test) => {
        setFormData({
            name: test.name,
            department: test.department,
            cost: test.cost,
            maxCapacity: test.maxCapacity,
            description: test.description || '',
            status: test.status || 'ACTIVE'
        });
        setEditId(test.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test?")) return;
        try {
            await api.delete(`/api/admin/tests/${id}`);
            fetchTests();
        } catch (err) {
            setError("Failed to delete test.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Test Definitions</h1>
                    <p className="text-slate-400 mt-1">Manage available medical tests</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="relative group bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-white/20 to-violet-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Plus size={20} /> <span className="font-semibold">Add Test Type</span>
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-slate-400 text-center col-span-full py-12">Loading tests...</p>
                ) : tests.map((test) => (
                    <div key={test.id} className="glass-card p-6 rounded-xl relative group border border-white/35 hover:border-violet-500/30 transition-all duration-300">
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>

                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => openEditModal(test)} className="p-2 text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(test.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="text-xl font-bold text-slate-100 pr-16">{test.name}</h3>
                        </div>

                        <div className="flex gap-2 mb-4 relative z-10">
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-md font-medium">{test.department}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${test.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                {test.status}
                            </span>
                        </div>

                        <p className="text-sm text-slate-400 mb-6 line-clamp-2 min-h-[2.5rem] relative z-10">{test.description || 'No description provided.'}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm relative z-10 border-t border-white/5 pt-4">
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Cost</p>
                                <p className="font-bold text-slate-200 text-lg">${test.cost}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Daily Cap</p>
                                <p className="font-bold text-slate-200 text-lg">{test.maxCapacity}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.2)]">
                        <h2 className="text-2xl font-bold mb-6 text-slate-100">{editId ? 'Edit Test' : 'Add Test Definition'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Test Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="e.g. MRI Scan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-600 min-h-[80px]"
                                    rows="2"
                                    placeholder="Brief description of the test..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50"
                                    >
                                        <option value="General">General</option>
                                        <option value="Pathology">Pathology</option>
                                        <option value="Radiology">Radiology</option>
                                        <option value="Cardiology">Cardiology</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Max Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.maxCapacity}
                                        onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Cost ($)</label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/50"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 font-semibold shadow-lg shadow-violet-900/20"
                                >
                                    {editId ? 'Update Test' : 'Create Test'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestDefinition;
