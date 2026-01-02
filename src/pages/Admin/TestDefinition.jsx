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
            const response = await api.get('/admin/tests');
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
                await api.put(`/admin/tests/${editId}`, formData);
            } else {
                await api.post('/admin/tests', formData);
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
            await api.delete(`/admin/tests/${id}`);
            fetchTests();
        } catch (err) {
            setError("Failed to delete test.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Test Definitions</h1>
                    <p className="text-slate-500">Manage available medical tests</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                >
                    <Plus size={20} /> Add Test Type
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-slate-400">Loading tests...</p>
                ) : tests.map((test) => (
                    <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(test)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(test.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">{test.name}</h3>
                            <div className="flex gap-2">
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">{test.department}</span>
                                <span className={`text-xs px-2 py-1 rounded-md ${test.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {test.status}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{test.description || 'No description provided.'}</p>
                        <div className="space-y-1 text-sm text-slate-500">
                            <p>Cost: <span className="font-medium text-slate-700">${test.cost}</span></p>
                            <p>Daily Capacity: <span className="font-medium text-slate-700">{test.maxCapacity}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Test' : 'Add Test Definition'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                                    >
                                        <option value="General">General</option>
                                        <option value="Pathology">Pathology</option>
                                        <option value="Radiology">Radiology</option>
                                        <option value="Cardiology">Cardiology</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.maxCapacity}
                                        onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
