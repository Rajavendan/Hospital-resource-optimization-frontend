import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Search, 
    XCircle, 
    ChevronRight, 
    Beaker, 
    DollarSign, 
    Users, 
    Activity, 
    X,
    Filter,
    Shield,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const TestDefinition = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

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
            toast.error('Failed to load test definitions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/admin/tests/${editId}`, formData);
                toast.success('Test definition updated');
            } else {
                await api.post('/api/admin/tests', formData);
                toast.success('New test type added');
            }
            setShowModal(false);
            setFormData({ name: '', department: 'General', cost: '', maxCapacity: 20, description: '', status: 'ACTIVE' });
            setEditId(null);
            fetchTests();
        } catch (err) {
            toast.error('Failed to save test definition');
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', department: 'General', cost: '', maxCapacity: 20, description: '', status: 'ACTIVE' });
        setEditId(null);
        setShowModal(true);
    };

    const handleEditFromDetail = () => {
        const test = selectedTest;
        setShowDetailModal(false);
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

    const handleDeleteFromDetail = async () => {
        if (!window.confirm("Are you sure you want to delete this test?")) return;
        const id = selectedTest.id;
        try {
            await api.delete(`/api/admin/tests/${id}`);
            setShowDetailModal(false);
            fetchTests();
            toast.success('Test deleted');
        } catch (err) {
            toast.error("Failed to delete test");
        }
    };

    const handleCardClick = (test) => {
        setSelectedTest(test);
        setShowDetailModal(true);
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             test.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || test.department === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const departments = ['All', 'General', 'Pathology', 'Radiology', 'Cardiology'];

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-violet-600/20 rounded-xl">
                                <Beaker className="text-violet-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Test Definitions</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            Configure diagnostics, pathology reports and clinical pricing
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="hidden lg:flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                    >
                        <Plus size={20} />
                        Add Test Type
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by test name or department..."
                            className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setActiveFilter(dept)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                                    activeFilter === dept 
                                        ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20' 
                                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {dept === 'All' ? 'All Departments' : dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tests Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredTests.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Beaker className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Tests Defined</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        filteredTests.map((test) => (
                            <div
                                key={test.id}
                                onClick={() => handleCardClick(test)}
                                className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 hover:border-violet-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-white font-bold group-hover:text-violet-400 transition-colors truncate text-lg">
                                            {test.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Shield size={12} className="text-slate-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {test.department}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                        test.status === 'ACTIVE' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                        {test.status}
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400 line-clamp-2 mt-2 flex-grow">
                                    {test.description || 'No detailed description provided for this diagnostic procedure.'}
                                </p>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Cost:</span>
                                        <span className="text-lg font-bold text-white">${test.cost}</span>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-700 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* FAB for Mobile */}
                <button
                    onClick={openCreateModal}
                    className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-violet-600/40 hover:bg-violet-700 transition-all active:scale-90 z-40"
                >
                    <Plus size={32} />
                </button>

                {/* Detail Modal */}
                {showDetailModal && selectedTest && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Header */}
                            <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-700 relative">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        {selectedTest.department} Dept
                                    </div>
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="px-6 relative text-white">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                                        <Beaker size={40} />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 pt-0 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedTest.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${selectedTest.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-widest ${selectedTest.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {selectedTest.status} Definition
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 text-white">
                                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Description</p>
                                            <p className="text-sm text-slate-200 leading-relaxed">
                                                {selectedTest.description || 'No clinical description available for this test definition.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-white">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Standard Cost</p>
                                                <p className="text-lg font-bold text-white">${selectedTest.cost}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Daily Cap</p>
                                                <p className="text-lg font-bold text-white">{selectedTest.maxCapacity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={handleEditFromDetail}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        <Edit2 size={18} />
                                        Update Test Configuration
                                    </button>
                                    <button
                                        onClick={handleDeleteFromDetail}
                                        className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-2xl font-bold transition-all border border-rose-500/20"
                                    >
                                        <Trash2 size={18} />
                                        Delete Test Definition
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upsert Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <div className="relative bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 text-white">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-violet-600/20 rounded-lg">
                                        {editId ? <Edit2 className="text-violet-500" size={20} /> : <Plus className="text-violet-500" size={20} />}
                                    </div>
                                    {editId ? 'Edit Configuration' : 'Add Test Definition'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Test Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Full Blood Count"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Clinical Category / Dept</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="General" className="bg-slate-900">General</option>
                                        <option value="Pathology" className="bg-slate-900">Pathology</option>
                                        <option value="Radiology" className="bg-slate-900">Radiology</option>
                                        <option value="Cardiology" className="bg-slate-900">Cardiology</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Unit Cost ($)</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500" size={18} />
                                            <input
                                                type="number"
                                                value={formData.cost}
                                                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Daily Capacity</label>
                                        <div className="relative group">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500" size={18} />
                                            <input
                                                type="number"
                                                value={formData.maxCapacity}
                                                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                                placeholder="20"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Definition Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['ACTIVE', 'INACTIVE'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status })}
                                                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                                                    formData.status === status
                                                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                                                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-600 min-h-[80px]"
                                        rows="2"
                                        placeholder="Brief procedure overview..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-violet-600/20"
                                    >
                                        {editId ? 'Config Update' : 'Define Test'}
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

export default TestDefinition;
