import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BedDouble, User, Plus, X, Clock } from 'lucide-react';
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
      setShowAddForm(false);
      setNewBedData({ ward: 'ICU', bedNumber: '' });
      fetchBeds();
      toast.success('Bed added');
    } catch {
      toast.error('Failed to add bed');
    }
  };

  const toggleBedStatus = async (id) => {
    try {
      await api.put(`/api/admin/beds/${id}/toggle`);
      fetchBeds();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const displayedBeds = filter === 'All' ? beds : beds.filter(b => b.ward === filter);
  const wards = ['All', 'ICU', 'GENERAL', 'EMERGENCY'];

  if (loading) {
    return <div className="p-8 text-center text-white">Loading beds...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bed Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Close' : 'Add Bed'}
        </button>
      </div>

      {/* Add Bed Form */}
      {showAddForm && (
        <div className="bg-black border border-white/10 p-6 rounded-xl mb-8">
          <h3 className="font-bold mb-4">Add New Bed</h3>
          <form onSubmit={handleAddBed} className="flex gap-4">
            <select
              className="bg-black border border-white/20 p-2 rounded-lg text-white"
              value={newBedData.ward}
              onChange={e => setNewBedData({ ...newBedData, ward: e.target.value })}
            >
              <option>ICU</option>
              <option>GENERAL</option>
              <option>EMERGENCY</option>
            </select>

            <input
              className="bg-black border border-white/20 p-2 rounded-lg text-white"
              placeholder="Bed Number"
              value={newBedData.bedNumber}
              onChange={e => setNewBedData({ ...newBedData, bedNumber: e.target.value })}
              required
            />

            <button className="bg-green-600 hover:bg-green-700 px-6 rounded-lg">
              Save
            </button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        {wards.map(w => (
          <button
            key={w}
            onClick={() => setFilter(w)}
            className={`pb-2 border-b-2 ${filter === w ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400'
              }`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedBeds.map(bed => (
          <div
            key={bed.id}
            onClick={() => {
              if (bed.status !== 'OCCUPIED') toggleBedStatus(bed.id);
            }}
            className={`p-4 rounded-xl border-2 h-40 flex flex-col justify-between cursor-pointer transition-all bg-black
              ${bed.status === 'AVAILABLE'
                ? 'border-white/20 hover:border-green-400'
                : bed.status === 'OCCUPIED'
                  ? 'border-red-400'
                  : 'border-red-600'
              }`}
          >

            {/* Top */}
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{bed.bedNumber}</h3>
                <p className="text-xs text-slate-400">{bed.ward}</p>
              </div>
              <BedDouble
                size={20}
                className={
                  bed.status === 'AVAILABLE'
                    ? 'text-green-400'
                    : bed.status === 'OCCUPIED'
                      ? 'text-red-400'
                      : 'text-red-500'
                }
              />
            </div>

            {/* Status */}
            <div>
              {bed.status === 'OCCUPIED' && (
                <div className="flex items-center gap-2 text-sm bg-red-900/30 border border-red-500 p-2 rounded-lg">
                  <User size={14} />
                  {bed.patient?.name || 'Occupied'}
                </div>
              )}

              {bed.status === 'AVAILABLE' && (
                <div className="text-sm bg-green-900/30 border border-green-500 p-2 rounded-lg text-center">
                  Available
                </div>
              )}

              {bed.status === 'UNAVAILABLE' && (
                <div className="space-y-1">
                  <div className="text-sm bg-red-900/30 border border-red-600 p-2 rounded-lg text-center">
                    Unavailable
                  </div>

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
