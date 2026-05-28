/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const initialHospitals = [
  {
    id: "hosp-1",
    name: "Mayo General Clinic",
    code: "MAYO",
    tier: "Enterprise",
    isActive: true,
    joinedDate: "2026-01-15",
    contactEmail: "hq@mayoclinic.org",
    branchesCount: 2
  },
  {
    id: "hosp-2",
    name: "Mount Sinai Hospital Center",
    code: "SINAI",
    tier: "Standard",
    isActive: true,
    joinedDate: "2026-02-10",
    contactEmail: "admin@sinai.org",
    branchesCount: 1
  }
];

export const initialBranches = [
  {
    id: "br-1",
    hospitalId: "hosp-1",
    name: "Mayo Rochester Campus",
    city: "Rochester",
    bedsTotal: 6,
    bedsOccupied: 3,
    activeDoctorsCount: 2,
    staffCount: 6
  },
  {
    id: "br-2",
    hospitalId: "hosp-1",
    name: "Mayo Jacksonville Branch",
    city: "Jacksonville",
    bedsTotal: 4,
    bedsOccupied: 1,
    activeDoctorsCount: 1,
    staffCount: 3
  },
  {
    id: "br-3",
    hospitalId: "hosp-2",
    name: "Sinai West Clinic",
    city: "Manhattan",
    bedsTotal: 5,
    bedsOccupied: 0,
    activeDoctorsCount: 1,
    staffCount: 4
  }
];

export const initialBranchAdmins = [
  {
    id: "adm-1",
    name: "Sarah Jenkins",
    email: "sarah@mayo.org",
    branchId: "br-1",
    branchName: "Mayo Rochester Campus",
    status: "Active",
    permissions: ["Billing Management", "Bed Lifecycle Control", "Staff Scheduling"]
  },
  {
    id: "adm-2",
    name: "Michael Chang",
    email: "chang@sinai.org",
    branchId: "br-3",
    branchName: "Sinai West Clinic",
    status: "Active",
    permissions: ["Billing Management", "Staff Scheduling"]
  }
];

export const initialDoctors = [
  {
    id: "doc-1",
    name: "Dr. Robert Chen",
    specialty: "Cardiology",
    email: "robert.chen@mayo.org",
    phone: "555-0102",
    rating: 4.9,
    earnings: 1250,
    branchId: "br-1",
    branchName: "Mayo Rochester Campus",
    licenseNo: "MD-94029"
  },
  {
    id: "doc-2",
    name: "Dr. Eleanor Vance",
    specialty: "Neurology",
    email: "vance@mayo.org",
    phone: "555-0103",
    rating: 4.8,
    earnings: 900,
    branchId: "br-1",
    branchName: "Mayo Rochester Campus",
    licenseNo: "MD-38492"
  },
  {
    id: "doc-3",
    name: "Dr. Marcus Brody",
    specialty: "Internal Medicine",
    email: "brody@sinai.org",
    phone: "555-0144",
    rating: 4.7,
    earnings: 300,
    branchId: "br-3",
    branchName: "Sinai West Clinic",
    licenseNo: "MD-92841"
  }
];

export const initialPatients = [
  {
    id: "pat-1",
    name: "John Doe",
    birthDate: "1984-05-12",
    email: "johndoe@gmail.com",
    phone: "555-2019",
    bloodType: "A+",
    allergies: "Penicillin",
    status: "Inpatient",
    registeredDate: "2026-05-10",
    insuranceProvider: "BlueCross Core",
    branchId: "br-1"
  },
  {
    id: "pat-2",
    name: "Alice Smith",
    birthDate: "1992-11-23",
    email: "alice.smith@comcast.net",
    phone: "555-9021",
    bloodType: "O-",
    allergies: "Sulfa Drugs",
    status: "Inpatient",
    registeredDate: "2026-05-14",
    insuranceProvider: "Aetna Prime",
    branchId: "br-1"
  },
  {
    id: "pat-3",
    name: "David Miller",
    birthDate: "1975-03-04",
    email: "david.miller@outlook.com",
    phone: "555-3841",
    bloodType: "B+",
    allergies: "None",
    status: "Outpatient",
    registeredDate: "2026-05-18",
    insuranceProvider: "Cigna Health",
    branchId: "br-1"
  }
];

