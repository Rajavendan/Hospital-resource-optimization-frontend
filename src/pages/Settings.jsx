import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Moon, Sun, KeyRound, Mail, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';

const Settings = () => {
    const { user, login } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains('dark') || true // Defaulting to true as the app uses dark colors natively
    );

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Email State
    const [newEmail, setNewEmail] = useState('');
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleToggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await api.post('/api/auth/change-password', {
                email: user.username || user.email,
                oldPassword: currentPassword,
                newPassword: newPassword
            });
            toast.success("Password updated successfully.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        if (!newEmail || newEmail.trim() === '') {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsUpdatingEmail(true);
        try {
            await api.post('/api/patient/update-email', { newEmail });
            toast.success("Email updated successfully. Notification sent to old email.");
            
            // Optionally update the context user model to reflect new email locally
            const updatedUser = { ...user, username: newEmail, email: newEmail };
            // Since we don't have a direct `updateUser` context method, we rely on them logging in again next time 
            // or the JWT token being refreshed.
            
            setNewEmail('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update email.");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 p-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
                    <div className="p-3 bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 rounded-xl">
                        <SettingsIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security.</p>
                    </div>
                </header>

                {/* Appearance Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {isDarkMode ? <Moon size={20} className="text-violet-500" /> : <Sun size={20} className="text-amber-500" />}
                                Appearance
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Customize how the application looks on your device.
                            </p>
                        </div>
                        <button 
                            onClick={handleToggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-violet-600' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </section>

                {/* Account Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Security Update Form */}
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 transition-colors">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <KeyRound size={20} className="text-emerald-500" />
                            Security
                        </h2>
                        
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                                    placeholder="Create new password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUpdatingPassword}
                                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </section>

                    {/* Email Update Form */}
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 transition-colors">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Mail size={20} className="text-blue-500" />
                            Email Configuration
                        </h2>
                        
                        <div className="mb-6 bg-slate-100 dark:bg-zinc-950 p-4 rounded-lg border border-slate-200 dark:border-zinc-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">Current Identity</p>
                            <p className="text-slate-900 dark:text-white font-medium break-all">{user?.username || user?.email || 'N/A'}</p>
                        </div>

                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                                    placeholder="Enter new email"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                    Changing your email will update your login credentials. We will send a security alert to your old address to confirm this change.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUpdatingEmail}
                                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isUpdatingEmail ? 'Updating...' : 'Update Email Address'}
                            </button>
                        </form>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default Settings;
