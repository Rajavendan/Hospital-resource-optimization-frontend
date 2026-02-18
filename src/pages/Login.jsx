import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
    const { login, googleLogin, user } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Redirect when user state is updated (after role fetch)
    useEffect(() => {
        if (user) {
            const role = user.role?.toLowerCase();
            // Default to home if role is missing (yet to fetch) or unknown
            if (!role) {
                // Wait/Loading state? Or just stay?
                // Ideally we show a loader if user is set but role isn't.
                // But for now, let's redirect to home or schedule if we can guess.
                navigate('/');
                return;
            }

            if (role === 'doctor') navigate('/schedule');
            else if (role === 'patient') navigate('/patient-dashboard');
            else if (role === 'staff') {
                // Staff dashboard
                navigate('/');
            }
            else if (role === 'billing') navigate('/billing');
            else if (role === 'testhandler') navigate('/testhandler');
            else if (role === 'pharmacist') navigate('/pharmacist');
            else navigate('/');
        }
    }, [user, navigate]);

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
            // Navigation handled by useEffect
        } catch (err) {
            console.error(err);
            setError('Invalid email or password.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await googleLogin();
        } catch (err) {
            console.error(err);
            setError('Google Sign-In failed.');
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
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    name="username"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 bg-zinc-950 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder="Enter your email"
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

                    <div className="mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white text-gray-900 border border-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

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
