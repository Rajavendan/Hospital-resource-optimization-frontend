import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Clipboard, Upload, CheckCircle, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const TestHandlerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/api/testhandler/tasks');
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            setLoading(false);
        }
    };

    const handleFileChange = async (e, id) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm(`Upload report for Task ID: ${id}?`)) return;

        setUploading(id);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post(`/api/testhandler/${id}/complete`, formData);
            toast.success("Report uploaded and test marked complete!");
            fetchTasks();
        } catch (err) {
            console.error("Upload Error Details:", err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Upload failed.";
            toast.error("Upload Failure: " + errMsg);
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Clipboard className="text-blue-600" />
                <h1 className='text-white'>Lab Technician Dashboard</h1>
            </div>

            <div className="bg-black rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-black flex justify-between items-center">
                    <h2 className="font-semibold text-white">Pending Lab Tests (PAID)</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                        {tasks.length} To Do
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending lab tests. Good job!</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tasks.map(task => (
                            <div key={task.id} className="p-4  transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-lg">{task.test?.name}</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">PAID</span>
                                    </div>
                                    <div className="text-sm text-white flex items-center gap-4">
                                        <span className="flex items-center gap-1 "><User size={14} /> {task.patient?.name} (ID: {task.patient?.id})</span>
                                        <span className="flex items-center gap-1"><User size={14} /> Dr. {task.doctor?.name}</span>
                                    </div>
                                    <div className="text-xs text-white">Assigned: {new Date(task.assignedDate).toLocaleString()}</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        id={`file-${task.id}`}
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, task.id)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <label
                                        htmlFor={`file-${task.id}`}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors shadow-sm ${uploading === task.id
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {uploading === task.id ? 'Uploading...' : <><Upload size={18} /> Upload Report</>}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestHandlerDashboard;
