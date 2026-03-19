import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    Briefcase, 
    User, 
    ChevronRight, 
    Activity, 
    Settings, 
    X,
    Filter,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const EquipmentManagement = () => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

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
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/admin/equipment/${editId}`, formData);
                toast.success('Equipment updated');
            } else {
                await api.post('/api/admin/equipment', formData);
                toast.success('Equipment added');
            }
            setShowModal(false);
            setFormData({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
            setEditId(null);
            fetchEquipment();
        } catch (err) {
            toast.error('Failed to save equipment');
        }
    };

    const handleEditFromDetail = () => {
        const eq = selectedEquipment;
        setShowDetailModal(false);
        setFormData({
            name: eq.name,
            type: eq.type,
            status: eq.status,
            handlerName: eq.handlerName || 'Unassigned'
        });
        setEditId(eq.id);
        setShowModal(true);
    };

    const handleToggleStatusFromDetail = async () => {
        const id = selectedEquipment.id;
        try {
            await api.put(`/api/admin/equipment/${id}/toggle`);
            setShowDetailModal(false);
            fetchEquipment();
            toast.success('Status updated');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', type: '', status: 'AVAILABLE', handlerName: 'Unassigned' });
        setEditId(null);
        setShowModal(true);
    };

    const handleCardClick = (eq) => {
        setSelectedEquipment(eq);
        setShowDetailModal(true);
    };

    const filteredEquipment = equipmentList.filter(eq => {
        const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             eq.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || eq.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const categories = ['All', 'Diagnostics', 'Critical Care', 'Monitoring', 'Transport'];

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-cyan-600/20 rounded-xl">
                                <Briefcase className="text-cyan-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Equipment Management</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            Manage hospital assets, medical devices and medical inventory
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="hidden lg:flex items-center gap-2 bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20"
                    >
                        <Plus size={20} />
                        Add Equipment
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by equipment name or category..."
                            className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                                    activeFilter === cat 
                                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-600/20' 
                                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-44 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredEquipment.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Equipment Found</h3>
                            <p className="text-slate-500">Try adjusting your category or search query</p>
                        </div>
                    ) : (
                        filteredEquipment.map((eq) => (
                            <div
                                key={eq.id}
                                onClick={() => handleCardClick(eq)}
                                className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                                            <Settings size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors truncate">
                                                {eq.name}
                                            </h3>
                                            <p className="text-cyan-300/60 text-xs font-semibold uppercase tracking-wider">
                                                {eq.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        eq.status === 'AVAILABLE' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : eq.status === 'IN_USE'
                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                        {eq.status.replace('_', ' ')}
                                    </div>
                                    <ChevronRight size={20} className="text-slate-700 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* FAB for Mobile */}
                <button
                    onClick={openCreateModal}
                    className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-cyan-600/40 hover:bg-cyan-700 transition-all active:scale-90 z-40"
                >
                    <Plus size={32} />
                </button>

                {/* Detail Modal */}
                {showDetailModal && selectedEquipment && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Modal Header */}
                            <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-700 relative">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        Asset No: #{selectedEquipment.id.toString().padStart(4, '0')}
                                    </div>
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="px-6 relative">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                                        <Settings size={40} />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 pt-0 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedEquipment.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Activity size={14} className="text-cyan-400" />
                                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">{selectedEquipment.type}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
                                        selectedEquipment.status === 'AVAILABLE' 
                                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                                            : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                                    }`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            selectedEquipment.status === 'AVAILABLE' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                                        }`}>
                                            {selectedEquipment.status === 'AVAILABLE' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 text-white">Inventory Status</p>
                                            <p className="text-xl font-bold uppercase">{selectedEquipment.status.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                            <User size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 text-white">Assigned Personnel</p>
                                            <p className="text-lg font-bold text-white truncate">{selectedEquipment.handlerName || 'No Personnel Assigned'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleEditFromDetail}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
                                        >
                                            <Edit2 size={18} />
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={handleToggleStatusFromDetail}
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border ${
                                                selectedEquipment.status === 'AVAILABLE' 
                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            }`}
                                        >
                                            {selectedEquipment.status === 'AVAILABLE' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                            Toggle Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upsert Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <div className="relative bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-cyan-600/20 rounded-lg">
                                        {editId ? <Edit2 className="text-cyan-500" size={20} /> : <Plus className="text-cyan-500" size={20} />}
                                    </div>
                                    {editId ? 'Update Inventory' : 'Add New Equipment'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-white">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1 text-white">Equipment Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. MRI Scanner X-100"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1 text-white">Equipment Category</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="" className="bg-slate-900">Select Category</option>
                                        <option value="Diagnostics" className="bg-slate-900">Diagnostics</option>
                                        <option value="Critical Care" className="bg-slate-900">Critical Care</option>
                                        <option value="Monitoring" className="bg-slate-900">Monitoring</option>
                                        <option value="Transport" className="bg-slate-900">Transport</option>
                                        <option value="Other" className="bg-slate-900">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1 text-white">Assigned Personnel (Optional)</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500" size={18} />
                                        <input
                                            type="text"
                                            value={formData.handlerName}
                                            onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="Technician/Doctor Name"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/20"
                                    >
                                        {editId ? 'Update Asset' : 'Register Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentManagement;
