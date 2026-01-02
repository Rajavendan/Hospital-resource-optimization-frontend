import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, UserPlus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'BILLING'
    });

    const roles = ['BILLING', 'TESTHANDLER'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.filter(u => ['BILLING', 'TESTHANDLER'].includes(u.role)));
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
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
                await api.put(`/admin/users/${editId}`, formData);
                toast.success("User updated successfully");
            } else {
                await api.post('/admin/users', formData);
                toast.success("User created successfully");
            }
            setIsModalOpen(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const openEditModal = (user) => {
        setEditId(user.id);
        setFormData({
            name: user.name,
            username: user.username,
            password: '', // Don't show password
            role: user.role
        });
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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Specialized Role Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage Billing Staff and Lab Technicians</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Roles</option>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${user.role === 'BILLING' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {user.role}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{user.name}</h3>
                                <p className="text-xs text-slate-500">{user.username}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => openEditModal(user)}
                                className="flex-1 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="flex-1 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        No users found matching your criteria.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">{editId ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
                                <input
                                    name="username"
                                    required
                                    type="email"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {editId ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required={!editId}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md"
                                >
                                    {editId ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
