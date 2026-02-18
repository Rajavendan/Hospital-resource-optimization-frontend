import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Video, PhoneOff, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const link = searchParams.get('link');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!link) {
            toast.error("Invalid meeting link");
            navigate('/patient/dashboard');
            return;
        }

        // Simulate connection delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [link, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h2 className="text-xl font-semibold">Connecting to Secure Medical Room...</h2>
                <p className="text-slate-400">Verifying appointment ID: {id}</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-neutral-900 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="bg-black/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10 z-10 absolute top-0 w-full">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500/20 p-2 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">Hospitex Telemedicine</h1>
                        <p className="text-slate-400 text-xs text-left">Encrypted Session • ID: {id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs">
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Main Video Area (Iframe) */}
            <div className="flex-1 w-full h-full relative">
                <iframe
                    src={`${link}#config.prejoinPageEnabled=false&userInfo.displayName="Patient"`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-none"
                    title="Video Consultation"
                ></iframe>
            </div>

            {/* Bottom Controls Overlay (Visual only, as Jitsi has its own) 
                Added here just to give the "App Feel" if iframe assumes partial screen, 
                but since we do full screen iframe, we might just put a "Leave" button floating.
            */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20 pointer-events-none">
                {/* Jitsi usually has its own controls. We add a specialized 'Exit' just in case. */}
            </div>

            <button
                onClick={() => {
                    if (window.confirm("End consultation and return to dashboard?")) {
                        navigate('/patient/dashboard');
                    }
                }}
                className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 z-50 transition-transform hover:scale-105"
            >
                <PhoneOff size={20} /> End Call
            </button>
        </div>
    );
};

export default VideoPage;
