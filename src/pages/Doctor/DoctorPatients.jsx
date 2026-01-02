import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Users, Calendar, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/doctors/my-patients');
            setPatients(response.data);
        } catch (error) {
            console.error("Failed to fetch assigned patients", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your patients...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600" /> My Assigned Patients
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Patient Details</th>
                                <th className="p-4 font-semibold text-slate-600">Diagnosis</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        No patients assigned to you currently.
                                    </td>
                                </tr>
                            ) : (
                                patients.map(patient => (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{patient.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {patient.age} yrs • {patient.gender}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="max-w-xs truncate text-slate-700">
                                                {patient.diagnosis || 'N/A'}
                                            </div>
                                            <div className="text-xs text-red-500 font-bold mt-1">
                                                Severity: {patient.severity}/5
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => navigate(`/doctor/consultation/${patient.id}`)}
                                                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 shadow-sm"
                                            >
                                                Attend Patient <ArrowRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorPatients;
