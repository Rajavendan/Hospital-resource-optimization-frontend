import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-slate-200">
                Welcome, <span className="capitalize text-violet-500">{user?.name}</span>
            </h2>

            <div className="flex items-center gap-4">


                <div className="h-8 w-px bg-zinc-800 mx-2"></div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium px-3 py-1.5 rounded-md hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </header>
    );
};

export default Header;
