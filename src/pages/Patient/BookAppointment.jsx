import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BookAppointment = () => {
    const { user } = useAuth();

    const [departments, setDepartments] = useState(['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']);
    const [doctors, setDoctors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [consultationType, setConsultationType] = useState('PHYSICAL');

    useEffect(() => {
        if (selectedDepartment) {
            setLoading(true);
            api.get(`/api/doctors/by-department/${selectedDepartment}`)
                .then(res => {
                    setDoctors(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load doctors", err);
                    setLoading(false);
                });
        } else {
            setDoctors([]);
        }
    }, [selectedDepartment]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            setLoading(true);
            api.get(`/api/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`)
                .then(res => {
                    setAvailableSlots(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load slots", err);
                    setAvailableSlots([]);
                    setLoading(false);
                    toast.error("Failed to load available slots");
                });
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDoctor, selectedDate]);

    const handleBook = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            toast.error("Session expired. Please login again.");
            return;
        }

        const apptData = {
            doctorId: parseInt(selectedDoctor),
            appointmentDate: selectedDate,
            appointmentTime: selectedTime.substring(0, 5),
            status: 'SCHEDULED',
            consultationType: consultationType
        };

        try {
            await api.post('/api/appointments/book', apptData);

            // Find doctor name for display
            const docObj = doctors.find(d => d.id === parseInt(selectedDoctor));

            toast.success("Appointment booked successfully!");

            setBookingStatus({
                doctor: docObj ? docObj.name : 'Unknown',
                date: selectedDate,
                time: selectedTime,
                dept: selectedDepartment,
                type: consultationType
            });
        } catch (error) {
            console.error("Booking failed:", error);
            let msg = "Failed to book appointment";
            if (error.response) {
                if (error.response.status === 409) {
                    msg = error.response.data.message || "This slot is no longer available.";
                    setAvailableSlots(prev => prev.filter(s => s !== selectedTime));
                } else {
                    msg = error.response.data.message || "An error occurred.";
                }
            }
            toast.error(msg);
        }
    };

    const resetForm = () => {
        setBookingStatus(null);
        setSelectedDepartment('');
        setSelectedDoctor('');
        setSelectedDate('');
        setSelectedTime('');
        setAvailableSlots([]);
        setConsultationType('PHYSICAL');
    };

    if (bookingStatus) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-8 bg-black rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 ">Booking Confirmed!</h2>
                <div className="bg-purple rounded-xl p-4 text-left space-y-3 mt-6">
                    <div className="flex justify-between">
                        <span className="text-white">Doctor</span>
                        <span className="font-medium text-white">{bookingStatus.doctor}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">Department</span>
                        <span className="font-medium text-white">{bookingStatus.dept}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">Date</span>
                        <span className="font-medium text-white">{bookingStatus.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">Time</span>
                        <span className="font-medium text-white">{bookingStatus.time}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">Type</span>
                        <span className={`font-medium ${bookingStatus.type === 'VIDEO' ? 'text-blue-400' : 'text-white'}`}>
                            {bookingStatus.type}
                        </span>
                    </div>
                    {bookingStatus.type === 'VIDEO' && (
                        <div className="mt-2 p-3 bg-blue-500/10 rounded border border-blue-500/30 text-sm text-blue-200">
                            ⓘ A video meeting link has been generated. You can join 5 minutes before the appointment time from your dashboard.
                        </div>
                    )}
                </div>
                <button
                    onClick={resetForm}
                    className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Book Another Appointment
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto ">
            <h1 className="text-2xl font-bold text-slate mb-6">Book New Appointment</h1>

            <div className="bg-black rounded-xl shadow-sm border border-slate-100 p-8">
                <form onSubmit={handleBook} className="space-y-6">

                    {/* Consultation Type Selection */}
                    <div className="flex gap-4 mb-4">
                        <label className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${consultationType === 'PHYSICAL' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="PHYSICAL"
                                checked={consultationType === 'PHYSICAL'}
                                onChange={(e) => setConsultationType(e.target.value)}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2">
                                <User size={20} />
                                <span className="font-bold">In-Person Visit</span>
                            </div>
                        </label>
                        <label className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${consultationType === 'VIDEO' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="VIDEO"
                                checked={consultationType === 'VIDEO'}
                                onChange={(e) => setConsultationType(e.target.value)}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">📹</span>
                                <span className="font-bold">Video Consult</span>
                            </div>
                        </label>
                    </div>

                    {/* Department Logic */}
                    <div>
                        <label className="block text-sm  text-slate mb-2 font-bold">Department</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Doctor Logic */}
                    <div>
                        <label className="block text-sm font-bold text-slate mb-2">Doctor</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                            <select
                                className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                disabled={!selectedDepartment}
                                required
                            >
                                <option value="">{loading ? 'Loading Doctors...' : 'Select Doctor'}</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Logic */}
                    <div>
                        <label className="block text-sm font-bold text-slate mb-2">Preferred Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 text-slate-400" size={20} />
                            <input
                                type="date"
                                className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Time Logic */}
                    <div>
                        <label className="block text-sm font-bold text-slate mb-2">Preferred Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                            <select
                                className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                required
                                disabled={!selectedDate || !selectedDoctor}
                            >
                                <option value="">Select Time</option>
                                {availableSlots.length > 0 ? (
                                    availableSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No slots available</option>
                                )}
                            </select>
                        </div>
                        {selectedDoctor && selectedDate && availableSlots.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">No slots available for this date.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedDoctor || !selectedDate || !selectedTime}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Appointment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
