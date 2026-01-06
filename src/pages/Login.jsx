import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';


const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };



    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(credentials.username, credentials.password);

            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const role = user?.role?.toLowerCase();

            if (role === 'doctor') navigate('/schedule');
            else if (role === 'patient') navigate('/my-appointments');
            else if (role === 'staff') navigate('/');
            else if (role === 'billing') navigate('/billing');
            else if (role === 'testhandler') navigate('/testhandler');
            else navigate('/');

        } catch (err) {
            console.error(err);
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-800">
                <div className="bg-violet-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Smart Hospital</h1>
                    <p className="text-violet-100">Resource Optimization Platform</p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-semibold text-center text-slate-200 mb-6">Login to Account</h2>

                    {error && (
                        <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center text-red-400 text-sm">
                            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email / Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="Enter your username"
                                    value={credentials.username}
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
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Signing In...'
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>


                    </form>

                    <div className="mt-8 text-center border-t border-zinc-800 pt-6">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-violet-500 font-semibold hover:text-violet-400">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
