import { useState, useEffect } from 'react';
import api from '../../api/axios'; // Use configured Axios
import { BedDouble, User, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const BedManagement = () => {
    // ... (state)

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const response = await api.get('/staff/beds');
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
            await api.post('/staff/beds', { ...newBedData, status: 'AVAILABLE' });
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
            await api.put(`/staff/beds/${id}/toggle`);
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
                <div className="bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-800">
                    <p className="text-slate-400">Total Capacity</p>
                    <h3 className="text-3xl font-bold text-slate-200">{stats.total} Beds</h3>
                </div>
                <div className="bg-green-900/20 p-6 rounded-xl border border-green-800/40">
                    <p className="text-green-500">Available</p>
                    <h3 className="text-3xl font-bold text-green-400">{stats.available} Beds</h3>
                </div>
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-800/40">
                    <p className="text-red-500">Occupied / Unavail</p>
                    <h3 className="text-3xl font-bold text-red-400">{stats.occupied + stats.unavailable} Beds</h3>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6 text-sm border-b border-zinc-800 pb-1">
                {wards.map(ward => (
                    <button
                        key={ward}
                        onClick={() => setFilter(ward)}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === ward ? 'border-violet-600 text-violet-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {ward === 'GENERAL' ? 'General' : ward === 'EMERGENCY' ? 'Emergency' : ward} Only
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
                        className={`p-4 rounded-xl border-2 flex flex-col justify-between h-40 transition-all cursor-default ${bed.status === 'AVAILABLE' ? 'bg-zinc-900 border-zinc-800' :
                            bed.status === 'OCCUPIED' ? 'bg-red-900/10 border-red-900/50' :
                                'bg-zinc-800 border-zinc-700 opacity-75'
                            }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-200">{bed.bedNumber}</h3>
                                <p className="text-xs text-slate-500">{bed.ward} Ward</p>
                            </div>
                            <BedDouble size={20} className={bed.status === 'AVAILABLE' ? 'text-green-500' : 'text-slate-500'} />
                        </div>

                        <div>
                            {bed.status === 'OCCUPIED' ? (
                                <div className="flex items-center gap-2 text-sm text-red-400 bg-zinc-900 p-2 rounded-lg border border-red-900/50">
                                    <User size={14} />
                                    <span>{bed.patient ? bed.patient.name : 'Occupied'}</span>
                                </div>
                            ) : bed.status === 'UNAVAILABLE' ? (
                                <div className="text-sm text-slate-400 font-medium bg-zinc-800 p-2 rounded-lg text-center">
                                    Unavailable
                                </div>
                            ) : (
                                <div className="text-sm text-green-400 font-medium bg-green-900/20 p-2 rounded-lg text-center">
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