export const initialBeds = [
  {
    id: "bed-1",
    branchId: "br-1",
    wardName: "Intensive Critical Care",
    bedNumber: "Bed-101 (ICU)",
    status: "Occupied",
    patientId: "pat-1",
    patientName: "John Doe",
    timerDuration: "3_days",
    timerEndsAt: Date.now() + 3 * 24 * 60 * 60 * 1000
  },
  {
    id: "bed-2",
    branchId: "br-1",
    wardName: "General Post-Op Ward",
    bedNumber: "Bed-202 (Gen)",
    status: "Occupied",
    patientId: "pat-2",
    patientName: "Alice Smith",
    timerDuration: null,
    timerEndsAt: null
  },
  {
    id: "bed-3",
    branchId: "br-1",
    wardName: "General Post-Op Ward",
    bedNumber: "Bed-303 (Gen)",
    status: "Unoccupied",
    patientId: null,
    patientName: null,
    timerDuration: null,
    timerEndsAt: null
  },
  {
    id: "bed-4",
    branchId: "br-1",
    wardName: "Intensive Critical Care",
    bedNumber: "Bed-404 (ICU)",
    status: "Unoccupied",
    patientId: null,
    patientName: null,
    timerDuration: null,
    timerEndsAt: null
  },
  {
    id: "bed-5",
    branchId: "br-1",
    wardName: "Pediatrics Critical Care",
    bedNumber: "Bed-505 (Peds)",
    status: "Unoccupied",
    patientId: null,
    patientName: null,
    timerDuration: null,
    timerEndsAt: null
  }
];

export const initialAppointments = [
  {
    id: "apt-1",
    doctorId: "doc-1",
    doctorName: "Dr. Robert Chen",
    patientId: "pat-3",
    patientName: "David Miller",
    date: "2026-05-27",
    time: "10:30 AM",
    status: "Scheduled",
    notes: "Regular post-op consultation and fluid log evaluation"
  },
  {
    id: "apt-2",
    doctorId: "doc-1",
    doctorName: "Dr. Robert Chen",
    patientId: "pat-2",
    patientName: "Alice Smith",
    date: "2026-05-25",
    time: "02:00 PM",
    status: "Completed",
    notes: "Completed follow-up check after fluid dynamic cycle. Patient is recovering well."
  }
];

export const initialPrescriptions = [
  {
    id: "presc-1",
    doctorId: "doc-1",
    doctorName: "Dr. Robert Chen",
    patientId: "pat-1",
    patientName: "John Doe",
    date: "2026-05-20",
    medicineName: "Amlodipine (Norvasc)",
    dosage: "5mg",
    route: "Oral",
    frequency: "Once Daily",
    symptoms: "Hypertension",
    remarks: "Track BP twice daily in vital clinic log."
  },
  {
    id: "presc-2",
    doctorId: "doc-2",
    doctorName: "Dr. Eleanor Vance",
    patientId: "pat-2",
    patientName: "Alice Smith",
    date: "2026-05-22",
    medicineName: "Gabapentin",
    dosage: "300mg",
    route: "Oral",
    frequency: "Every 8 hours",
    symptoms: "Neuropathic Pain",
    remarks: "Avoid driving or alcohol consumption."
  }
];

export const initialInvoices = [
  {
    id: "inv-101",
    patientId: "pat-1",
    patientName: "John Doe",
    totalAmount: 450,
    description: "Cardiology EKG Diagnostic Review & Bed Allocation",
    status: "Unpaid",
    date: "2026-05-21",
    services: [
      { description: "Cardio EKG Diagnostic Study", cost: 300 },
      { description: "Bed Room Allocation Base Fee", cost: 150 }
    ],
    branchId: "br-1"
  },
  {
    id: "inv-102",
    patientId: "pat-2",
    patientName: "Alice Smith",
    totalAmount: 180,
    description: "Neurological Reflex Exam & Fluids Charting",
    status: "Paid",
    date: "2026-05-22",
    services: [
      { description: "Neurology Specialist Reflex Test", cost: 180 }
    ],
    branchId: "br-1"
  }
];

export const initialLabOrders = [
  {
    id: "lab-1",
    patientId: "pat-1",
    patientName: "John Doe",
    doctorId: "doc-1",
    doctorName: "Dr. Robert Chen",
    testName: "Complete Blood Count (CBC)",
    priority: "Urgent",
    status: "Completed",
    result: "WBC count is standard (6.4 K/uL); RBC is slightly elevated at 5.1 M/uL.",
    date: "2026-05-24",
    branchId: "br-1"
  },
  {
    id: "lab-2",
    patientId: "pat-2",
    patientName: "Alice Smith",
    doctorId: "doc-2",
    doctorName: "Dr. Eleanor Vance",
    testName: "Serum Electrolytes Panel",
    priority: "Stat",
    status: "Pending",
    result: "",
    date: "2026-05-25",
    branchId: "br-1"
  }
];

export const initialHelpTickets = [
  {
    id: "tkt-1",
    creatorName: "Sarah Jenkins",
    email: "sarah@mayo.org",
    subject: "LIMS API Endpoint Timeout Exception",
    description: "LIMS Lab integration system timeout issues when sending blood panels",
    status: "Open",
    date: "2026-05-23",
    priority: "High"
  },
  {
    id: "tkt-2",
    creatorName: "Michael Chang",
    email: "chang@sinai.org",
    subject: "Printer connectivity in ICU hallway",
    description: "Unable to print medicine prescription receipts in back ICU hallway printer",
    status: "Resolved",
    date: "2026-05-24",
    priority: "Low"
  }
];

