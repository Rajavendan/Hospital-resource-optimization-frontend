import { useState, useEffect } from 'react';
import api from '../../api/axios'; // Use configured Axios
import { BedDouble, User, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBedData, setNewBedData] = useState({ ward: 'ICU', bedNumber: '' });
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            const response = await api.get('/admin/beds');
            setBeds(response.data);
        } catch (error) {
            console.error("Failed to fetch beds", error);
            toast.error("Failed to load beds");
        } finally {
            setLoading(false);
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/beds', { ...newBedData, status: 'AVAILABLE' });
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
            await api.put(`/admin/beds/${id}/toggle`);
            fetchBeds();
            toast.success("Bed status updated");
        } catch (error) {
            console.error("Failed to toggle status", error);
            toast.error("Failed to update status");
        }
    };

    const displayedBeds = filter === 'All' ? beds : beds.filter(b => b.ward === filter);
    const wards = ['All', 'ICU', 'GENERAL', 'EMERGENCY'];

    const getStats = () => ({
        total: beds.length,
        available: beds.filter(b => b.status === 'AVAILABLE').length,
        occupied: beds.filter(b => b.status === 'OCCUPIED').length, // Mapped from backend status
        unavailable: beds.filter(b => b.status === 'UNAVAILABLE').length
    });

    const stats = getStats();

    if (loading) return <div className="p-8 text-center text-slate-500">Loading beds...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Bed Management</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    {showAddForm ? <X size={20} /> : <Plus size={20} />}
                    {showAddForm ? 'Close Form' : 'Add New Bed'}
                </button>
            </div>

            {/* Add Bed Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 animate-in slide-in-from-top">
                    <h3 className="font-bold text-slate-800 mb-4">Add New Bed</h3>
                    <form onSubmit={handleAddBed} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                            <select
                                className="w-full p-2 border border-slate-200 rounded-lg"
                                value={newBedData.ward}
                                onChange={e => setNewBedData({ ...newBedData, ward: e.target.value })}
                            >
                                <option value="ICU">ICU</option>
                                <option value="GENERAL">GENERAL</option>
                                <option value="EMERGENCY">EMERGENCY</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number (ID)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-200 rounded-lg"
                                placeholder="e.g. ICU-001"
                                value={newBedData.bedNumber}
                                onChange={e => setNewBedData({ ...newBedData, bedNumber: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                            Save Bed
                        </button>
                    </form>
                </div>
            )}

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-slate-500">Total Capacity</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.total} Beds</h3>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-green-600">Available</p>
                    <h3 className="text-3xl font-bold text-green-700">{stats.available} Beds</h3>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <p className="text-red-600">Occupied / Unavail</p>
                    <h3 className="text-3xl font-bold text-red-700">{stats.occupied + stats.unavailable} Beds</h3>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6 text-sm border-b border-slate-200 pb-1">
                {wards.map(ward => (
                    <button
                        key={ward}
                        onClick={() => setFilter(ward)}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === ward
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {ward === 'ALL'
                            ? 'All'
                            : ward === 'GENERAL'
                                ? 'General'
                                : ward === 'EMERGENCY'
                                    ? 'Emergency'
                                    : ward}
                    </button>
                ))}

            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedBeds.map(bed => (
                    <div key={bed.id}
                        onClick={() => {
                            // Only toggle manual availability if empty, logic could be refined
                            if (bed.status !== 'OCCUPIED') toggleBedStatus(bed.id);
                        }}
                        className={`p-4 rounded-xl border-2 flex flex-col justify-between h-40 transition-all cursor-pointer ${bed.status === 'AVAILABLE' ? 'bg-white border-slate-200 hover:border-green-400' :
                            bed.status === 'OCCUPIED' ? 'bg-red-50 border-red-100' :
                                'bg-slate-100 border-slate-200 opacity-75'
                            }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-700">{bed.bedNumber}</h3>
                                <p className="text-xs text-slate-500">{bed.ward} Ward</p>
                            </div>
                            <BedDouble size={20} className={bed.status === 'AVAILABLE' ? 'text-green-500' : 'text-slate-400'} />
                        </div>

                        <div>
                            {bed.status === 'OCCUPIED' ? (
                                <div className="flex items-center gap-2 text-sm text-red-700 bg-white p-2 rounded-lg border border-red-100">
                                    <User size={14} />
                                    <span>{bed.patient ? bed.patient.name : 'Occupied'}</span>
                                </div>
                            ) : bed.status === 'UNAVAILABLE' ? (
                                <div className="text-sm text-slate-500 font-medium bg-slate-200 p-2 rounded-lg text-center">
                                    Unavailable
                                </div>
                            ) : (
                                <div className="text-sm text-green-600 font-medium bg-green-50 p-2 rounded-lg text-center">
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
