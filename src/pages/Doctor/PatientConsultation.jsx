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
    CheckCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientConsultation = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // State
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'reports'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Test Assignment State
    const [assigning, setAssigning] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);

    // Reports State
    const [reports, setReports] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [reportDesc, setReportDesc] = useState('');
    const [reportMessage, setReportMessage] = useState('');

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            let foundPatient = null;

            // 1. Try finding in "My Patients" list first (preserves existing logic)
            try {
                const patientRes = await api.get('/api/doctors/my-patients');
                foundPatient = patientRes.data.find(p => p.id === parseInt(patientId));
            } catch (ignore) { }

            // 2. If not found, fetch directly by ID (Fix for Schedule flow)
            if (!foundPatient) {
                try {
                    // Use standard /api/patients/{id} endpoint which requires authenticated role but exists
                    const directRes = await api.get(`/api/patients/${patientId}`);
                    foundPatient = directRes.data;
                } catch (e) {
                    console.error("Failed to fetch patient directly", e);
                }
            }

            if (foundPatient) {
                setPatient(foundPatient);
                // 2. Fetch Reports
                fetchReports(foundPatient.id);
                // 3. Fetch Available Tests
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
            const res = await api.get(`/api/doctors/reports/${id}`);
            setReports(res.data);
        } catch (err) {
            console.error("Error fetching reports", err);
        }
    };

    const fetchAvailableTests = async () => {
        try {
            const res = await api.get('/api/doctors/tests');
            setAvailableTests(res.data);
        } catch (err) {
            console.error("Failed to fetch tests", err);
        }
    };

    const handleAssignTest = async () => {
        if (selectedTests.length === 0) return;
        try {
            setAssigning(true);
            await api.post(`/api/doctors/tests/assign/${patient.id}`, { testIds: selectedTests });
            toast.success('Tests assigned successfully to Laboratory Queue.');
            fetchAvailableTests(); // Refresh counts
            setSelectedTests([]);
        } catch (err) {
            const errorMsg = err.response?.data || 'Failed to assign test.';
            toast.error(errorMsg);
        } finally {
            setAssigning(false);
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

            await api.post('/api/doctors/reports/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Report uploaded successfully.');
            setSelectedFile(null);
            setReportDesc('');
            fetchReports(patient.id); // Refresh list
        } catch (err) {
            toast.error('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleCompleteConsultation = async () => {
        if (!window.confirm("Are you sure you want to complete this consultation? The patient will be discharged.")) return;
        try {
            await api.put(`/api/doctors/patients/${patient.id}/complete`);
            toast.success("Consultation completed");
            navigate('/doctor/patients');
        } catch (err) {
            toast.error('Failed to complete consultation.');
        }
    };

    const handleViewReport = async (report) => {
        try {
            let res;
            if (report.source === 'LAB') {
                res = await api.get(`/api/reports/download/${report.id}`, { responseType: 'blob' });
            } else {
                res = await api.get(`/api/doctors/reports/download/${report.id}`, { responseType: 'blob' });
            }
            const url = window.URL.createObjectURL(new Blob([res.data], { type: report.fileType }));
            window.open(url, '_blank');
        } catch (err) {
            console.error("Failed to open report", err);
            toast.error("Could not open report.");
        }
    };

    const handleDownloadReport = async (report) => {
        try {
            let res;
            if (report.source === 'LAB') {
                res = await api.get(`/api/reports/download/${report.id}`, { responseType: 'blob' });
            } else {
                res = await api.get(`/api/doctors/reports/download/${report.id}`, { responseType: 'blob' });
            }
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', report.fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Download started");
        } catch (err) {
            console.error("Failed to download report", err);
            toast.error("Could not download report.");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-blue-600">Loading patient data...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex h-screen bg-black">
            {/* Sidebar Placeholder or removed if using main layout */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-black border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Beaker className="text-blue-600" />
                            <span className="text-white">Patient Consultation</span>
                        </h1>
                        {patient && (
                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                <span>ID: #{patient.id}</span>
                                <span>•</span>
                                <span>{patient.name}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/doctor/patients')}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                        >
                            Back to List
                        </button>
                        <button
                            onClick={handleCompleteConsultation}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Complete Consultation
                        </button>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-6">
                    {/* Patient Card */}
                    {patient && (
                        <div className="bg-black rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{patient.name}</h2>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-300 mt-2">
                                            <p>Age: <span className="font-medium text-slate-100">{patient.age}</span></p>
                                            <p>Gender: <span className="font-medium text-slate-100">{patient.gender}</span></p>
                                            <p>Blood: <span className="font-medium text-slate-100">{patient.bloodGroup}</span></p>
                                            <p>Contact: <span className="font-medium text-slate-100">{patient.contact}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${patient.severity >= 4 ? 'bg-red-100 text-red-700' :
                                        patient.severity === 3 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        Severity: {patient.severity}/5
                                    </span>
                                    <p className="text-sm text-slate-200 mt-2">Admitted: {patient.admissionDate}</p>
                                </div>
                            </div>

                            {/* Recent Diagnosis */}
                            <div className="bg-slate-230 rounded-lg p-4 border border-slate-200">
                                <label className="block text-xs font-bold text-white uppercase tracking-wide mb-1">
                                    Current Diagnosis
                                </label>
                                <p className="text-white font-medium">{patient.diagnosis || 'No initial diagnosis recorded.'}</p>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 gap-6">
                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'tests'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <h1 className='text-white'>Diagnostics & Tests</h1>
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'reports'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <h1 className='text-white'>Medical Reports & Results</h1>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-slate-960 rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                        {activeTab === 'tests' ? (
                            <div className="max-w-2xl mx-auto py-8">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Beaker className="text-blue-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200">Assign Diagnostic Tests</h3>
                                    <p className="text-slate-200 mt-2">
                                        Select a test from the Master List to assign to the patient.
                                    </p>
                                </div>

                                {testMessage && (
                                    <div className={`p-4 rounded-lg mb-6 flex items-center justify-center gap-2 ${testMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {testMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        {testMessage.text}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-200 mb-2">Select Tests to Assign</label>
                                        <div className="max-h-60 overflow-y-auto border rounded-xl p-2 space-y-2 bg-slate-50">
                                            {availableTests.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No tests available.</p>}
                                            {availableTests.map(test => (
                                                <div key={test.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${selectedTests.includes(test.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                                                    }`}>
                                                    <label className="flex items-center gap-3 w-full cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            disabled={test.currentCount >= test.maxCapacity}
                                                            checked={selectedTests.includes(test.id)}
                                                            onChange={() => {
                                                                setSelectedTests(prev =>
                                                                    prev.includes(test.id) ? prev.filter(id => id !== test.id) : [...prev, test.id]
                                                                );
                                                            }}
                                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-slate-700">{test.name}</p>
                                                            <p className="text-xs text-slate-500">Queue: {test.currentCount} / {test.maxCapacity}</p>
                                                        </div>
                                                    </label>
                                                    {test.currentCount >= test.maxCapacity && (
                                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">FULL</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAssignTest}
                                        disabled={assigning || selectedTests.length === 0}
                                        className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {assigning ? 'Assigning...' : `Assign ${selectedTests.length} Selected Test(s)`}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Upload Section */}
                                <div className="md:col-span-1 border-r border-slate-200 pr-8">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Upload size={20} className="text-blue-600" />
                                        Upload New Report
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                            <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                                            <p className="text-sm font-medium text-slate-600">
                                                {selectedFile ? selectedFile.name : "Click to select file"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={reportDesc}
                                                onChange={(e) => setReportDesc(e.target.value)}
                                                placeholder="e.g. Blood Test Results"
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={handleFileUpload}
                                            disabled={uploading || !selectedFile}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Report'}
                                        </button>
                                        {reportMessage && (
                                            <div className={`p-2 rounded text-xs ${reportMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {reportMessage.text}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* List Section */}
                                <div className="md:col-span-2">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-600" />
                                        Patient Reports ({reports.length})
                                    </h3>
                                    {reports.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                            <p className="text-slate-500">No medical reports available.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reports.map((report) => (
                                                <div key={report.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{report.description || report.fileName}</h4>
                                                            <p className="text-xs text-slate-500">
                                                                Uploaded: {new Date(report.uploadedAt).toLocaleDateString()} • {report.fileName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewReport(report)}
                                                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                                                        >View</button>
                                                        <button
                                                            onClick={() => handleDownloadReport(report)}
                                                            className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium"
                                                        >Download</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PatientConsultation;
