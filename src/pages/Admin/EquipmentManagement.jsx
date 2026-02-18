import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EquipmentManagement = () => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/equipment');
            setEquipmentList(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch equipment.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/admin/equipment/${editId}`, formData);
            } else {
                await api.post('/api/admin/equipment', formData);
            }
            setShowModal(false);
            setFormData({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
            setEditId(null);
            fetchEquipment();
        } catch (err) {
            setError('Failed to save equipment.');
        }
    };

    const handleEdit = (eq) => {
        setFormData({
            name: eq.name,
            type: eq.type,
            status: eq.status,
            handlerName: eq.handlerName || 'Unassigned'
        });
        setEditId(eq.id);
        setShowModal(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/api/admin/equipment/${id}/toggle`);
            fetchEquipment();
        } catch (err) {
            console.error(err);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
        setEditId(null);
        setShowModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 text-white">Equipment Management</h1>
                    <p className="text-slate-500">Manage hospital assets and inventory</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                >
                    <Plus size={20} /> Add Equipment
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <div className="bg-black rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold  text-white">Name</th>
                            <th className="p-4 font-semibold  text-white">Type</th>
                            <th className="p-4 font-semibold  text-white">Status</th>
                            <th className="p-4 font-semibold  text-white">Handler</th>
                            <th className="p-4 font-semibold  text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500  text-white">Loading equipment...</td></tr>
                        ) : equipmentList.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No equipment found.</td></tr>
                        ) : (
                            equipmentList.map((eq) => (
                                <tr key={eq.id} className="hover:bg-purple transition-colors">
                                    <td className="p-4 font-medium text-slate-800  text-white">{eq.name}</td>
                                    <td className="p-4 text-slate-600  text-white">{eq.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${eq.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            eq.status === 'IN_USE' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {eq.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600  text-white">{eq.handlerName || 'Unassigned'}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleEdit(eq)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleToggleStatus(eq.id)} className="text-purple-600 hover:bg-purple-50 p-2 rounded-lg" title="Toggle Status">
                                            {eq.status === 'AVAILABLE' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Diagnostics">Diagnostics</option>
                                    <option value="Critical Care">Critical Care</option>
                                    <option value="Monitoring">Monitoring</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Handler (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.handlerName}
                                    onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                                    placeholder="e.g. Staff Name"
                                />
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentManagement;
