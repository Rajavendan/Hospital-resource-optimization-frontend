import { useState, useEffect } from 'react';
import api from '../../api/axios'; // Use configured Axios
import { BedDouble, User, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBedData, setNewBedData] = useState({ ward: 'ICU', bedNumber: '' });

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const response = await api.get('/api/staff/beds');
            setBeds(response.data);
        } catch (error) {
            console.error("Failed to fetch beds", error);
            // Could add toast here too if desired, filtering noise
        } finally {
            setLoading(false);
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/staff/beds', { ...newBedData, status: 'AVAILABLE' });
            setShowAddForm(false);
            setNewBedData({ ward: 'ICU', bedNumber: '' });
            fetchBeds(); // Refresh list
            toast.success("Bed added successfully");
        } catch (error) {
            console.error("Failed to add bed", error);
            toast.error("Failed to add bed");
        }
    };

    const toggleBedStatus = async (id) => {
        try {
            await api.put(`/api/staff/beds/${id}/toggle`);
            fetchBeds();
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    const displayedBeds = filter === 'All' ? beds : beds.filter(b => b.ward === filter);
    const wards = ['All', 'ICU', 'General', 'Emergency'];

    const getStats = () => ({
        total: beds.length,
        available: beds.filter(b => b.status === 'AVAILABLE').length,
        occupied: beds.filter(b => b.status === 'OCCUPIED').length, // Mapped from backend status
        unavailable: beds.filter(b => b.status === 'UNAVAILABLE').length
    });

    const stats = getStats();

    if (loading) return <div className="p-8 text-center text-slate-400">Loading beds...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-200">Bed Management</h1>
                <div></div>
            </div>

            {/* Add Bed Form Removed for Staff */}

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 rounded-xl border border-blue-500/30 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <p className="text-blue-300 font-medium z-10 relative">Total Capacity</p>
                    <h3 className="text-4xl font-bold text-white mt-2 z-10 relative drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{stats.total} Beds</h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 p-6 rounded-xl border border-emerald-500/30 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <p className="text-emerald-300 font-medium z-10 relative">Available</p>
                    <h3 className="text-4xl font-bold text-white mt-2 z-10 relative drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{stats.available} Beds</h3>
                </div>
                <div className="bg-gradient-to-br from-rose-600/20 to-red-600/20 p-6 rounded-xl border border-rose-500/30 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <p className="text-rose-300 font-medium z-10 relative">Occupied / Unavail</p>
                    <h3 className="text-4xl font-bold text-white mt-2 z-10 relative drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">{stats.occupied + stats.unavailable} Beds</h3>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-1">
                {wards.map(ward => (
                    <button
                        key={ward}
                        onClick={() => setFilter(ward)}
                        className={`px-4 py-3 font-medium text-sm transition-all relative ${filter === ward ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {ward === 'GENERAL' ? 'General' : ward === 'EMERGENCY' ? 'Emergency' : ward} Only
                        {filter === ward && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedBeds.map(bed => (
                    <div key={bed.id}
                        onClick={() => {
                            // Read-only
                        }}
                        className={`p-5 rounded-xl border flex flex-col justify-between h-44 transition-all duration-300 relative overflow-hidden group ${bed.status === 'AVAILABLE' ? 'bg-[#0f1014] border-white/5 hover:border-emerald-500/30' :
                            bed.status === 'OCCUPIED' ? 'bg-[#0f1014] border-white/5 hover:border-rose-500/30' :
                                'bg-[#0f1014]/50 border-white/5 opacity-60'
                            }`}>

                        {/* Status Glow for Card */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${bed.status === 'AVAILABLE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                            bed.status === 'OCCUPIED' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' :
                                'bg-slate-700'
                            }`}></div>

                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <h3 className="text-xl font-bold text-slate-200 tracking-tight">{bed.bedNumber}</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{bed.ward} Ward</p>
                            </div>
                            <BedDouble size={22} className={`${bed.status === 'AVAILABLE' ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-600'}`} />
                        </div>

                        <div className="pl-3">
                            {bed.status === 'OCCUPIED' ? (
                                <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                    <User size={14} />
                                    <span className="truncate">{bed.patient ? bed.patient.name : 'Occupied'}</span>
                                </div>
                            ) : bed.status === 'UNAVAILABLE' ? (
                                <div className="text-sm text-slate-500 font-medium bg-slate-800/20 p-2 rounded-lg text-center border border-white/5">
                                    Unavailable
                                </div>
                            ) : (
                                <div className="text-sm text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg text-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    Available
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BedManagement;
