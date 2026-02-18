import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Shield, User, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        age: '',
        gender: '',
        bloodGroup: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };





    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create User in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, formData.username, formData.password);
            const firebaseUid = userCredential.user.uid;

            // 2. Create User in Backend (DB)
            // Backend handles the actual profile creation
            // We send the same password, but backend ignores it or stores dummy
            await api.post('/api/auth/register', { ...formData, firebaseUid });

            toast.success('Registration Successful!');
            navigate('/login');
        } catch (err) {
            console.error("Registration failed", err);
            // Firebase error handling
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered in Firebase.');
            } else {
                setError(err.response?.data?.message || err.message || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-800">
                <div className="bg-violet-600 p-8 text-center">
                    <div className="mx-auto bg-violet-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-violet-100">Join Smart Hospital Platform</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    name="username"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="name@example.com"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    required
                                    className="w-full px-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="Age"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Gender</label>
                                <select
                                    name="gender"
                                    className="w-full px-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    className="w-full px-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    required
                                    className="w-full px-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="+1234567890"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>


                    </form>


                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-violet-500 font-semibold hover:text-violet-400">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Signup;
