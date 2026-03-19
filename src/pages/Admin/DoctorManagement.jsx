import React, { useState, useEffect } from "react";
import api from "../../api/axios";
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
  Stethoscope,
  ChevronRight,
  Info,
} from "lucide-react";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phoneNumber: "",
    shiftStartTime: "",
    shiftEndTime: "",
    maxLoad: 10,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/doctors");
      setDoctors(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      specialization: "",
      phoneNumber: "",
      shiftStartTime: "",
      shiftEndTime: "",
      maxLoad: 10,
    });
    setShowModal(true);
  };

  const openEditModalFromDetail = () => {
    const doctor = selectedDoctor;
    setShowDetailModal(false);
    setIsEditing(true);
    setCurrentDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: "",
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber || "",
      shiftStartTime: doctor.shiftStartTime,
      shiftEndTime: doctor.shiftEndTime,
      maxLoad: doctor.maxLoad,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/doctors/${currentDoctor.id}`, formData);
        setMessage({ type: "success", text: "Doctor updated successfully." });
      } else {
        await api.post("/api/doctors", formData);
        setMessage({
          type: "success",
          text: "Doctor registered successfully.",
        });
      }
      setShowModal(false);
      fetchDoctors();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Operation failed.";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const handleDeleteFromDetail = async () => {
    const id = selectedDoctor.id;
    if (
      !window.confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone."
      )
    )
      return;
    try {
      await api.delete(`/api/doctors/${id}`);
      setMessage({ type: "success", text: "Doctor deleted successfully." });
      setShowDetailModal(false);
      fetchDoctors();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete doctor." });
    }
  };

  const handleCardClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-24 lg:pb-8">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <Stethoscope className="text-blue-500" size={28} />
              </div>
              <span className="text-white tracking-tight">Doctor Management</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm lg:text-base hidden sm:block">
              Manage your healthcare professionals and their schedules.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Add New Doctor
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${message.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Search Bar - Mobile Optimized */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search doctors, specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-slate-600" size={40} />
              </div>
              <h3 className="text-white font-bold text-lg">No Doctors Found</h3>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleCardClick(doctor)}
                className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors truncate">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-400/80 text-sm font-medium truncate">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                      <span className="text-xs text-slate-500">Available Now</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB for Mobile */}
        <button
          onClick={openAddModal}
          className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition-all active:scale-90 z-40"
        >
          <Plus size={32} />
        </button>

        {/* Detail Modal */}
        {showDetailModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
            <div className="relative w-full max-w-lg bg-slate-900 sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:duration-300">
              {/* Modal Header/Cover */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Doctor Avatar */}
              <div className="px-6 relative">
                <div className="-mt-12 mb-4 w-24 h-24 bg-slate-900 rounded-3xl p-1.5 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                    {selectedDoctor.name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-6 pt-0 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-blue-400 font-semibold">{selectedDoctor.specialization}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</p>
                      <p className="text-white truncate">{selectedDoctor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <Phone size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="text-white">{selectedDoctor.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Shift Schedule</p>
                      <p className="text-white">{selectedDoctor.shiftStartTime} - {selectedDoctor.shiftEndTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                      <Info size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Daily Capacity</p>
                      <p className="text-white">{selectedDoctor.maxLoad} Patients/Day</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={openEditModalFromDetail}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeleteFromDetail}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl font-bold transition-all border border-red-500/20"
                  >
                    <Trash2 size={18} />
                    Delete
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
                  <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                    {isEditing ? <Edit2 className="text-amber-500" size={20} /> : <Plus className="text-blue-500" size={20} />}
                  </div>
                  {isEditing ? "Edit Doctor" : "Register New Doctor"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                        placeholder="e.g. Dr. John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                        placeholder="doctor@hospital.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Specialization</label>
                    <div className="relative group">
                      <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
                      <select
                        name="specialization"
                        required
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all appearance-none"
                      >
                        <option value="">Select Department</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Psychiatry">Psychiatry</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Shift Start</label>
                    <input
                      type="time"
                      name="shiftStartTime"
                      required
                      value={formData.shiftStartTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Shift End</label>
                    <input
                      type="time"
                      name="shiftEndTime"
                      required
                      value={formData.shiftEndTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Max Daily Patients</label>
                    <input
                      type="number"
                      name="maxLoad"
                      required
                      min="1"
                      value={formData.maxLoad}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                    />
                  </div>
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 px-1">Default Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600"
                      placeholder="Min. 6 characters"
                    />
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
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isEditing ? "Update Profile" : "Create Account"}
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

export default DoctorManagement;
