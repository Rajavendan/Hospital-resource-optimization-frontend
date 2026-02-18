import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { Bell, Check } from 'lucide-react';

const NotificationsTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/api/patient/notifications');
                setNotifications(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return <div>Loading notifications...</div>;
    if (notifications.length === 0) return <div className="text-center py-8 text-gray-500">No new notifications.</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-100">
                <Bell className="w-5 h-5 text-violet-500" /> Notifications
            </h2>
            <div className="space-y-2">
                {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 rounded-lg border flex justify-between items-start ${notif.isRead ? 'glass-card border-white/5 opacity-60' : 'bg-violet-500/10 border-violet-500/30'}`}>
                        <div>
                            <p className="text-slate-100 font-medium">{notif.message}</p>
                            <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleString()}</span>
                        </div>
                        {!notif.isRead && (
                            <button className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
                                <Check className="w-4 h-4" /> Mark as read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsTab;
