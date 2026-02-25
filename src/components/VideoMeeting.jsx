import React from 'react';
import { XCircle, PhoneOff } from 'lucide-react';

const VideoMeeting = ({ meetingLink, onClose }) => {
    if (!meetingLink) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-6xl h-[85vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">

                {/* Header / Controls */}
                <div className="bg-zinc-900/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/5 absolute top-0 left-0 right-0 z-10">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-white font-bold tracking-wide">Live Consultation</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/30"
                    >
                        <PhoneOff size={20} />
                        End Call
                    </button>
                </div>

                {/* Jitsi Iframe */}
                <iframe
                    src={meetingLink}
                    title="Video Consultation"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-0 bg-black"
                />
            </div>
        </div>
    );
};

export default VideoMeeting;
