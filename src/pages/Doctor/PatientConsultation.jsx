import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    Beaker,
    FileText,
    User,
    Clock,
    ArrowLeft,
    Upload,
    Download,
    AlertCircle,
    CheckCircle,
    Plus,
    Trash2,
    Stethoscope
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientConsultation = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // State
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('consultation'); // 'consultation', 'tests', 'reports'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Consultation Form State
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', duration: '', frequency: '' }
    ]);

    // Test Selection State
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]); // IDs to be sent on complete

    // Reports State
    const [reports, setReports] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [reportDesc, setReportDesc] = useState('');

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            let foundPatient = null;
            try {
                const patientRes = await api.get('/api/doctors/my-patients');
                foundPatient = patientRes.data.find(p => p.id === parseInt(patientId));
            } catch (ignore) { }

            if (!foundPatient) {
                try {
                    const directRes = await api.get(`/api/patients/${patientId}`);
                    foundPatient = directRes.data;
                } catch (e) { console.error(e); }
            }

            if (foundPatient) {
                setPatient(foundPatient);
                fetchReports(foundPatient.id);
                fetchAvailableTests();
            } else {
                setError('Patient not found.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load patient data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async (id) => {
        try {
            const res = await api.get(`/api/reports/patient/${id}`);
            setReports(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAvailableTests = async () => {
        try {
            const res = await api.get('/api/doctors/tests');
            setAvailableTests(res.data);
        } catch (err) { console.error(err); }
    };

    // Pharmacy Integration
    const [pharmacyMedicines, setPharmacyMedicines] = useState([]);

    useEffect(() => {
        const loadMeds = async () => {
            try {
                const res = await api.get('/api/pharmacy/medicines');
                setPharmacyMedicines(res.data);
            } catch (e) { console.error("Failed to load pharmacy inventory"); }
        };
        loadMeds();
    }, []);

    // Medicine Helper Functions
    const addMedicine = () => {
        setMedicines([...medicines, {
            name: '', dosage: '', duration: '', frequency: '',
            quantity: 1, instructions: '', medicineId: null
        }]);
    };

    const removeMedicine = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const updateMedicine = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;

        // Auto-fill ID if name matches inventory
        if (field === 'name') {
            const match = pharmacyMedicines.find(m => m.name === value);
            if (match) newMeds[index].medicineId = match.id;
            else newMeds[index].medicineId = null;
        }

        setMedicines(newMeds);
    };

    const handleTestPrescribe = async () => {
        if (selectedTests.length === 0) {
            toast.error('Please select at least one test.');
            return;
        }
        try {
            await api.post(`/api/doctors/patients/${patientId}/prescribe-tests`, selectedTests);
            toast.success('Tests prescribed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to prescribe tests: ' + error.message);
        }
    };

    const handleCompleteConsultation = async () => {
        if (!symptoms || !diagnosis) {
            toast.error("Please enter symptoms and diagnosis.");
            return;
        }

        if (!window.confirm("Complete consultation? This will discharge the patient, generate a bill, and send prescription to Pharmacy.")) return;

        // 1. Create Pharmacy Prescription
        const prescriptionPayload = {
            notes: `Diagnosis: ${diagnosis}\nSymptoms: ${symptoms}`,
            items: medicines.filter(m => m.name.trim() !== '').map(m => ({
                medicineId: m.medicineId,
                medicineName: m.name,
                dosage: m.dosage,
                durationDays: parseInt(m.duration) || 5, // Parsing "5 days" might fail, default to 5 or logic needed
                quantity: parseInt(m.quantity) || 1,
                instructions: `${m.frequency} - ${m.instructions || ''}`
            }))
        };

        try {
            if (prescriptionPayload.items.length > 0) {
                await api.post(`/api/doctor/prescriptions/${patient.id}`, prescriptionPayload);
                toast.success("Prescription sent to Pharmacy!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to send prescription to Pharmacy (Inventory might be unaffected).");
            // We continue to complete consultation even if pharmacy fails? 
            // Better to warn but proceed or stop? Proceeding as per "Do not break existing feature"
        }

        // 2. Existing Complete Logic
        const payload = {
            symptoms,
            diagnosis,
            followUpDate: followUpDate || null,
            medicines: medicines.filter(m => m.name.trim() !== ''),
            testIds: selectedTests
        };

        try {
            await api.put(`/api/doctors/patients/${patient.id}/complete`, payload);
            toast.success("Consultation completed!");
            navigate('/doctor/patients');
        } catch (err) {
            console.error(err);
            toast.error('Failed to complete consultation.');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('patientId', patient.id);
            formData.append('description', reportDesc);
            await api.post('/api/doctors/reports/upload', formData);
            toast.success('Report uploaded successfully.');
            setSelectedFile(null);
            setReportDesc('');
            fetchReports(patient.id);
        } catch (err) {
            toast.error("Upload Failed");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-blue-600">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex h-screen bg-black text-white">
            <div className="flex-1 overflow-auto">
                <div className="bg-black border-b border-slate-800 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Stethoscope className="text-blue-500" />
                            <span>Patient Consultation</span>
                        </h1>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                            <span>ID: #{patient.id}</span>
                            <span>•</span>
                            <span>{patient.name}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/doctor/patients')} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900">
                            Cancel
                        </button>
                        <button onClick={handleCompleteConsultation} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2">
                            <CheckCircle size={18} />
                            Complete & Bill
                        </button>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-6">
                    <div className="flex border-b border-slate-800 gap-6 mb-6">
                        {['consultation', 'tests', 'reports'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-2 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'consultation' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Symptoms</label>
                                    <textarea
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="4"
                                        placeholder="Describe detailed symptoms..."
                                        value={symptoms}
                                        onChange={e => setSymptoms(e.target.value)}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Diagnosis</label>
                                    <textarea
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="4"
                                        placeholder="Enter clinical diagnosis..."
                                        value={diagnosis}
                                        onChange={e => setDiagnosis(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Follow-up Date</label>
                                <input
                                    type="date"
                                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                    value={followUpDate}
                                    onChange={e => setFollowUpDate(e.target.value)}
                                />
                            </div>

                            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Prescription (Pharmacy Integrated)</h3>
                                    <button onClick={addMedicine} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-bold">
                                        <Plus size={16} /> Add Medicine
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {medicines.map((med, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-black/40 p-3 rounded-lg border border-slate-800">
                                            <div className="col-span-3">
                                                <label className="text-xs text-slate-500 block mb-1">Medicine Name</label>
                                                <input
                                                    list="pharmacy-meds"
                                                    placeholder="Search..."
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                                    value={med.name}
                                                    onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                                />
                                                <datalist id="pharmacy-meds">
                                                    {pharmacyMedicines.map(pm => (
                                                        <option key={pm.id} value={pm.name}>{pm.name} (Stock: {pm.stockQuantity})</option>
                                                    ))}
                                                </datalist>
                                                {med.medicineId && <span className="text-[10px] text-green-500">✓ In Stock</span>}
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 block mb-1">Dosage</label>
                                                <input placeholder="e.g. 500mg" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 block mb-1">Duration (Days)</label>
                                                <input type="number" placeholder="Days" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 block mb-1">Freq</label>
                                                <input placeholder="1-0-1" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 block mb-1">Qty</label>
                                                <input type="number" placeholder="#" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm" value={med.quantity} onChange={e => updateMedicine(idx, 'quantity', e.target.value)} />
                                            </div>

                                            <div className="col-span-1 flex items-center h-full pt-5">
                                                <button onClick={() => removeMedicine(idx)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div >
                    )}

                    {
                        activeTab === 'tests' && (
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold mb-4">Select Associated Tests</h3>
                                <p className="text-slate-400 text-sm mb-4">Selected tests will be added to the patient's bill upon completion.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableTests.map(test => (
                                        <div key={test.id}
                                            onClick={() => {
                                                if (test.currentCount < test.maxCapacity) {
                                                    setSelectedTests(prev => prev.includes(test.id) ? prev.filter(id => id !== test.id) : [...prev, test.id]);
                                                }
                                            }}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTests.includes(test.id) ? 'bg-blue-900/30 border-blue-500' : 'bg-black border-slate-800 hover:border-slate-600'} ${test.currentCount >= test.maxCapacity ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold">{test.name}</h4>
                                                {selectedTests.includes(test.id) && <CheckCircle size={16} className="text-blue-500" />}
                                            </div>
                                            <div className="mt-2 text-sm text-slate-400 flex justify-between">
                                                <span>${test.price}</span>
                                                <span>Queue: {test.currentCount}/{test.maxCapacity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={handleTestPrescribe}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        Prescribe Tests Only
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'reports' && (
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                {/* Upload UI Removed as Doctors cannot upload reports */}
                                <div className="space-y-3">
                                    {reports.length === 0 && <p className="text-slate-500 text-sm">No reports found.</p>}
                                    {reports.filter(r => r.id).map(r => { // Filter valid reports
                                        // Determine Label/Source
                                        let type = 'Report';
                                        let badgeColor = 'bg-slate-700 text-slate-300';

                                        if (r.description && r.description.toLowerCase().includes('lab')) {
                                            type = 'LAB REPORT';
                                            badgeColor = 'bg-purple-900 text-purple-200 border border-purple-700';
                                        } else if (r.fileName && r.fileName.toLowerCase().includes('invoice')) {
                                            type = 'INVOICE';
                                            badgeColor = 'bg-green-900 text-green-200 border border-green-700';
                                        } else if (r.source === 'MEDICAL_REPORT') {
                                            type = 'DOC UPLOAD';
                                            badgeColor = 'bg-blue-900 text-blue-200 border border-blue-700';
                                        }

                                        return (
                                            <div key={r.id} className="flex justify-between items-center p-4 bg-black rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${badgeColor}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>{type}</span>
                                                            <span className="text-slate-500 text-xs">{new Date(r.uploadedAt).toLocaleString()}</span>
                                                        </div>
                                                        <p className="font-medium text-slate-200">{r.description || r.fileName}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await api.get(`/api/reports/download/${r.id}`, { responseType: 'blob' });
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', r.fileName);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.parentNode.removeChild(link);
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (e) {
                                                            toast.error("Download failed");
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }

                </div >
            </div >
        </div >
    );
};

export default PatientConsultation;
