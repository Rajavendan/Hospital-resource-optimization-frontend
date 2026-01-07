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
    Briefcase
} from 'lucide-react';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

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

    const openEditModal = (staff) => {
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

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/api/admin/staff/${id}/toggle`);
            setMessage({ type: 'success', text: 'Staff status updated.' });
            fetchStaff();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update status.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/staff/${id}`);
            setMessage({ type: 'success', text: 'Staff deleted successfully.' });
            fetchStaff();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete staff.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 text-white">
                        <Briefcase className="text-blue-600" />
                        Staff Management
                    </h1>
                    <p className="text-slate-500">Manage support staff, nurses, and administrative personnel.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add New Staff
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search Staff via Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-purple border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="bg-blue rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse bg-blue">
                    <thead className="bg-slack-50 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-b text-white">Staff Name</th>
                            <th className="p-4 border-b text-white">Contact</th>
                            <th className="p-4 border-b text-white">Shift</th>
                            <th className="p-4 border-b text-white">Status</th>
                            <th className="p-4 border-b text-right text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-6 text-center text-slate-500 text-white">Loading staff...</td></tr>
                        ) : filteredStaff.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-slate-500 text-white">No staff found.</td></tr>
                        ) : (
                            filteredStaff.map(staff => (
                                <tr key={staff.id} className="hover:bg-black-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold ">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div className='text-white'>{staff.name}</div>
                                        </div>
                                        <div className="text-xs text-slate-400 pl-10 text-white">{staff.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 text-white">
                                        <div className="flex items-center gap-2 mb-1 text-white"><Phone size={14} /> {staff.phoneNumber}</div>
                                        <div className="flex items-center gap-2 text-white"><MapPin size={14} /> {staff.address}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400 text-white" />
                                            <div className='text-white'>{staff.shift}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleStatus(staff.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${staff.user?.enabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                        >
                                            {staff.user?.enabled ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(staff)} className="p-2 text-blue-600  rounded-lg">
                                            <Edit2 size={18}
                                                className="text-blue-400 transition-transform duration-200 hover:scale-150" />
                                        </button>
                                        <button onClick={() => handleDelete(staff.id)} className="p-2 text-red-600  rounded-lg">
                                            <Trash2 size={18}
                                                className="text-red-400 transition-transform duration-200 hover:scale-150" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-black rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-black">
                            <h2 className="text-xl font-bold text-slate-800 text-white">{isEditing ? 'Edit Staff' : 'Register New Staff'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Staff Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Email (Login ID)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            name="username"
                                            required
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="staff@hospital.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Shift</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            name="shift"
                                            required
                                            value={formData.shift}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Shift</option>
                                            <option value="Morning (8AM-4PM)">Morning (8AM-4PM)</option>
                                            <option value="Evening (4PM-12AM)">Evening (4PM-12AM)</option>
                                            <option value="Night (12AM-8AM)">Night (12AM-8AM)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <textarea
                                        name="address"
                                        required
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full Address"
                                    ></textarea>
                                </div>
                            </div>

                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 text-white">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    {isEditing ? 'Update Staff' : 'Register Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
