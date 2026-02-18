import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { auth } from '../../firebase'; // Import Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';

const OpdLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Assuming login context handles simple state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Firebase Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // 2. Verify Backend Status
            // We need to send the token for the backend filter to recognize us
            const response = await api.post('/auth/verify-opd-status', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === "FIRST_LOGIN_COMPLETED" || response.data.status === "VERIFIED") {
                // 3. Login Success
                toast.success('Login Successful!');

                // Manually trigger Auth Context Login if needed, or let Firebase listener handle it.
                // Assuming AuthContext listens to onAuthStateChanged:
                // If existing context logic depends on backend user role, we might need to fetch it.
                // For now, assume Firebase Auth is sufficient for context sync.

                navigate('/patient-dashboard');
            } else {
                toast.error('Unexpected status from server.');
            }

        } catch (error) {
            console.error('Login Error:', error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                toast.error('Invalid email or password.');
            } else if (error.code === 'auth/too-many-requests') {
                toast.error('Too many failed attempts. Reset your password immediately.');
            } else {
                toast.error('Login failed. Ensure you have reset your password via email.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800"
            >
                <div className="text-center mb-8">
                    <div className="bg-violet-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="text-violet-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">OPD Patient Login</h1>
                    <p className="text-zinc-400">Enter your credentials to access the portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 bg-zinc-950 border-zinc-800 focus:border-violet-500 text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 bg-zinc-950 border-zinc-800 focus:border-violet-500 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            * If this is your first time, check your email for the password reset link.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Login to Portal'}
                        {!loading && <ArrowRight className="ml-2" size={20} />}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default OpdLogin;
