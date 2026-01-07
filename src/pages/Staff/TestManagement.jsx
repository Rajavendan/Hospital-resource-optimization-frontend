import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Microscope, Play, Check, Clock, Users, Activity, AlertCircle } from 'lucide-react';

const TestManagement = () => {
    const [tests, setTests] = useState([]);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [testRes, queueRes] = await Promise.all([
                api.get('/api/staff/tests'),
                api.get('/api/staff/tests/queue')
            ]);
            setTests(testRes.data);
            setQueue(queueRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (mappingId) => {
        try {
            await api.put(`/api/staff/tests/complete/${mappingId}`);
            fetchData();
        } catch (error) {
            console.error("Completion failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading test metrics...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                <Activity className="text-blue-400" /> Test Management Center
            </h1>

            {/* SECTION 1: Active Test Queue (Top) */}
            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-orange-400" /> Active Test Queue
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {queue.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                            <Check size={48} className="mx-auto mb-2 opacity-20" />
                            <p>No active tests in queue</p>
                        </div>
                    ) : (
                        queue.map((job, index) => (
                            <div key={job.id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-zinc-900 p-2 rounded-full border border-zinc-600 text-blue-400">
                                        <Microscope size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{job.test?.name || 'Unknown Test'}</span>
                                            <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">#{index + 1} in queue</span>
                                        </div>
                                        <p className="text-xs text-slate-400">Patient: {job.patient?.name || 'Unknown'} (ID: {job.patient?.id})</p>
                                        <div className="mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${job.paymentStatus === 'PAID' ? 'bg-green-900/20 text-green-400' : 'bg-orange-900/20 text-orange-400'}`}>
                                                PAYMENT: {job.paymentStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleComplete(job.id)}
                                    disabled={job.paymentStatus !== 'PAID'}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${job.paymentStatus === 'PAID'
                                        ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40'
                                        : 'bg-zinc-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Check size={12} /> Mark Complete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION 2: Active Test Types (Bottom) - Only showing assigned types */}
            <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" /> Active Test Types (Overview)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests
                        .filter(test => queue.some(q => q.test?.id === test.id)) // Only show assigned tests
                        .sort((a, b) => b.currentCount - a.currentCount)
                        .map(test => (
                            <div key={test.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-200">{test.name}</h3>
                                        <p className="text-xs text-slate-400">{test.testId}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${test.currentCount >= test.maxCapacity ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'
                                        }`}>
                                        {test.currentCount} / {test.maxCapacity}
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${test.currentCount >= test.maxCapacity ? 'bg-red-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${(test.currentCount / test.maxCapacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    {tests.filter(test => queue.some(q => q.test?.id === test.id)).length === 0 && (
                        <div className="col-span-full text-center text-slate-400 py-4">
                            No active test types needed at this moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestManagement;
