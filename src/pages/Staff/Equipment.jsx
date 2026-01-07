import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Stethoscope, Settings, User } from 'lucide-react';

const Equipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            // Use correct API endpoint accessible by STAFF
            const response = await api.get('/api/resources/equipment');
            setEquipment(response.data);
        } catch (error) {
            console.error("Failed to fetch equipment", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading equipment...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-200">Equipment Management (View Only)</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map(item => (
                    <div key={item.id} className={`bg-zinc-900 p-6 rounded-xl shadow-sm border flex flex-col justify-between ${item.status === 'MAINTENANCE' ? 'border-red-900/40 bg-red-900/10' : 'border-zinc-800'
                        }`}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${item.status === 'AVAILABLE' ? 'bg-green-900/20 text-green-400' :
                                    item.status === 'IN_USE' ? 'bg-purple-900/20 text-purple-400' :
                                        'bg-red-900/20 text-red-400'
                                    }`}>
                                    <Stethoscope size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'AVAILABLE' ? 'bg-green-900/20 text-green-400' :
                                    item.status === 'IN_USE' ? 'bg-purple-900/20 text-purple-400' :
                                        'bg-red-900/20 text-red-400'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-200">{item.name}</h3>
                            <p className="text-sm text-slate-400 font-mono mt-1">{item.equipmentId}</p>
                            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                <Settings size={14} className="text-slate-500" /> {item.type}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <User size={16} />
                                <span>Handler: <strong>{item.handlerName}</strong></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Equipment;
