import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [beds, setBeds] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        // Only fetch if user is authenticated AND token exists
        if (!user) return;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.warn('User exists but no token found, skipping data fetch');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch data based on user role
                if (user.role === 'patient') {
                    const [aptRes, docRes] = await Promise.allSettled([
                        api.get('/appointments/my-schedule'),
                        api.get('/doctors')
                    ]);

                    // Log errors for debugging
                    if (aptRes.status === 'rejected') {
                        console.error("Fetch appointments failed:", aptRes.reason?.response?.status, aptRes.reason?.response?.data || aptRes.reason?.message);
                    }
                    if (docRes.status === 'rejected') {
                        console.error("Fetch doctors failed:", docRes.reason?.response?.status, docRes.reason?.response?.data || docRes.reason?.message);
                    }

                    setAppointments(aptRes.status === 'fulfilled' ? aptRes.value.data : []);
                    setDoctors(docRes.status === 'fulfilled' ? docRes.value.data : []);
                    // Reset others
                    setPatients([]);
                    setBeds([]);
                    setEquipment([]);
                } else {
                    // Staff/Doctor/Admin can access everything
                    const results = await Promise.allSettled([
                        api.get('/patients').catch(e => ({ data: [] })),
                        api.get('/appointments').catch(e => ({ data: [] })),
                        api.get('/resources/beds').catch(e => ({ data: [] })),
                        api.get('/doctors').catch(e => ({ data: [] })),
                        api.get('/resources/equipment').catch(e => ({ data: [] }))
                    ]);

                    setPatients(results[0].status === 'fulfilled' ? results[0].value.data : []);
                    setAppointments(results[1].status === 'fulfilled' ? results[1].value.data : []);
                    setBeds(results[2].status === 'fulfilled' ? results[2].value.data : []);
                    setDoctors(results[3].status === 'fulfilled' ? results[3].value.data : []);
                    setEquipment(results[4].status === 'fulfilled' ? results[4].value.data : []);
                }

            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast.error("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Actions
    const addPatient = async (patient) => {
        try {
            const res = await api.post('/patients', patient);
            setPatients(prev => [...prev, res.data]);
            toast.success("Patient added successfully");
            return res.data;
        } catch (e) {
            console.error("Add patient failed", e);
            toast.error("Failed to add patient");
        }
    };

    const updatePatient = (updatedPatient) => {
        // Mock update locally for now as no PUT endpoint defined in initial backend plan for everything
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    };

    const removePatient = async (id) => {
        try {
            await api.delete(`/staff/admissions/${id}`);
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success("Patient removed successfully");
        } catch (e) {
            console.error("Delete patient failed", e);
            toast.error("Failed to delete patient");
        }
    };

    const addAppointment = async (appointment) => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            const error = new Error('No authentication token found. Please log in again.');
            toast.error(error.message);
            throw error;
        }

        try {
            const res = await api.post('/appointments/book', appointment);
            // Update appointments list after successful booking
            setAppointments(prev => [...prev, res.data]);
            toast.success("Appointment booked successfully");
            return res.data;
        } catch (e) {
            console.error("Booking failed", e);
            const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || "Booking failed";
            toast.error("Booking failed: " + errorMessage);
            throw e;
        }
    };

    const cancelAppointment = async (id) => {
        try {
            await api.delete(`/appointments/${id}`);
            setAppointments(prev => prev.filter(a => a.id !== id));
            toast.success("Appointment cancelled");
        } catch (e) {
            console.error("Cancellation failed", e);
            toast.error("Failed to cancel appointment");
        }
    };

    const updateBedStatus = (bedId, status, patientId = null) => {
        // Local update until atomic allocation is used primarily
        setBeds(prev => prev.map(bed =>
            bed.id === bedId ? { ...bed, status, patientId } : bed
        ));
    };

    const toggleBedStatus = (bedId) => {
        // Optimistic UI update
        setBeds(prev => prev.map(bed => {
            if (bed.id === bedId) {
                // In a real app we would call an API here.
                // For now we just flip local state.
                const newStatus = bed.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
                // Note: Backend uses uppercase 'AVAILABLE'/'OCCUPIED'
                return { ...bed, status: newStatus, patient: newStatus === 'AVAILABLE' ? null : bed.patient };
            }
            return bed;
        }));
    };

    const allocateResources = async (patientId) => {
        try {
            // Need the full patient object usually, but backend might just take ID or object
            // Our Service takes 'Patient' body.
            const patient = patients.find(p => p.id === patientId);
            if (!patient) return;

            await api.post('/resources/allocate', patient);

            // Refresh beds after allocation
            const res = await api.get('/resources/beds');
            setBeds(res.data);

            toast.success("Resources allocated successfully for " + patient.name);
        } catch (e) {
            console.error("Allocation failed", e);
            toast.error("Allocation Failed: " + (e.response?.data || e.message));
        }
    };

    const getPatient = (id) => patients.find(p => p.id === id);

    // Refresh appointments function for patients
    const refreshAppointments = async () => {
        if (!user || user.role !== 'patient') return;

        const token = localStorage.getItem('jwtToken');
        if (!token) return;

        try {
            const response = await api.get('/appointments/my-schedule');
            setAppointments(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Failed to refresh appointments:', error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{
            patients, addPatient, updatePatient, removePatient, getPatient,
            appointments, addAppointment, cancelAppointment, refreshAppointments,
            beds, updateBedStatus, toggleBedStatus,
            doctors, setDoctors, equipment, allocateResources,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
