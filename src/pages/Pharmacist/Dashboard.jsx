import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Plus, AlertCircle, CheckCircle, Package, Pill, User } from 'lucide-react';
import toast from 'react-hot-toast';

const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [medicines, setMedicines] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Dispensing State
    const [patientIdSearch, setPatientIdSearch] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Add Medicine State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        medicineCode: '', name: '', manufacturer: '', category: 'Tablet',
        unit: 'strip', stockQuantity: 0, reorderLevel: 10, pricePerUnit: 0, expiryDate: ''
    });

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchMedicines();
            fetchLowStock();
        }
    }, [activeTab]);

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/api/pharmacy/medicines');
            setMedicines(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load medicines");
        }
    };

    const fetchLowStock = async () => {
        try {
            const res = await api.get('/api/pharmacy/low-stock');
            setLowStock(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/pharmacy/medicines', newMedicine);
            toast.success("Medicine added successfully");
            setShowAddModal(false);
            fetchMedicines();
        } catch (err) {
            toast.error("Failed to add medicine");
        }
    };

    const handleSearchPatient = async () => {
        if (!patientIdSearch) return;
        try {
            const res = await api.get(`/api/pharmacy/prescriptions/patient/${patientIdSearch}`);
            setPrescriptions(res.data);
            if (res.data.length === 0) toast("No prescriptions found for this patient");
        } catch (err) {
            toast.error("Patient not found or error fetching data");
        }
    };

    const handleDispense = async (id) => {
        try {
            await api.post(`/api/pharmacy/prescriptions/${id}/dispense`);
            toast.success("Prescription Dispensed!");
            handleSearchPatient(); // Refresh
        } catch (err) {
            toast.error(err.response?.data || "Dispense failed");
        }
    };

    return (
        <div className="p-6">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h1>
                    <p className="text-gray-500">Manage inventory and dispense medicines</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'inventory' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Inventory ({medicines.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('dispense')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'dispense' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Dispensing
                    </button>
                </div>
            </header>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-1" size={20} />
                    <div>
                        <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                        <p className="text-sm text-red-600">
                            {lowStock.length} medicines are below reorder level. Please restock:
                            {lowStock.map(m => m.name).slice(0, 5).join(", ")}...
                        </p>
                    </div>
                </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search medicines..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition"
                        >
                            <Plus size={18} /> Add Medicine
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Code</th>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Stock</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Expiry</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-mono text-xs">{m.medicineCode}</td>
                                    <td className="p-4 font-medium">{m.name}</td>
                                    <td className="p-4">{m.category}</td>
                                    <td className="p-4">{m.stockQuantity} {m.unit}</td>
                                    <td className="p-4">${m.pricePerUnit}</td>
                                    <td className="p-4">{m.expiryDate}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.stockQuantity <= m.reorderLevel ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {m.stockQuantity <= m.reorderLevel ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DISPENSING TAB */}
            {activeTab === 'dispense' && (
                <div className="flex gap-6">
                    <div className="w-1/3 space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold mb-4">Find Patient</h3>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Enter Patient ID"
                                    className="flex-1 p-2 border rounded-lg"
                                    value={patientIdSearch}
                                    onChange={e => setPatientIdSearch(e.target.value)}
                                />
                                <button
                                    onClick={handleSearchPatient}
                                    className="bg-violet-600 text-white p-2 rounded-lg"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        {prescriptions.map(p => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPrescription(p)}
                                className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:border-violet-400 transition ${selectedPrescription?.id === p.id ? 'border-violet-500 ring-1 ring-violet-500' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500">#{p.id}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                        {p.status}
                                    </span>
                                </div>
                                <h4 className="font-medium text-gray-800">Dr. {p.doctor?.name}</h4>
                                <p className="text-xs text-gray-500">{p.prescribedDate}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {selectedPrescription ? (
                            <div>
                                <div className="flex justify-between items-start mb-6 border-b pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold">Prescription Details</h2>
                                        <p className="text-gray-500 text-sm">Patient ID: {selectedPrescription.patient?.id}</p>
                                    </div>
                                    {selectedPrescription.status === 'PENDING' ? (
                                        <button
                                            onClick={() => handleDispense(selectedPrescription.id)}
                                            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 shadow-md font-medium flex items-center gap-2"
                                        >
                                            <Package size={18} />
                                            Dispense Medicines
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                            <CheckCircle size={18} />
                                            <span>Dispensed by {selectedPrescription.dispensedBy}</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-semibold mb-3">Prescribed Medicines</h3>
                                <div className="space-y-3">
                                    {selectedPrescription.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-md border border-gray-200">
                                                    <Pill size={20} className="text-violet-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.medicineName}</p>
                                                    <p className="text-xs text-gray-500">{item.instructions}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">{item.quantityRequested} Units</p>
                                                <p className="text-xs text-gray-500">{item.dosage} • {item.durationDays} Days</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedPrescription.notes && (
                                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                        <strong>Notes:</strong> {selectedPrescription.notes}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Package size={48} className="mb-4 opacity-20" />
                                <p>Select a prescription to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ADD MEDICINE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Add New Medicine</h2>
                        <form onSubmit={handleAddMedicine} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Code (MED-XXX)" className="p-2 border rounded" value={newMedicine.medicineCode} onChange={e => setNewMedicine({ ...newMedicine, medicineCode: e.target.value })} />
                                <input required placeholder="Name" className="p-2 border rounded" value={newMedicine.name} onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Manufacturer" className="p-2 border rounded" value={newMedicine.manufacturer} onChange={e => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })} />
                                <select className="p-2 border rounded" value={newMedicine.category} onChange={e => setNewMedicine({ ...newMedicine, category: e.target.value })}>
                                    <option>Tablet</option><option>Syrup</option><option>Injection</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" required placeholder="Stock Qty" className="p-2 border rounded" value={newMedicine.stockQuantity} onChange={e => setNewMedicine({ ...newMedicine, stockQuantity: parseInt(e.target.value) })} />
                                <input type="number" required placeholder="Price" className="p-2 border rounded" value={newMedicine.pricePerUnit} onChange={e => setNewMedicine({ ...newMedicine, pricePerUnit: parseFloat(e.target.value) })} />
                            </div>
                            <input type="date" required className="w-full p-2 border rounded" value={newMedicine.expiryDate} onChange={e => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700">Add Medicine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacistDashboard;
