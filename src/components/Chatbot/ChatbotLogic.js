import api from '../../api/axios';

// --- Constants ---
const INTENTS = {
    GREETING: 'greeting',
    CHECK_AVAILABILITY: 'check_availability',
    BOOK_APPOINTMENT: 'book_appointment',
    HOSPITAL_INFO: 'hospital_info',
    DEPARTMENT_LOCATION: 'department_location',
    DOCTOR_LOCATION: 'doctor_location',
    HOSPITAL_MAP: 'hospital_map',
    EMERGENCY: 'emergency',
    UNKNOWN: 'unknown',
    CONFIRM_BOOKING: 'confirm_booking',
    CANCEL_BOOKING: 'cancel_booking',
    SYMPTOM_CHECK: 'symptom_check',
    RESCHEDULE: 'reschedule',
    PRESCRIPTION_CHECK: 'prescription_check',
    REPORT_CHECK: 'report_check',
    BILLING_CHECK: 'billing_check',
    INSURANCE_INFO: 'insurance_info',
    QUEUE_STATUS: 'queue_status',
    NEXT_VISIT: 'next_visit'
};

const HOSPITAL_DATA = {
    departments: {
        'ct scan': '3rd Floor, Room 309',
        'billing': '5th Floor, Room 502',
        'admission': 'Ground Floor',
        'pharmacy': 'Ground Floor',
        'cardiology': 'Floor 3',
        'orthology': 'Floor 2',
        'neurology': 'Floor 4',
        'emergency': 'Ground Floor (24/7)',
        'pathology': 'Floor 2'
    },
    hours: {
        open: '08:00',
        close: '21:00'
    }
};

const DOCTOR_ROOMS = {
    'raja': { specialization: 'Cardiologist', room: 'Room 301' },
    'kumar': { specialization: 'Orthology', room: 'Room 203' },
    'meena': { specialization: 'Neurology', room: 'Room 401' },
    'arjun': { specialization: 'General Medicine', room: 'Room 102' }
};

const SYMPTOM_MAP = {
    'chest': 'Cardiologist',
    'heart': 'Cardiologist',
    'breath': 'Cardiologist',
    'bone': 'Orthology',
    'fracture': 'Orthology',
    'joint': 'Orthology',
    'knee': 'Orthology',
    'back': 'Orthology',
    'head': 'Neurology',
    'brain': 'Neurology',
    'nerve': 'Neurology',
    'dizzy': 'Neurology',
    'fever': 'General Medicine',
    'cold': 'General Medicine',
    'flu': 'General Medicine',
    'stomach': 'General Medicine',
    'vomit': 'General Medicine',
    'cough': 'General Medicine'
};

const MAP_LINK = "https://maps.app.goo.gl/psbHeHnc9qeu3Sr28";

// --- Core Logic Class ---

class ChatbotLogic {
    constructor(setStateCallback) {
        this.setState = setStateCallback;
        this.context = {
            step: 'idle', // idle, awaiting_doctor, awaiting_date, awaiting_time, awaiting_confirmation, awaiting_reschedule_select
            data: {}, // Stores booking details: { doctorId, doctorName, date, time, oldAppointmentId }
            allDoctors: [],
            myAppointments: []
        };
    }

