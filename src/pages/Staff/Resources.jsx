import { Activity } from 'lucide-react';

const Resources = () => {
    return (
        <div className="max-w-7xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-200 mb-4">Central Resource Allocation</h1>
            <p className="text-slate-400 max-w-lg mx-auto">
                This module constitutes the advanced phase of the project, focusing on AI-driven bed and equipment allocation.
                <br /><br />
                <strong>Status:</strong> Coming Soon in Phase 7.
            </p>
        </div>
    );
};

export default Resources;
