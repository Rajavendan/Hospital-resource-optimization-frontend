import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/button';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-slate-200">
            <ShieldAlert size={64} className="text-red-500 mb-6" />
            <h1 className="text-4xl font-bold mb-4">403 - Unauthorized</h1>
            <p className="text-lg text-slate-400 mb-8 max-w-md text-center">
                You do not have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => navigate(-1)} variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
                    Go Back
                </Button>
                <Button onClick={() => navigate('/login')} className="bg-violet-600 hover:bg-violet-700 text-white">
                    Login
                </Button>
            </div>
        </div>
    );
};

export default Unauthorized;
