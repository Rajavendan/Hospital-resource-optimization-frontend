import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; // Adjust path as needed
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TestHandlerDashboard = () => {
    const [pendingTests, setPendingTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);
    const [formData, setFormData] = useState({
        resultValue: '',
        referenceRange: '',
        remarks: '',
        comments: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingTests();
    }, []);

    const fetchPendingTests = async () => {
        try {
            const res = await api.get('/api/testhandler/pending-tests');
            setPendingTests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load pending tests");
            setLoading(false);
        }
    };

    const handleOpenModal = (test) => {
        setSelectedTest(test);
        setFormData({
            resultValue: '',
            referenceRange: '',
            remarks: '',
            comments: ''
        });
    };

    const handleCloseModal = () => {
        setSelectedTest(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.file) {
                toast.error("Please select a file to upload");
                return;
            }

            const data = new FormData();
            data.append('file', formData.file);
            data.append('assignmentId', selectedTest.id);
            if (formData.remarks) data.append('remarks', formData.remarks);

            // Using the requested endpoint structure: /upload/{patientId}
            await api.post(`/api/testhandler/reports/upload/${selectedTest.patient.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Report uploaded successfully!");
            handleCloseModal();
            fetchPendingTests();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <div className="flex-1 p-6 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Test Handler Dashboard
                        </h1>
                        <p className="text-gray-400">Process Lab Tests</p>
                    </div>
                </header>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700/50 text-gray-400 uppercase text-sm">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Test Name</th>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4">Date Assigned</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {pendingTests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No pending tests found. Good job!
                                        </td>
                                    </tr>
                                ) : (
                                    pendingTests.map((test) => (
                                        <tr key={test.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4 text-gray-300">#{test.id}</td>
                                            <td className="p-4 font-medium text-white">{test.patient.name}</td>
                                            <td className="p-4 text-blue-400">{test.test.name}</td>
                                            <td className="p-4 text-gray-300">Dr. {test.doctor.name}</td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(test.assignedDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleOpenModal(test)}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-900/20"
                                                >
                                                    Upload Result
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-white">Upload Report for {selectedTest.test.name}</h2>
                        <p className="text-sm text-gray-400 mb-6">Patient: {selectedTest.patient.name}</p>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Select Report File (PDF/Image)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Remarks / Description</label>
                                <input
                                    type="text"
                                    name="remarks"
                                    placeholder="e.g. CBC Result - Normal"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-all shadow-lg flex-1"
                                >
                                    Upload & Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestHandlerDashboard;