export const initialVitalLogs = [
  {
    id: "vit-1",
    patientId: "pat-1",
    patientName: "John Doe",
    heartRate: 85,
    bpSystolic: 120,
    bpDiastolic: 80,
    temperature: 98.6,
    statusClass: "Safe",
    timestamp: "2026-05-26T04:10:00Z",
    recordedBy: "Nurse Kelly"
  },
  {
    id: "vit-2",
    patientId: "pat-1",
    patientName: "John Doe",
    heartRate: 110,
    bpSystolic: 145,
    bpDiastolic: 95,
    temperature: 101.4,
    statusClass: "Warning",
    timestamp: "2026-05-26T04:30:00Z",
    recordedBy: "Nurse Kelly"
  }
];

export const initialFluidRecords = [
  {
    id: "fld-1",
    patientId: "pat-1",
    patientName: "John Doe",
    type: "Intake",
    category: "IV Normal Saline",
    volume: 500,
    time: "10:00 AM",
    loggedBy: "Nurse Kelly"
  },
  {
    id: "fld-2",
    patientId: "pat-1",
    patientName: "John Doe",
    type: "Output",
    category: "Urine Output",
    volume: 350,
    time: "11:30 AM",
    loggedBy: "Nurse Kelly"
  }
];

export const initialMARMedications = [
  {
    id: "med-1",
    patientId: "pat-1",
    patientName: "John Doe",
    medicineName: "Amlodipine (BP)",
    dose: "5mg",
    scheduledTime: "08:00 AM",
    status: "Administered",
    administeredAt: "08:15 AM"
  },
  {
    id: "med-2",
    patientId: "pat-1",
    patientName: "John Doe",
    medicineName: "Ampicillin (Antibiotic)",
    dose: "250mg",
    scheduledTime: "12:00 PM",
    status: "Scheduled",
    administeredAt: null
  },
  {
    id: "med-3",
    patientId: "pat-2",
    patientName: "Alice Smith",
    medicineName: "Gabapentin (Pain)",
    dose: "300mg",
    scheduledTime: "02:00 PM",
    status: "Scheduled",
    administeredAt: null
  }
];

export const initialShiftHandoffs = [
  {
    id: "ho-1",
    outgoingStaff: "Nurse Kelly",
    incomingStaff: "Nurse Andrews",
    wardName: "General Intensive ICU",
    shiftNotes: "John Doe in Bed-101 had elevated temperature 101.4 and HR 110 but stabilized after medication. Alice Smith is resting stable in Bed-202.",
    criticalAlerts: "Monitor Bed-101 telemetry carefully every hour. Urine bag needs checking.",
    timestamp: "2026-05-26T04:15:00Z"
  }
];

export const initialEmergencyAlerts = [];

export const initialAuditLogs = [
  {
    id: "aud-1",
    userType: "Super Admin",
    timestamp: "2026-05-26T02:00:00Z",
    action: "System Backup performed. Database status is healthy.",
    ip: "192.168.2.14"
  },
  {
    id: "aud-2",
    userType: "Branch Admin",
    timestamp: "2026-05-26T02:15:00Z",
    action: "Configured clinics Bed-101 ward allocation.",
    ip: "192.168.2.82"
  }
];

export const initialMessages = [];

export const initialInventory = [
  {
    id: "pharm-001",
    name: "Amlodipine Norvasc",
    quantity: 250,
    unit: "tablets",
    category: "Cardiology",
    minStock: 50,
    shelfLife: "2027-12-31"
  },
  {
    id: "pharm-002",
    name: "Gabapentin",
    quantity: 450,
    unit: "capsules",
    category: "Neurology",
    minStock: 100,
    shelfLife: "2028-03-30"
  },
  {
    id: "pharm-003",
    name: "Ampicillin Sterile IV",
    quantity: 85,
    unit: "vials",
    category: "Antibiotics",
    minStock: 30,
    shelfLife: "2026-11-15"
  }
];

export const initialNotifications = [
  {
    id: "not-1",
    title: "URGENT Vital Alert Trigger",
    message: "Patient John Doe in Bed-101 has high BP reading of 145/95 and high heart rate.",
    targetRole: "staff",
    timestamp: "2026-05-26T04:30:15Z",
    urgency: "High"
  },
  {
    id: "not-2",
    title: "CBC Lab Results Available",
    message: "Dr. Robert Chen's CBC order for patient John Doe is ready and completed.",
    targetRole: "doctor",
    timestamp: "2026-05-26T04:12:05Z",
    urgency: "Medium"
  },
  {
    id: "not-3",
    title: "System Compliance Notice",
    message: "HIPAA Patient privacy training compliance certificate synchronized for the Mayo Rochester Branch.",
    targetRole: "all",
    timestamp: "2026-05-26T01:00:00Z",
    urgency: "Info"
  }
];
