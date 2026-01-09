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

    useEffect(() => {
        if (!user) return;



        const fetchData = async () => {
            setLoading(true);
            try {
                if (user.role === 'PATIENT') {
                    const [aptRes, docRes] = await Promise.allSettled([
                        api.get('/api/appointments/my-schedule'),
                        api.get('/api/doctors')
                    ]);

                    setAppointments(aptRes.status === 'fulfilled' ? aptRes.value.data : []);
                    setDoctors(docRes.status === 'fulfilled' ? docRes.value.data : []);

                    setPatients([]);
                    setBeds([]);
                    setEquipment([]);
                } else {
                    const results = await Promise.allSettled([
                        api.get('/api/patients'),
                        api.get('/api/appointments'),
                        api.get('/api/resources/beds'),
                        api.get('/api/doctors'),
                        api.get('/api/resources/equipment')
                    ]);

                    setPatients(results[0].status === 'fulfilled' ? results[0].value.data : []);
                    setAppointments(results[1].status === 'fulfilled' ? results[1].value.data : []);
                    setBeds(results[2].status === 'fulfilled' ? results[2].value.data : []);
                    setDoctors(results[3].status === 'fulfilled' ? results[3].value.data : []);
                    setEquipment(results[4].status === 'fulfilled' ? results[4].value.data : []);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- NO CHANGES BELOW THIS LINE ---
    const addPatient = async (patient) => {
        const res = await api.post('/api/patients', patient);
        setPatients(prev => [...prev, res.data]);
        return res.data;
    };

    const cancelAppointment = async (id) => {
        await api.delete(`/api/appointments/${id}`);
        setAppointments(prev => prev.filter(a => a.id !== id));
    };

    const removePatient = async (id) => {
        await api.delete(`/api/patients/${id}`);
        setPatients(prev => prev.filter(p => p.id !== id));
    };

    const refreshAppointments = async () => {
        if (!user || user.role !== 'PATIENT') return;
        const res = await api.get('/api/appointments/my-schedule');
        setAppointments(res.data || []);
        return res.data;
    };

    return (
        <DataContext.Provider value={{
            patients, setPatients,
            appointments, setAppointments,
            beds, setBeds,
            doctors, setDoctors,
            equipment, setEquipment,
            addPatient,
            removePatient,
            cancelAppointment,
            refreshAppointments,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