    async processInput(input, user) {
        const lowerInput = input.toLowerCase();

        // 1. Handle Active Conversation Flow
        if (this.context.step !== 'idle' && !this.isCancelCommand(lowerInput)) {
            return await this.handleFlow(lowerInput, user);
        }

        // 2. Intent Recognition
        const intent = this.identifyIntent(input);

        // 3. Execute Intent
        switch (intent) {
            case INTENTS.GREETING:
                return {
                    text: `Hello ${user?.name || 'there'}! I'm Kiwi 🥝. I can help with appointments, reports, billing, and more.`,
                    options: ['Book Appointment', 'Check Symptoms', 'My Prescriptions', 'My Bills']
                };

            case INTENTS.HOSPITAL_INFO:
                return this.getHospitalInfo(lowerInput);

            case INTENTS.DEPARTMENT_LOCATION:
                if (input.toLowerCase().includes('location') && !this.hasSpecificDepartment(lowerInput)) {
                    return {
                        text: "I can help you find specific departments. Here are a few:",
                        options: ['Where is Billing?', 'Where is Pharmacy?', 'Where is CT Scan?']
                    };
                }
                return this.getHospitalInfo(lowerInput);

            case INTENTS.DOCTOR_LOCATION:
                return this.getDoctorLocation(lowerInput);

            case INTENTS.HOSPITAL_MAP:
                return {
                    text: "Opening hospital location in Google Maps...",
                    link: MAP_LINK,
                    linkText: "Click to open Map",
                    options: ['Where is Pharmacy?', 'Find a Doctor']
                };

            case INTENTS.EMERGENCY:
                return {
                    text: "EMERGENCY: Please call for an ambulance immediately!",
                    action: 'call_ambulance',
                    actionText: "🚑 Call Ambulance (108)",
                    isUrgent: true,
                    options: ['Hospital Map']
                };

            case INTENTS.CHECK_AVAILABILITY:
                return await this.checkDoctorAvailability(lowerInput);

            case INTENTS.SYMPTOM_CHECK:
                return await this.handleSymptomCheck(lowerInput);

            case INTENTS.BOOK_APPOINTMENT:
                return await this.initiateBooking(lowerInput);

            case INTENTS.RESCHEDULE:
                return await this.initiateReschedule(user);

            case INTENTS.PRESCRIPTION_CHECK:
                return await this.checkPrescriptions(user);

            case INTENTS.REPORT_CHECK:
                return await this.checkReports(user);

            case INTENTS.BILLING_CHECK:
                return await this.checkBilling(user);

            case INTENTS.INSURANCE_INFO:
                return {
                    text: "We accept most major insurance providers including LIC, Star Health, and HDFC ERGO. Please visit the Admission Desk (Ground Floor) for pre-authorization assistance.",
                    options: ['Where is Admission Desk?', 'My Bills']
                };

            case INTENTS.QUEUE_STATUS:
                return this.getQueueStatus(lowerInput);

            case INTENTS.NEXT_VISIT:
                return await this.checkNextVisit(user);

            case INTENTS.CANCEL_BOOKING:
                this.resetContext();
                return { text: "Booking cancelled.", options: ['Book Appointment', 'Hospital Map'] };

            default:
                return {
                    text: "I'm not sure I understood that. You can ask me about appointments, reports, billing, or finding a doctor.",
                    options: ['My Prescriptions', 'My Reports', 'Find a Doctor', 'Check Symptoms']
                };
        }
    }

    isCancelCommand(input) {
        return ['cancel', 'stop', 'abort', 'exit'].includes(input);
    }

    resetContext() {
        this.context = {
            step: 'idle',
            data: {},
            allDoctors: [],
            myAppointments: []
        };
    }

    identifyIntent(input) {
        const lower = input.toLowerCase();

        // Exact Button Matches
        if (input === 'Check Symptoms' || lower.includes('symptom')) return INTENTS.SYMPTOM_CHECK;
        if (input === 'Book Appointment' || lower === 'book') return INTENTS.BOOK_APPOINTMENT;
        if (input === 'Reschedule' || lower.includes('reschedule') || (lower.includes('move') && lower.includes('appointment'))) return INTENTS.RESCHEDULE;
        if (input === 'My Prescriptions' || input === 'My Medicines') return INTENTS.PRESCRIPTION_CHECK;
        if (input === 'My Bills') return INTENTS.BILLING_CHECK;
        if (input === 'My Reports') return INTENTS.REPORT_CHECK;


        // Emergency
        if (/(emergency|ambulance|help|urgent)/.test(lower)) return INTENTS.EMERGENCY;

        // Map
        if (/(where.*hospital|location.*hospital|show.*map|google.*map)/.test(lower)) return INTENTS.HOSPITAL_MAP;

        // Patient Support
        if (/(prescription|medicine|meds|drug|pill)/.test(lower)) return INTENTS.PRESCRIPTION_CHECK;
        if (/(report|result|lab)/.test(lower)) return INTENTS.REPORT_CHECK;
        if (/(bill|invoice|payment|cost|owe)/.test(lower)) return INTENTS.BILLING_CHECK;
        if (/(insurance|coverage|policy|claim)/.test(lower)) return INTENTS.INSURANCE_INFO;
        if (/(queue|wait|long.*wait)/.test(lower)) return INTENTS.QUEUE_STATUS;
        if (/(next.*visit|follow.*up|when.*come.*back)/.test(lower)) return INTENTS.NEXT_VISIT;

        // Doctor Suggestion / Symptom Check
        const symptoms = Object.keys(SYMPTOM_MAP);
        if (symptoms.some(s => lower.includes(s))) return INTENTS.SYMPTOM_CHECK;

        // Doctor Location
        if (/(where.*dr|which.*room.*dr|find.*dr)/.test(lower)) return INTENTS.DOCTOR_LOCATION;
        if (/(which.*room.*cardiologist|which.*room.*orthology)/.test(lower)) return INTENTS.DOCTOR_LOCATION;

        // Department Location
        if (/(where is|location|floor|find)/.test(lower) && this.hasSpecificDepartment(lower)) return INTENTS.DEPARTMENT_LOCATION;

        // General Info
        if (/(open|close|hours|time)/.test(lower) && /(hospital|clinic)/.test(lower)) return INTENTS.HOSPITAL_INFO;

        // Availability & Booking
        if (/(available|free|when.*doctor)/.test(lower)) return INTENTS.CHECK_AVAILABILITY;
        if (/(book|schedule|appointment)/.test(lower)) return INTENTS.BOOK_APPOINTMENT;

        if (/(cancel|stop)/.test(lower)) return INTENTS.CANCEL_BOOKING;
        if (/(hello|hi|hey|greetings)/.test(lower)) return INTENTS.GREETING;

        return INTENTS.UNKNOWN;
    }

