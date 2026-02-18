import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, Search, Keyboard, X } from 'lucide-react';

const roleShortcuts = (role) => {
    const r = (role || '').toLowerCase();

    if (r === 'staff') {
        return [
            { label: 'Staff Dashboard', path: '/' },
            { label: 'OPD Entry', path: '/opd-entry' },
            { label: 'Admissions', path: '/admission' },
            { label: 'Bed Management', path: '/beds' },
            { label: 'Equipment', path: '/equipment' },
            { label: 'Tests', path: '/tests' },
        ];
    }

    if (r === 'admin') {
        return [
            { label: 'Admin Dashboard', path: '/admin' },
            { label: 'Doctor Management', path: '/admin/doctors' },
            { label: 'Staff Management', path: '/admin/staff' },
            { label: 'Beds (Admin)', path: '/admin/beds' },
            { label: 'Equipment (Admin)', path: '/admin/equipment' },
            { label: 'Test Definitions', path: '/admin/tests' },
            { label: 'Role Management', path: '/admin/roles' },
        ];
    }

    if (r === 'patient') {
        return [
            { label: 'Patient Dashboard', path: '/patient-dashboard' },
            { label: 'Book Appointment', path: '/book-appointment' },
            { label: 'My Appointments', path: '/my-appointments' },
        ];
    }

    if (r === 'doctor') {
        return [
            { label: 'My Patients', path: '/doctor/patients' },
            { label: 'Schedule', path: '/schedule' },
        ];
    }

    if (r === 'billing') {
        return [{ label: 'Billing Dashboard', path: '/billing' }];
    }

    if (r === 'testhandler') {
        return [{ label: 'Lab Dashboard', path: '/testhandler' }];
    }

    if (r === 'pharmacist') {
        return [{ label: 'Pharmacy Dashboard', path: '/pharmacist' }];
    }

    return [];
};

const CommandPalette = ({ open, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const items = useMemo(() => {
        return roleShortcuts(user?.role);
    }, [user?.role]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setHighlightedIndex(0);
            return;
        }

        const handler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const target = filtered[highlightedIndex];
                if (target) {
                    navigate(target.path);
                    onClose?.();
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, highlightedIndex]);

    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter((i) => i.label.toLowerCase().includes(q));
    }, [items, query]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-violet-900/40 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400">
                        <Command size={18} />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                        <Search size={16} className="text-zinc-500" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            placeholder="Search actions or screens…"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900/60">
                            <Keyboard size={12} /> Ctrl + K
                        </span>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-slate-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-zinc-500 text-center">
                            No matches. Try a different keyword.
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filtered.map((item, index) => (
                                <li key={item.path}>
                                    <button
                                        onClick={() => {
                                            navigate(item.path);
                                            onClose?.();
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                                            index === highlightedIndex
                                                ? 'bg-violet-600/20 text-slate-50'
                                                : 'text-slate-300 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                                            {user?.role}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;


