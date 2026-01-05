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

    useEffect(() => {
        if (selectedDepartment) {
            setLoading(true);
            api.get(`/doctors/by-department/${selectedDepartment}`)
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
            // Mocking available slots for simplicity, ideally fetch from backend
            const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
            // Filter out booked slots if backend provided endpoint
            setAvailableSlots(slots);
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
            patient: { id: user.id },
            doctor: { id: parseInt(selectedDoctor) },
            date: selectedDate,
            time: selectedTime,
            status: 'SCHEDULED'
        };

        try {
            await api.post('/appointments/book', apptData);

            // Find doctor name for display
            const docObj = doctors.find(d => d.id === parseInt(selectedDoctor));

            toast.success("Appointment booked successfully!");

            setBookingStatus({
                doctor: docObj ? docObj.name : 'Unknown',
                date: selectedDate,
                time: selectedTime,
                dept: selectedDepartment
            });
        } catch (error) {
            console.error("Booking failed:", error);
            const msg = error.response?.data?.message || "Failed to book appointment";
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
    };

    if (bookingStatus) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 ">Booking Confirmed!</h2>
                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mt-6">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Doctor</span>
                        <span className="font-medium text-slate-800">{bookingStatus.doctor}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Department</span>
                        <span className="font-medium text-slate-800">{bookingStatus.dept}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="font-medium text-slate-800">{bookingStatus.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Time</span>
                        <span className="font-medium text-slate-800">{bookingStatus.time}</span>
                    </div>
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
