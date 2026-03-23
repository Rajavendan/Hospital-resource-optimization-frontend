import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    Users, 
    UserPlus, 
    Edit2, 
    Trash2, 
    Search, 
    Filter, 
    ChevronRight, 
    ShieldCheck, 
    Mail, 
    Key, 
    X,
    Shield,
    CheckCircle,
    Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const RoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'BILLING'
    });

    const roles = ['BILLING', 'TESTHANDLER', 'PHARMACIST'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data.filter(u => ['BILLING', 'TESTHANDLER', 'PHARMACIST'].includes(u.role)));
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            toast.error("Failed to load user list");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/admin/users/${editId}`, formData);
                toast.success("User updated successfully");
            } else {
                const payload = {
                    ...formData,
                    role: formData.role.trim().toUpperCase()
                };
                await api.post('/api/admin/users', payload);
                toast.success("User created successfully");
            }
            setIsModalOpen(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteFromDetail = async () => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/admin/users/${selectedUser.id}`);
            toast.success("User deleted successfully");
            setShowDetailModal(false);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleEditFromDetail = () => {
        const user = selectedUser;
        setShowDetailModal(false);
        setEditId(user.id);
        setFormData({
            name: user.name,
            username: user.username,
            password: '', 
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({
            name: '',
            username: '',
            password: '',
            role: 'BILLING'
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-indigo-600/20 rounded-xl">
                                <ShieldCheck className="text-indigo-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Role Management</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            Manage system access for specialized administrative staff
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="hidden lg:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <UserPlus size={20} />
                        Add New User
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['ALL', ...roles].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                                    roleFilter === role 
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {role === 'ALL' ? 'All Roles' : role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-44 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Specialized Users</h3>
                            <p className="text-slate-500">Try adjusting your filters or search</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => handleCardClick(user)}
                                className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col h-full overflow-hidden"
                            >
                                <div className="absolute -top-1 -right-1">
                                    <span className={`px-3 py-1 text-[8px] font-extrabold uppercase tracking-widest rounded-bl-xl border-l border-b border-white/5 ${
                                        user.role === 'BILLING' ? 'bg-emerald-500/10 text-emerald-400' :
                                        user.role === 'PHARMACIST' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl border border-white/5 group-hover:scale-105 transition-transform">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4 text-white">
                                        <h3 className="font-bold group-hover:text-indigo-400 transition-colors truncate">
                                            {user.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-medium truncate mt-1">
                                            {user.username}
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* FAB for Mobile */}
                <button
                    onClick={openAddModal}
                    className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 transition-all active:scale-90 z-40"
                >
                    <Plus size={32} />
                </button>

                {/* Detail Modal */}
                {showDetailModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Header */}
                            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                        Access: {selectedUser.role}
                                    </div>
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="px-6 relative text-white">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 pt-0 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedUser.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                                            {selectedUser.role} Account
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-white">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Mail size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Email Address</p>
                                            <p className="text-lg font-bold truncate">{selectedUser.username}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                            <Shield size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Permission Level</p>
                                            <p className="text-lg font-bold truncate">Standard {selectedUser.role} Access</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={handleEditFromDetail}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        <Edit2 size={18} />
                                        Modify User Credentials
                                    </button>
                                    <button
                                        onClick={handleDeleteFromDetail}
                                        className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-2xl font-bold transition-all border border-rose-500/20"
                                    >
                                        <Trash2 size={18} />
                                        Terminate Access
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upsert Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <div className="relative bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 text-white">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-indigo-600/20 rounded-lg">
                                        {editId ? <Edit2 className="text-indigo-500" size={20} /> : <UserPlus className="text-indigo-500" size={20} />}
                                    </div>
                                    {editId ? 'Modify Access' : 'Create Access Role'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Full Name</label>
                                    <input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                        <input
                                            name="username"
                                            required
                                            type="email"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="user@hospital.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Assign Functional Role</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {roles.map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: r })}
                                                className={`py-3 px-4 rounded-xl text-sm font-bold border flex items-center justify-between transition-all ${
                                                    formData.role === r
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {r}
                                                {formData.role === r && <CheckCircle size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">
                                        {editId ? 'Update Password (Optional)' : 'Secret Password'}
                                    </label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                        <input
                                            name="password"
                                            type="password"
                                            required={!editId}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="Min 6 characters"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        {editId ? 'Verify & Save' : 'Authorize User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleManagement;
