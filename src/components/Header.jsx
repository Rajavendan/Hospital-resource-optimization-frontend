import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clock, Sparkles, Command } from 'lucide-react';
import CommandPalette from './CommandPalette';

const Header = () => {
    const { user, logout } = useAuth();
    const [now, setNow] = useState(() => new Date());
    const [paletteOpen, setPaletteOpen] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const roleLabel = user?.role ? user.role.toString().toLowerCase() : 'guest';

    return (
        <>
            <header className="h-16 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                            {(user?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                            Welcome back,
                            <span className="capitalize text-violet-400">{user?.name}</span>
                            <Sparkles size={14} className="text-violet-500" />
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                            Role:&nbsp;
                            <span className="uppercase tracking-wide text-xs text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                                {roleLabel}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Clock size={13} className="text-zinc-500" />
                        <span>
                            {now.toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/40 text-violet-100 hover:bg-violet-600/20 hover:border-violet-400/60 transition-colors text-xs font-medium"
                    >
                        <Command size={14} />
                        Quick actions
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-zinc-900/70 border border-zinc-700 text-[10px] text-zinc-400">
                            Ctrl + K
                        </span>
                    </button>

                    <div className="h-8 w-px bg-zinc-800 mx-1" />

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-[11px] text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-md hover:bg-red-900/30 border border-red-900/40 transition-colors"
                    >
                        <LogOut size={14} />
                        Sign out
                    </button>
                </div>
            </header>

            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </>
    );
};

export default Header;