    hasSpecificDepartment(input) {
        const depts = Object.keys(HOSPITAL_DATA.departments);
        return depts.some(d => input.includes(d));
    }

    getHospitalInfo(input) {
        for (const [dept, loc] of Object.entries(HOSPITAL_DATA.departments)) {
            if (input.includes(dept)) {
                return { text: `${dept.charAt(0).toUpperCase() + dept.slice(1)} is located on ${loc}.` };
            }
        }
        if (input.includes('hour') || input.includes('open') || input.includes('close')) {
            return { text: `The hospital is open from ${HOSPITAL_DATA.hours.open} AM to ${HOSPITAL_DATA.hours.close} PM every day. Emergency services are 24/7.` };
        }
        return { text: "I can help you find departments like Cardiology, Billing, or Pharmacy. Which one are you looking for?" };
    }

    getDoctorLocation(input) {
        for (const [name, details] of Object.entries(DOCTOR_ROOMS)) {
            if (input.includes(name)) {
                return { text: `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)} (${details.specialization}) is in ${details.room}.` };
            }
        }
        for (const [name, details] of Object.entries(DOCTOR_ROOMS)) {
            if (input.includes(details.specialization.toLowerCase())) {
                return { text: `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)} is the ${details.specialization} in ${details.room}.` };
            }
        }
        return { text: "I couldn't find the room for that doctor. Please check the name or specialization." };
    }

    getQueueStatus(input) {
        const nameMatch = input.match(/dr\.?\s?([a-zA-Z]+)/);
        const name = nameMatch ? nameMatch[1] : null;

        const queueCount = Math.floor(Math.random() * 4) + 1; // 1-5 people
        const waitTime = queueCount * 15; // 15 mins per person

        if (name) {
            return { text: `Live Estimate: Dr. ${name} has approx. ${queueCount} patients in waiting. Estimated wait time: ${waitTime} mins.` };
        }
        return { text: `Average wait time is currently 15-30 minutes across departments. Checking specific doctor queues...` };
    }

    // --- Patient Support Logic ---

    async checkPrescriptions(user) {
        try {
            const res = await api.get('/api/patient/visits');
            const allPrescriptions = res.data.flatMap(visit =>
                (visit.prescriptions || []).map(p => `${p.medicineName} (${p.dosage})`)
            );

            if (allPrescriptions.length === 0) {
                return { text: "You don't have any active prescriptions on file." };
            }

            return {
                text: "Here are your recent prescriptions:",
                options: allPrescriptions.slice(0, 4)
            };
        } catch (e) {
            console.error(e);
            return { text: "I couldn't fetch your prescriptions. Please check the 'Prescriptions' tab." };
        }
    }

    async checkReports(user) {
        try {
            const res = await api.get('/api/patient/reports');
            const reports = res.data;

            if (reports.length === 0) {
                return { text: "I checked your records and didn't find any uploaded medical reports." };
            }

            return {
                text: "Here are your latest reports:",
                options: reports.slice(0, 3).map(r => r.fileName)
            };
        } catch (e) {
            return { text: "I couldn't fetch your reports right now." };
        }
    }

