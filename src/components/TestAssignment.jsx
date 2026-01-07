import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Beaker, User, Clock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const TestAssignment = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (patientId) {
            fetchPatient();
        } else {
            setError('No patient specified.');
            setLoading(false);
        }
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            setLoading(true);
            // Fetch all my patients and find the one matching ID (Security check implicit)
            const response = await api.get('/api/doctors/my-patients');
            const foundPatient = response.data.find(p => p.id === parseInt(patientId));

            if (foundPatient) {
                setPatient(foundPatient);
            } else {
                setError('Patient not found or not assigned to you.');
            }
        } catch (err) {
            console.error('Error fetching patient:', err);
            setError('Failed to fetch patient details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTest = async () => {
        try {
            setAssigning(true);
            setError('');
            setSuccessMessage('');

            await api.post(`/api/doctors/tests/assign/${patient.id}`);

            setSuccessMessage('Test assigned successfully and added to queue!');
            setTimeout(() => navigate('/doctor/patients'), 2000); // Redirect back to list
        } catch (err) {
            console.error('Error assigning test:', err);
            setError('Failed to assign test. Please try again.');
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patient details...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={() => navigate('/doctor/patients')}
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={18} /> Back to My Patients
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Beaker className="text-blue-600" /> Test Assignment
                    </h1>
                </div>

                <div className="p-8">
                    {error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    ) : successMessage ? (
                        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} />
                            {successMessage}
                        </div>
                    ) : patient ? (
                        <div className="space-y-8">
                            {/* Patient Info Card */}
                            <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                                        <span className="flex items-center gap-1"><User size={14} /> {patient.gender}, {patient.age} yrs</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> ID: #{patient.id}</span>
                                    </div>
                                    {patient.diagnosis && (
                                        <div className="mt-3 text-slate-700 bg-white/50 p-2 rounded">
                                            <strong>Diagnosis:</strong> {patient.diagnosis}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Prescribe Tests</h3>
                                <div className="border rounded-xl p-6 bg-slate-50">
                                    <p className="text-slate-600 mb-6">
                                        Clicking the button below will assign the <strong>Standard Diagnostic Panel</strong> (Blood Count, X-Ray, Urine Analysis) to this patient based on equipment availability.
                                    </p>

                                    <button
                                        onClick={handleAssignTest}
                                        disabled={assigning}
                                        className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${assigning ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {assigning ? 'Processing Assignment...' : <><Beaker size={20} /> Assign Standard Panel</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default TestAssignment;
