import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('temp_token');

    useEffect(() => {
        if (!token) {
            toast.error('Unauthorized access');
            navigate('/opd-login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            // Manually set header for this request using temp_token
            await api.post('/auth/change-password',
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Password changed successfully! Please login.');
            localStorage.removeItem('temp_token');
            navigate('/opd-login');

        } catch (error) {
            console.error('Password Change Failed:', error);
            toast.error(error.response?.data || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8"
            >
                <div className="text-center mb-8">
                    <div className="bg-yellow-500/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                        <Lock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Change Password</h1>
                    <p className="text-gray-400">For security, you must change your default password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="old" className="text-gray-300">Current Password</Label>
                        <Input
                            id="old"
                            type="password"
                            required
                            className="bg-gray-900/50 border-gray-600 text-white"
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new" className="text-gray-300">New Password</Label>
                        <Input
                            id="new"
                            type="password"
                            required
                            className="bg-gray-900/50 border-gray-600 text-white"
                            placeholder="New Password (min 8 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-gray-300">Confirm New Password</Label>
                        <Input
                            id="confirm"
                            type="password"
                            required
                            className="bg-gray-900/50 border-gray-600 text-white"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ChangePassword;
