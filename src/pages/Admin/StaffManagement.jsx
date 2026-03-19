import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    User,
    Mail,
    Phone,
    Clock,
    Search,
    Edit2,
    Trash2,
    Plus,
    X,
    CheckCircle,
    AlertCircle,
    MapPin,
    Briefcase,
    ChevronRight,
    Power,
    Shield
} from 'lucide-react';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '', // email
        password: '',
        phoneNumber: '',
        shift: '',
        address: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/api/admin/staff');
            setStaffList(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch staff", err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            username: '',
            password: '',
            phoneNumber: '',
            shift: '',
            address: ''
        });
        setShowModal(true);
    };

    const openEditModalFromDetail = () => {
        const staff = selectedStaff;
        setShowDetailModal(false);
        setIsEditing(true);
        setCurrentStaff(staff);
        setFormData({
            name: staff.name,
            username: staff.email,
            password: '', // Leave blank
            phoneNumber: staff.phoneNumber || '',
            shift: staff.shift || '',
            address: staff.address || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/api/admin/staff/${currentStaff.id}`, formData);
                setMessage({ type: 'success', text: 'Staff updated successfully.' });
            } else {
                await api.post('/api/admin/staff', formData);
                setMessage({ type: 'success', text: 'Staff registered successfully.' });
            }
            setShowModal(false);
            fetchStaff();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Operation failed.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleToggleStatusFromDetail = async () => {
        const id = selectedStaff.id;
        try {
            await api.put(`/api/admin/staff/${id}/toggle`);
            setMessage({ type: 'success', text: 'Staff status updated.' });
            setShowDetailModal(false);
            fetchStaff();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update status.' });
        }
    };

    const handleDeleteFromDetail = async () => {
        const id = selectedStaff.id;
        if (!window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/staff/${id}`);
            setMessage({ type: 'success', text: 'Staff deleted successfully.' });
            setShowDetailModal(false);
            fetchStaff();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete staff.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleCardClick = (staff) => {
        setSelectedStaff(staff);
        setShowDetailModal(true);
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-indigo-600/20 rounded-xl">
                                <Briefcase className="text-indigo-500" size={28} />
                            </div>
                            <span className="text-white tracking-tight">Staff Management</span>
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
                            Manage support staff, nurses, and administrative personnel.
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="hidden lg:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                        Add New Staff
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                <div className="relative group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Staff Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredStaff.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Staff Members Found</h3>
                            <p className="text-slate-500">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        filteredStaff.map((staff) => (
                            <div
                                key={staff.id}
                                onClick={() => handleCardClick(staff)}
                                className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors truncate">
                                            {staff.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm truncate">
                                            {staff.email}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full shadow-sm ${staff.user?.enabled ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                                            <span className="text-xs text-slate-500">{staff.user?.enabled ? 'Active Account' : 'Account Disabled'}</span>
                                        </div>
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
                {showDetailModal && selectedStaff && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
                            {/* Modal Header */}
                            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedStaff.user?.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                        {selectedStaff.user?.enabled ? 'Active' : 'Disabled'}
                                    </div>
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="px-6 relative">
                                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                                        {selectedStaff.name.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 pt-0 space-y-5">
                                <div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{selectedStaff.name}</h2>
                                    <p className="text-indigo-400 font-semibold">{selectedStaff.email}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Phone size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Contact Number</p>
                                            <p className="text-white">{selectedStaff.phoneNumber || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                                            <Clock size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Shift</p>
                                            <p className="text-white">{selectedStaff.shift || "Not assigned"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Residential Address</p>
                                            <p className="text-white truncate">{selectedStaff.address || "No address provided"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={openEditModalFromDetail}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-2xl font-bold transition-all border border-white/5"
                                        >
                                            <Edit2 size={18} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleToggleStatusFromDetail}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all border ${selectedStaff.user?.enabled ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}
                                        >
                                            <Power size={18} />
                                            {selectedStaff.user?.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleDeleteFromDetail}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                                    >
                                        <Trash2 size={18} />
                                        Delete Staff Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upsert Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <div className="relative bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                                        {isEditing ? <Edit2 className="text-amber-500" size={20} /> : <Plus className="text-indigo-500" size={20} />}
                                    </div>
                                    {isEditing ? 'Edit Staff Profile' : 'Register New Staff'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                            <input
                                                type="email"
                                                name="username"
                                                required
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                                placeholder="staff@hospital.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                required
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Work Shift</label>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                            <select
                                                name="shift"
                                                required
                                                value={formData.shift}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all appearance-none"
                                            >
                                                <option value="">Select Shift</option>
                                                <option value="Morning (8AM-4PM)">Morning (8AM-4PM)</option>
                                                <option value="Evening (4PM-12AM)">Evening (4PM-12AM)</option>
                                                <option value="Night (12AM-8AM)">Night (12AM-8AM)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 px-1">Residential Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                        <textarea
                                            name="address"
                                            required
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                            placeholder="Enter complete address"
                                        ></textarea>
                                    </div>
                                </div>

                                {!isEditing && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 px-1">Account Password</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500" size={18} />
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                                placeholder="Minimum 6 characters"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        {isEditing ? 'Save Changes' : 'Create Staff Account'}
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

export default StaffManagement;
