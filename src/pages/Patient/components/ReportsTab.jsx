import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { FileText, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportsTab = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/api/patient/reports');
            setReports(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (reportId, fileName) => {
        try {
            toast.loading(`Downloading ${fileName}...`);
            const response = await api.get(`/api/reports/download/${reportId}`, {
                responseType: 'blob'
            });

            // Create a blob URL to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Force download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success("Download started");
        } catch (error) {
            console.error("Download failed", error);
            toast.dismiss();
            toast.error("Failed to download report. Please try again.");
        }
    };

    const filteredReports = reports.filter(r => {
        if (filter === 'all') return true;
        const date = new Date(r.uploadedAt);
        const now = new Date();
        const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
        if (filter === '30') return daysDiff <= 30;
        if (filter === '180') return daysDiff <= 180;
        return true;
    });

    if (loading) return <div>Loading reports...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
                    <FileText className="w-5 h-5 text-violet-500" /> Medical Reports
                </h2>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-white/10 bg-black/20 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-violet-500"
                    >
                        <option value="all">All Time</option>
                        <option value="30">Last 30 Days</option>
                        <option value="180">Last 6 Months</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                    <div key={report.id} className="glass-card border border-white/10 rounded-lg p-4 hover:shadow-xl hover:border-violet-500/30 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                <FileText className="w-8 h-8 text-blue-400" />
                            </div>
                            <span className="text-xs text-slate-500">
                                {new Date(report.uploadedAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <h3 className="mt-3 font-medium text-slate-100 truncate" title={report.fileName}>{report.fileName}</h3>
                        <p className="text-sm text-slate-400 mb-4">{report.description || 'No description'}</p>
                        <p className="text-xs text-slate-500 mb-2">
                            {report.uploadedBy
                                ? `Dr. ${report.uploadedBy.user?.name}`
                                : (report.fileName?.startsWith('Invoice') ? 'Billing System' :
                                    report.description?.includes('Lab') ? 'Lab Department' : 'System Generated')}
                        </p>

                        <button
                            onClick={() => downloadReport(report.id, report.fileName)}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-md text-sm font-medium transition-colors border border-white/10 hover:border-violet-500/30"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                        No reports found for the selected period.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsTab;
