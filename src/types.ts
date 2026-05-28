/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Hospital {
  id: string;
  name: string;
  code: string;
  tier: string;
  isActive: boolean;
  branchesCount: number;
  contactEmail: string;
  joinedDate: string;
}

export interface Branch {
  id: string;
  hospitalId: string;
  name: string;
  city: string;
  bedsTotal: number;
  bedsOccupied: number;
  bedsAvailable: number;
  staffCount: number;
  activeDoctorsCount: number;
}

export interface Bed {
  id: string;
  branchId: string;
  wardName: string;
  bedNumber: string;
  status: 'Occupied' | 'Sanitation' | 'Available';
  patientId?: string;
  patientName?: string;
}

export interface Doctor {
  id: string;
  branchId: string;
  name: string;
  specialty: string;
  rating: number;
  availability: 'On Duty' | 'Off Duty' | 'Emergency';
  contact: string;
  earnings: number;
}

export interface Patient {
  id: string;
  branchId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  registeredDate: string;
  status: 'Inpatient' | 'Discharged' | 'Outpatient';
  assignedDoctorId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  branchId: string;
  date: string;
  timeSlot: string;
  type: 'In-Person' | 'Telemedicine';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface MedicineLine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: MedicineLine[];
}

export interface InvoiceService {
  description: string;
  cost: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  branchId: string;
  date: string;
  services?: InvoiceService[];
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  branchId: string;
  testName: string;
  orderedDate: string;
  status: 'Completed' | 'In Progress' | 'Queue';
  result?: string;
}

export interface HelpTicket {
  id: string;
  raisedBy: string;
  hospitalName: string;
  subject: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Resolved';
  createdDate: string;
}

export interface VitalLog {
  id: string;
  patientId: string;
  patientName: string;
  recordedAt: string;
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  temperature: number;
  classification: 'Stable' | 'Warning' | 'Critical';
  loggedBy: string;
}

export interface FluidRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordedAt: string;
  intakeMl: number;
  outputMl: number;
  notes?: string;
}

export interface MARMedication {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  dose: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Administered';
  administeredAt?: string;
}

export interface ShiftHandoff {
  id: string;
  branchId: string;
  outgoingStaff: string;
  incomingStaff: string;
  date: string;
  notes: string;
  criticalAlerts?: string;
}

export interface EmergencyAlert {
  id: string;
  branchId: string;
  code: 'Blue' | 'Red';
  location: string;
  timestamp: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userType: string;
  action: string;
  ip: string;
}

export interface BranchAdmin {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  status: 'Active' | 'Inactive';
  email: string;
  permissions: string[];
}

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  dosage: string;
  unit: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isBot: boolean;
}