    async checkBilling(user) {
        try {
            const res = await api.get('/api/patient/billing');
            const bills = res.data;
            const totalPending = bills.reduce((acc, bill) => acc + ((bill.totalAmount || 0) - (bill.paidAmount || 0)), 0);

            if (totalPending > 0) {
                return {
                    text: `You have a total pending balance of $${totalPending.toFixed(2)}. Please visit the Billing Counter (5th Floor) to clear your dues.`,
                    options: ['Where is Billing?', 'Download Invoice']
                };
            }
            return { text: "You have no pending bills. All clear! ✅" };
        } catch (e) {
            return { text: "I couldn't access your billing info." };
        }
    }

    async checkNextVisit(user) {
        try {
            const res = await api.get('/api/patient/visits');
            const visits = res.data;

            // Filter visits that have a followUpDate in the future
            const upcomingVisits = visits
                .filter(v => v.followUpDate && new Date(v.followUpDate) >= new Date().setHours(0, 0, 0, 0))
                .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));

            if (upcomingVisits.length > 0) {
                const next = upcomingVisits[0];
                return {
                    text: `Your next scheduled visit is on ${new Date(next.followUpDate).toLocaleDateString()} with Dr. ${next.doctor?.user?.name || 'your doctor'}.`,
                    options: ['Book Appointment', 'My Prescriptions']
                };
            } else {
                return {
                    text: "I don't see any scheduled follow-up visits in your history.",
                    options: ['Book Appointment', 'Check Availability']
                };
            }
        } catch (e) {
            console.error(e);
            return { text: "I couldn't check your visit history right now." };
        }
    }

    // --- Symptom Checker Logic ---
    async handleSymptomCheck(input) {
        let detectedSymptom = null;
        for (const [symptom, spec] of Object.entries(SYMPTOM_MAP)) {
            if (input.includes(symptom)) {
                detectedSymptom = { symptom, spec };
                break;
            }
        }

        if (!detectedSymptom) {
            return { text: "I'm not sure which specialist you need. Try describing your symptom like 'heache', 'chest pain', or 'fever'." };
        }

        try {
            const response = await api.get('/api/doctors');
            const doctors = response.data;
            const specialists = doctors.filter(d =>
                d.specialization.toLowerCase() === detectedSymptom.spec.toLowerCase() ||
                (detectedSymptom.spec === 'Orthology' && d.specialization.toLowerCase().includes('ortho')) // Handle ortho variations
            );

            if (specialists.length > 0) {
                return {
                    text: `For ${detectedSymptom.symptom}, I recommend a ${detectedSymptom.spec}. Here are the available doctors:`,
                    // FIX: Prevent double DR prefix if name already has it
                    options: specialists.map(d => `Book ${d.name.toLowerCase().startsWith('dr.') ? '' : 'Dr. '}${d.name}`)
                };
            } else {
                return { text: `I recommend a ${detectedSymptom.spec} for ${detectedSymptom.symptom}, but I don't see any available right now.` };
            }
        } catch (e) {
            console.error(e);
            return { text: "I'm having trouble fetching the doctor list." };
        }
    }

    async checkDoctorAvailability(input) {
        const nameMatch = input.match(/dr\.?\s?([a-zA-Z\s]+)/i);
        const name = nameMatch ? nameMatch[1].trim() : null;

        try {
            const response = await api.get('/api/doctors');
            const doctors = response.data;

            if (name) {
                const found = doctors.filter(d => d.name.toLowerCase().includes(name.toLowerCase()));
                if (found.length > 0) {
                    const doc = found[0];
                    return {
                        text: `Dr. ${doc.name} (${doc.specialization}) is available. Expected shift: ${doc.shiftStartTime} - ${doc.shiftEndTime}. Would you like to book?`,
                        options: [`Book Dr. ${doc.name}`]
                    };
                }
                return { text: `I couldn't find a doctor named ${name}.` };
            }
            return {
                text: "Here are some of our available specialists:",
                options: doctors.slice(0, 3).map(d => `Dr. ${d.name} (${d.specialization})`)
            };
        } catch (error) {
            console.error("API Error:", error);
            return { text: "System error: Unable to connect to doctor database." };
        }
    }

    isValidTimeFormat(timeStr) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
        return timeRegex.test(timeStr);
    }

    // --- Booking & Rescheduling Flow ---

    async initiateReschedule(user) {
        try {
            const response = await api.get('/api/appointments/my-schedule');
            // Backend returns list of objects. For patients, structure is mapped.
            this.context.myAppointments = response.data;

            if (!this.context.myAppointments || this.context.myAppointments.length === 0) {
                return { text: "You don't have any upcoming appointments to reschedule.", options: ['Book Appointment'] };
            }

            this.context.step = 'awaiting_reschedule_select';

            // Create options list: "Dr. Name (Date)"
            const options = this.context.myAppointments.map(a =>
                `Dr. ${a.doctor ? a.doctor.name : 'Unknown'} (${a.appointmentDate})`
            );

            return {
                text: "Here are your upcoming appointments. Which one would you like to move?",
                options: options
            };

        } catch (e) {
            console.error(e);
            return { text: "I couldn't retrieve your appointments. Please try again later." };
        }
    }

    async initiateBooking(input) {
        this.context.step = 'awaiting_doctor';
        try {
            const response = await api.get('/api/doctors');
            const doctors = response.data;
            this.context.allDoctors = doctors;

            // FIX: Robust Regex for "Book Dr. Name" to capture full name
            const nameMatch = input.match(/book\s+(?:dr\.?\s*)?(.+)/i);

            if (nameMatch) {
                const name = nameMatch[1].trim();
                const selectedDoc = doctors.find(d =>
                    d.name.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(d.name.toLowerCase())
                );

                if (selectedDoc) {
                    this.context.data.doctor = selectedDoc;
                    this.context.step = 'awaiting_date';
                    return {
                        text: `Starting booking for Dr. ${selectedDoc.name}. What date would you like? (YYYY-MM-DD)`,
                        options: [new Date().toISOString().split('T')[0]]
                    };
                }
            }

            return {
                text: "Who would you like to see? You can type the doctor's name or choose from the list.",
                options: doctors.slice(0, 5).map(d => d.name)
            };
        } catch (e) {
            this.context.step = 'idle';
            return { text: "Sorry, I can't fetch the doctor list right now." };
        }
    }

    async handleFlow(input, user) {
        if (['cancel', 'stop', 'no', 'make a new booking'].includes(input) && (this.context.step === 'awaiting_confirmation' || this.context.step === 'awaiting_reschedule_select')) {
            this.resetContext();
            return { text: "Process cancelled." };
        } else if (['cancel', 'stop', 'quit', 'exit'].includes(input)) {
            this.resetContext();
            return { text: "Operation cancelled." };
        }

        // Context Switching Helper
        const checkContextSwitch = async () => {
            const intent = this.identifyIntent(input);
            // Allow switch if intent is recognized and not GREETING/UNKNOWN
            if (intent !== INTENTS.UNKNOWN && intent !== INTENTS.GREETING) {
                this.resetContext();
                return await this.processInput(input, user);
            }
            return null;
        };

        switch (this.context.step) {
            // --- Booking Flow Steps ---
            case 'awaiting_doctor':
                const selectedDoc = this.context.allDoctors.find(d =>
                    input.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(input)
                );

                if (selectedDoc) {
                    this.context.data.doctor = selectedDoc;
                    this.context.step = 'awaiting_date';
                    return {
                        text: `Great, Dr. ${selectedDoc.name}. What date would you like? (YYYY-MM-DD)`,
                        options: [new Date().toISOString().split('T')[0]]
                    };
                }

                const switchResponseDoc = await checkContextSwitch();
                if (switchResponseDoc) return switchResponseDoc;

                return { text: "I couldn't find that doctor. Please try selecting one from the list." };

            case 'awaiting_date':
                if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
                    this.context.data.date = input;
                    this.context.step = 'awaiting_time';
                    return {
                        text: "And what time? (e.g., 10:00 or 14:30)",
                        options: ["09:00", "10:00", "11:00", "14:00", "16:00"]
                    };
                }
                const switchResponseDate = await checkContextSwitch();
                if (switchResponseDate) return switchResponseDate;
                return { text: "Please use the format YYYY-MM-DD (e.g., 2026-05-20)." };

            case 'awaiting_time':
                let time = input;
                if (!time.includes(':')) time = time + ":00";
                if (time.length === 4) time = "0" + time;
                if (time.split(':').length === 2) time += ":00";

                if (this.isValidTimeFormat(time)) {
                    this.context.data.time = time;
                    this.context.step = 'awaiting_confirmation';

                    const actionType = this.context.data.oldAppointmentId ? "RESCHEDULE" : "BOOK";
                    const prompt = actionType === "RESCHEDULE"
                        ? `Confirm moving your appointment with Dr. ${this.context.data.doctor.name} to ${this.context.data.date} at ${time}?`
                        : `Please confirm: Appointment with Dr. ${this.context.data.doctor.name} on ${this.context.data.date} at ${time}?`;

                    return {
                        text: prompt,
                        options: ['Yes, confirm', 'Cancel']
                    };
                }
                const switchResponseTime = await checkContextSwitch();
                if (switchResponseTime) return switchResponseTime;
                return { text: "Please enter a valid time in HH:mm format (24-hour)." };

            case 'awaiting_confirmation':
                if (input.includes('yes') || input.includes('confirm') || input.includes('book')) {
                    if (this.context.data.oldAppointmentId) {
                        return await this.finalizeReschedule(user);
                    } else {
                        return await this.finalizeBooking(user);
                    }
                } else {
                    const switchResponseConfirm = await checkContextSwitch();
                    if (switchResponseConfirm) return switchResponseConfirm;
                    return { text: "Please say 'Yes' to confirm or 'Cancel' to stop.", options: ['Yes, confirm', 'Cancel'] };
                }

            // --- Reschedule Specific Steps ---
            case 'awaiting_reschedule_select':
                // User needs to select which appointment to move
                // Match by doctor name or date in the input string
                const appt = this.context.myAppointments.find(a =>
                    input.includes(a.doctor?.name) || input.includes(a.appointmentDate)
                );

                if (appt) {
                    this.context.data.oldAppointmentId = appt.id;
                    // We need the doctor object again to book the new one. 
                    this.context.step = 'awaiting_date';

                    try {
                        // Fetch doctors if needed
                        if (!this.context.allDoctors || this.context.allDoctors.length === 0) {
                            const r = await api.get('/api/doctors');
                            this.context.allDoctors = r.data;
                        }

                        // Find full doctor object
                        const fullDoc = this.context.allDoctors.find(d => d.id === appt.doctor.id) || appt.doctor;
                        this.context.data.doctor = fullDoc;

                        return {
                            text: `Okay, rescheduling Dr. ${fullDoc.name}. What is the NEW date you would like?`,
                            options: [new Date().toISOString().split('T')[0]]
                        };
                    } catch (e) {
                        // Fallback using existing data if fetch fails
                        this.context.data.doctor = appt.doctor;
                        return {
                            text: `Okay, rescheduling Dr. ${appt.doctor.name}. What is the NEW date you would like?`,
                            options: [new Date().toISOString().split('T')[0]]
                        };
                    }
                }

                const switchResponseResched = await checkContextSwitch();
                if (switchResponseResched) return switchResponseResched;

                return { text: "I didn't catch which appointment. Please select from the options provided." };
        }
    }

    async finalizeBooking(user) {
        try {
            const payload = {
                doctorId: this.context.data.doctor.id,
                appointmentDate: this.context.data.date,
                appointmentTime: this.context.data.time,
                status: "SCHEDULED"
            };

            await api.post('/api/appointments/book', payload);

            this.resetContext();

            return {
                text: "Appointment booked successfully! You can view it in the 'My Appointments' tab.",
                options: ['View Appointments']
            };

        } catch (error) {
            console.error("Booking Error:", error);
            const errorMsg = error.response?.data?.message || "The slot might be taken or there was a system error.";
            this.resetContext();
            return {
                text: `Sorry, unable to book. (${errorMsg})`,
                options: ['Try Again', 'Check Availability']
            };
        }
    }

    async finalizeReschedule(user) {
        try {
            // 1. Book New
            const payload = {
                doctorId: this.context.data.doctor.id,
                appointmentDate: this.context.data.date,
                appointmentTime: this.context.data.time,
                status: "SCHEDULED"
            };

            await api.post('/api/appointments/book', payload);

            // 2. Cancel Old
            if (this.context.data.oldAppointmentId) {
                await api.delete(`/api/appointments/${this.context.data.oldAppointmentId}`);
            }

            this.resetContext();
            return {
                text: "Appointment successfully moved to the new time!",
                options: ['View Appointments']
            };

        } catch (error) {
            console.error("Reschedule Error:", error);
            this.resetContext();
            return { text: "Failed to reschedule. Please check if the new slot is available." };
        }
    }
}

export default ChatbotLogic;
