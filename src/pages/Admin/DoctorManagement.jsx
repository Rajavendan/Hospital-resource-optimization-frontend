import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    User,
    Mail,
    Phone,
    Clock,
    Calendar,
    Search,
    Edit2,
    Trash2,
    Plus,
    X,
    CheckCircle,
    AlertCircle,
    Stethoscope
} from 'lucide-react';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        phoneNumber: '',
        shiftStartTime: '',
        shiftEndTime: '',
        maxLoad: 10
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('/doctors');
            setDoctors(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch doctors", err);
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
            email: '',
            password: '',
            specialization: '',
            phoneNumber: '',
            shiftStartTime: '',
            shiftEndTime: '',
            maxLoad: 10
        });
        setShowModal(true);
    };

    const openEditModal = (doctor) => {
        setIsEditing(true);
        setCurrentDoctor(doctor);
        setFormData({
            name: doctor.name,
            email: doctor.email,
            password: '', // Password usually left blank for updates unless changing
            specialization: doctor.specialization,
            phoneNumber: doctor.phoneNumber || '',
            shiftStartTime: doctor.shiftStartTime,
            shiftEndTime: doctor.shiftEndTime,
            maxLoad: doctor.maxLoad
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`/doctors/${currentDoctor.id}`, formData);
                setMessage({ type: 'success', text: 'Doctor updated successfully.' });
            } else {
                await axios.post('/doctors', formData);
                setMessage({ type: 'success', text: 'Doctor registered successfully.' });
            }
            setShowModal(false);
            fetchDoctors();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Operation failed.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) return;
        try {
            await axios.delete(`/doctors/${id}`);
            setMessage({ type: 'success', text: 'Doctor deleted successfully.' });
            fetchDoctors();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete doctor.' });
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Stethoscope className="text-blue-600" />
                        Doctor Management
                    </h1>
                    <p className="text-slate-500">Register, update, or remove doctors from the system.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add New Doctor
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by Doctor Name or Specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-b">Doctor Name</th>
                            <th className="p-4 border-b">Specialization</th>
                            <th className="p-4 border-b">Contact</th>
                            <th className="p-4 border-b">Shift Timing</th>
                            <th className="p-4 border-b">Load Capacity</th>
                            <th className="p-4 border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-500">Loading doctors...</td></tr>
                        ) : filteredDoctors.length === 0 ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-500">No doctors found.</td></tr>
                        ) : (
                            filteredDoctors.map(doctor => (
                                <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        {doctor.name}
                                    </td>
                                    <td className="p-4 text-slate-600">{doctor.specialization}</td>
                                    <td className="p-4 text-sm text-slate-500 space-y-1">
                                        <div className="flex items-center gap-2"><Mail size={14} /> {doctor.email}</div>
                                        <div className="flex items-center gap-2"><Phone size={14} /> {doctor.phoneNumber || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            {doctor.shiftStartTime} - {doctor.shiftEndTime}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                            Max: {doctor.maxLoad}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(doctor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={18} />
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
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Doctor' : 'Register New Doctor'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Dr. John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login ID)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="doctor@hospital.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            name="specialization"
                                            required
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Specialization</option>
                                            <option value="General Physician">General Physician</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Orthopedic">Orthopedic</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift Start</label>
                                    <input
                                        type="time"
                                        name="shiftStartTime"
                                        required
                                        value={formData.shiftStartTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift End</label>
                                    <input
                                        type="time"
                                        name="shiftEndTime"
                                        required
                                        value={formData.shiftEndTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Daily Load</label>
                                    <input
                                        type="number"
                                        name="maxLoad"
                                        required
                                        min="1"
                                        value={formData.maxLoad}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
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
                                    className="w-full py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    {isEditing ? 'Update Doctor' : 'Register Doctor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorManagement;
