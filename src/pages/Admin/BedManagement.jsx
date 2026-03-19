import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    BedDouble, 
    User, 
    Plus, 
    X, 
    Clock, 
    Search, 
    ChevronRight, 
    Activity, 
    MapPin, 
    AlertCircle,
    Calendar,
    Thermometer
} from 'lucide-react';
import toast from 'react-hot-toast';

const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [newBedData, setNewBedData] = useState({ ward: 'ICU', bedNumber: '' });
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const response = await api.get('/api/admin/beds');
            setBeds(response.data);
        } catch (error) {
            toast.error('Failed to load beds');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/beds', { ...newBedData, status: 'AVAILABLE' });
            setShowAddModal(false);
            setNewBedData({ ward: 'ICU', bedNumber: '' });
            fetchBeds();
            toast.success('Bed added successfully');
        } catch {
            toast.error('Failed to add bed');
        }
    };

    const toggleBedStatusFromDetail = async () => {
        if (!selectedBed) return;
        try {
            await api.put(`/api/admin/beds/${selectedBed.id}/toggle`);
            setShowDetailModal(false);
            fetchBeds();
            toast.success('Bed status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleCardClick = (bed) => {
        setSelectedBed(bed);
        setShowDetailModal(true);
    };

    const displayedBeds = searchQuery.trim() !== ''
        ? beds.filter(b => b.patient && b.patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : filter === 'All' ? beds : beds.filter(b => b.ward === filter);

    const wards = ['All', 'ICU', 'GENERAL', 'EMERGENCY'];

    const getDaysAdmitted = (admissionDateStr) => {
        if (!admissionDateStr) return 0;
        const admissionDate = new Date(admissionDateStr);
        const today = new Date();
        const diffTime = Math.abs(today - admissionDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 rounded-xl">
                                <BedDouble className="text-blue-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Bed Management</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            Real-time ward occupancy and patient tracking
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={20} />
                        Add New Bed
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search patients occupying beds..."
                            className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {wards.map(w => (
                            <button
                                key={w}
                                onClick={() => setFilter(w)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                                    filter === w 
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {w} Ward
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bed Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : displayedBeds.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BedDouble className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Beds Found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search</p>
                        </div>
                    ) : (
                        displayedBeds.map(bed => (
                            <div
                                key={bed.id}
                                onClick={() => handleCardClick(bed)}
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 transform active:scale-[0.98] cursor-pointer overflow-hidden
                                    ${bed.status === 'AVAILABLE'
                                        ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                                        : bed.status === 'OCCUPIED'
                                            ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10'
                                            : 'bg-slate-900/50 border-white/5 opacity-50'
                                    }`}
                            >
                                {/* Decorative Gradient */}
                                <div className={`absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-20 rounded-full ${bed.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{bed.bedNumber}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <MapPin size={12} className="text-slate-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {bed.ward} Unit
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl ${bed.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        <BedDouble size={20} />
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    {bed.status === 'OCCUPIED' ? (
                                        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                                <User size={14} className="text-rose-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold leading-none mb-1 text-white">Occupant</p>
                                                <p className="text-sm font-bold text-white truncate">
                                                    {bed.patient?.name || 'Assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <Activity size={14} className="text-emerald-400" />
                                            </div>
                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                                Ready to use
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* FAB for Mobile */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition-all active:scale-90 z-40"
                >
                    <Plus size={32} />
                </button>

                {/* Detail Modal */}
                {showDetailModal && selectedBed && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Modal Header */}
                            <div className={`h-32 relative ${selectedBed.status === 'OCCUPIED' ? 'bg-gradient-to-r from-rose-600 to-orange-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        {selectedBed.ward} Ward
                                    </div>
                                </div>
                            </div>

                            {/* Icon/Status Indicator */}
                            <div className="px-6 relative">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className={`w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-bold ${selectedBed.status === 'OCCUPIED' ? 'bg-gradient-to-br from-rose-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                                        <BedDouble size={40} />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 pt-0 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white leading-tight">Bed {selectedBed.bedNumber}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${selectedBed.status === 'AVAILABLE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-widest ${selectedBed.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {selectedBed.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedBed.status === 'OCCUPIED' ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                                                <User size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 text-white">Patient Name</p>
                                                <p className="text-xl font-bold text-white truncate">{selectedBed.patient?.name}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-rose-400 mb-2">
                                                    <Calendar size={16} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Admission</span>
                                                </div>
                                                <p className="text-white font-bold">{new Date(selectedBed.patient?.admissionDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-orange-400 mb-2">
                                                    <Clock size={16} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Duration</span>
                                                </div>
                                                <p className="text-white font-bold">{getDaysAdmitted(selectedBed.patient?.admissionDate)} Days</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-start gap-3">
                                            <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-orange-200/80">
                                                Patient is currently admitted in this bed. Status can only be changed once the patient has been discharged.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-8 bg-emerald-500/5 rounded-3xl border-2 border-dashed border-emerald-500/20 flex flex-col items-center text-center">
                                            <Activity size={48} className="text-emerald-500/20 mb-4" />
                                            <p className="text-emerald-400 font-bold tracking-tight">Ready for Admission</p>
                                            <p className="text-slate-500 text-sm mt-2 max-w-[200px]">
                                                This bed is sterilized and available for new patients in {selectedBed.ward} unit.
                                            </p>
                                        </div>
                                        
                                        <button
                                            onClick={toggleBedStatusFromDetail}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
                                        >
                                            <Thermometer size={18} />
                                            Mark as Maintenance
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Bed Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                        <div className="relative bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-blue-600/20 rounded-lg">
                                        <Plus className="text-blue-500" size={20} />
                                    </div>
                                    New Bed Registration
                                </h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddBed} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Select Ward Unit</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['ICU', 'GENERAL', 'EMERGENCY'].map((w) => (
                                            <button
                                                key={w}
                                                type="button"
                                                onClick={() => setNewBedData({ ...newBedData, ward: w })}
                                                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                                                    newBedData.ward === w
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Bed Number / Identifier</label>
                                    <div className="relative group">
                                        <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
                                        <input
                                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                                            placeholder="e.g. ICU-01"
                                            value={newBedData.bedNumber}
                                            onChange={e => setNewBedData({ ...newBedData, bedNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Save Bed
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

export default BedManagement;
