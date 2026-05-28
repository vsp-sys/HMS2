/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Calendar, Check, Plus, Edit3, TrendingUp, Sparkles, FolderHeart, 
  HelpCircle, UserCheck, ShieldAlert, Star, RefreshCw, MessageSquare, 
  Layers, Clock, Table, FileText, ChevronRight, Bed, CreditCard, Video, Shuffle, Trash2, X
} from 'lucide-react';

export default function DoctorDashboard({
  doctor,
  appointments,
  patients,
  labOrders,
  prescriptions,
  onAddPrescription,
  onUpdateAppointmentStatus,
  onUpdatePrescription,
  onDeletePrescription,
  onUpdateAppointment,
  onDeleteAppointment,
  onBookAppointment
}) {
  // Tabs: 'schedule' | 'ehr' | 'ipd' | 'labs' | 'earnings'
  const [activeSubTab, setActiveSubTab] = useState('schedule');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // States for Editing Prescriptions
  const [editingPresc, setEditingPresc] = useState(null);
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editMeds, setEditMeds] = useState([]);

  // States for Editing Appointments
  const [editingApt, setEditingApt] = useState(null);
  const [editAptDate, setEditAptDate] = useState('');
  const [editAptTime, setEditAptTime] = useState('');
  const [editAptType, setEditAptType] = useState('In-Person');

  // States for Scheduling New Slots
  const [showAddApt, setShowAddApt] = useState(false);
  const [newAptPatId, setNewAptPatId] = useState('');
  const [newAptDate, setNewAptDate] = useState('2026-05-28');
  const [newAptTime, setNewAptTime] = useState('11:00 AM - 11:30 AM');
  const [newAptType, setNewAptType] = useState('In-Person');

  const handleEditPrescClick = (presc) => {
    setEditingPresc(presc);
    setEditDiagnosis(presc.diagnosis);
    setEditMeds([...presc.medicines]);
  };

  const handleSavePresc = (e) => {
    e.preventDefault();
    if (!editingPresc || !onUpdatePrescription) return;
    onUpdatePrescription(editingPresc.id, {
      diagnosis: editDiagnosis,
      medicines: editMeds.filter(m => m.name.trim() !== '')
    });
    setEditingPresc(null);
  };

  const handleEditAptClick = (apt) => {
    setEditingApt(apt);
    setEditAptDate(apt.date || '2026-05-28');
    setEditAptTime(apt.timeSlot);
    setEditAptType(apt.type || 'In-Person');
  };

  const handleSaveApt = (e) => {
    e.preventDefault();
    if (!editingApt || !onUpdateAppointment) return;
    onUpdateAppointment(editingApt.id, {
      date: editAptDate,
      timeSlot: editAptTime,
      type: editAptType
    });
    setEditingApt(null);
  };

  const handleAddAptSubmit = (e) => {
    e.preventDefault();
    if (!newAptPatId || !onBookAppointment) return;
    const patObj = patients.find(p => p.id === newAptPatId);
    if (!patObj) return;

    onBookAppointment({
      patientId: patObj.id,
      patientName: patObj.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      branchId: doctor.branchId || 'br-1',
      date: newAptDate,
      timeSlot: newAptTime,
      type: newAptType,
      status: 'Scheduled'
    });
    setNewAptPatId('');
    setShowAddApt(false);
  };

  // EHR Writer Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medsList, setMedsList] = useState([
    { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After meal' }
  ]);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  // Patient details inspection modal
  const [inspectedPatient, setInspectedPatient] = useState(null);

  // Adding a drug line to EHR writer
  const addMedicineLine = () => {
    setMedsList([...medsList, { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After meal' }]);
  };

  // Removing drug line from EHR writer
  const removeMedicineLine = (idx) => {
    if (medsList.length === 1) return;
    setMedsList(medsList.filter((_, i) => i !== idx));
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !diagnosis) return;
    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    // Filter out un-filled medicines
    const filteredMeds = medsList.filter(m => m.name.trim() !== '');
    if (filteredMeds.length === 0) {
      alert("Please add at least one valid medication prescription.");
      return;
    }

    onAddPrescription({
      patientId: pat.id,
      patientName: pat.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      diagnosis,
      medicines: filteredMeds
    });

    setDiagnosis('');
    setSelectedPatientId('');
    setMedsList([{ name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After meal' }]);
    setPrescriptionSuccess(true);
    setTimeout(() => setPrescriptionSuccess(false), 2500);
  };

  // Doctors specific data filtering
  const myAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
  const myIPDPatients = patients.filter(p => p.assignedDoctorId === doctor.id && p.status === 'Inpatient');

  // Dynamic real-time charts states and effects
  const [liveTimeline, setLiveTimeline] = useState([]);
  const [liveTypeMix, setLiveTypeMix] = useState([]);

  useEffect(() => {
    const slotsMap = {};
    const myAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
    myAppointments.forEach(apt => {
      slotsMap[apt.timeSlot] = (slotsMap[apt.timeSlot] || 0) + 1;
    });
    const timelineData = Object.keys(slotsMap).map(slot => ({
      slot,
      consultations: slotsMap[slot]
    })).sort((a,b) => a.slot.localeCompare(b.slot));

    setLiveTimeline(timelineData.length > 0 ? timelineData : [
      { slot: '09:00 AM', consultations: 1 },
      { slot: '10:30 AM', consultations: 2 },
      { slot: '01:00 PM', consultations: 1 },
      { slot: '02:30 PM', consultations: 3 },
      { slot: '04:00 PM', consultations: 1 }
    ]);
  }, [appointments, doctor.id]);

  useEffect(() => {
    const myAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
    const appointmentTypeData = [
      { name: 'Telemedicine', value: myAppointments.filter(a => a.type === 'Telemedicine').length },
      { name: 'In-Person', value: myAppointments.filter(a => a.type !== 'Telemedicine').length }
    ].filter(d => d.value > 0);

    setLiveTypeMix(appointmentTypeData.length > 0 ? appointmentTypeData : [
      { name: 'Telemedicine', value: 3 },
      { name: 'In-Person', value: 2 }
    ]);
  }, [appointments, doctor.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimeline(prev => {
        return prev.map(item => {
          let jitter = (Math.random() > 0.55) ? (Math.random() > 0.5 ? 1 : -1) : 0;
          let newVal = Math.max(item.consultations + jitter, 0);
          return { ...item, consultations: newVal };
        });
      });

      setLiveTypeMix(prev => {
        return prev.map(item => {
          let jitter = (Math.random() > 0.7) ? 1 : 0;
          return { ...item, value: item.value + jitter };
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Doctor Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-slate-900 text-teal-400 rounded-md">
            Clinical Companion Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mt-1">{doctor.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{doctor.specialty} Specialist • Direct diagnostic interconnect and electronic health record portal.</p>
        </div>

        {/* Doctor Duty Info */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Active Service Tier: <strong className="text-emerald-600">On Duty</strong></span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Slots Today</span>
            <Calendar className="w-5 h-5 text-teal-650" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{myAppointments.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Both telemedicine & physical</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Patients under My Care</span>
            <FolderHeart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{myIPDPatients.length} Patients</div>
          <p className="text-[10px] text-slate-500 mt-1">Direct IPD rounding tracker assignments</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Patient Trust Index</span>
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{doctor.rating.toFixed(1)} / 5.0</div>
          <p className="text-[10px] text-emerald-605 font-semibold mt-1">✔ High practitioner satisfaction</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs font-sans">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Earnings Ledger Today</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">${doctor.earnings.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 mt-1">Specialty consultation yield split</p>
        </div>
      </div>

      {/* Real-time practice metrics visual dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-55 p-5 rounded-2xl border border-slate-200/80">
        <div className="lg:col-span-2 bg-white p-5 border border-slate-150 rounded-xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Live Consultation Volume Timeline</h4>
              <p className="text-[10px] text-slate-500">Real-time hourly consultation queue tracking</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 border border-teal-200 rounded text-[9px] font-bold text-teal-700 uppercase font-mono">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
              Live Feed
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="slot" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#5eead4' }}
                />
                <Area type="monotone" dataKey="consultations" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorConsults)" name="Active Queue Size" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-150 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="pb-2 border-b border-slate-100 mb-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Telemedicine Consult Mix</h4>
            <p className="text-[10px] text-slate-550">Consultation modes distribution breakdown</p>
          </div>

          <div className="relative h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liveTypeMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {liveTypeMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#0ea5e9'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">
                {liveTypeMix.reduce((a, b) => a + b.value, 0)}
              </span>
              <span className="text-[9px] uppercase font-mono text-slate-450 font-bold">Total Slots</span>
            </div>
          </div>

          <div className="flex justify-around text-[10px] font-bold text-slate-600 px-2 mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Telehealth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>In-Person</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs in Pop Left Navigation Block */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6 w-full">
        {/* Left Navigation Block Section */}
        <div className={`transition-all duration-305 shrink-0 ${isNavCollapsed ? 'lg:w-16 w-full' : 'lg:w-64 w-full'} lg:sticky lg:top-4 w-full`}>
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              {!isNavCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Doctor Portal</span>}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors ml-auto text-xs font-bold focus:outline-none"
                title={isNavCollapsed ? "Expand Menu" : "Collapse Menu"}
              >
                {isNavCollapsed ? "▶" : "◀"}
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'schedule', label: 'Consultation Queue', badge: appointments.filter(a => a.status === 'Scheduled').length, icon: Clock, badgeColor: 'bg-teal-600 animate-pulse' },
                { id: 'ehr', label: 'EHR Prescription Writer', icon: FileText },
                { id: 'ipd', label: 'IPD Rounds Tracker', icon: Bed },
                { id: 'labs', label: 'Laboratory Results', badge: labOrders.filter(o => o.status === 'In Progress').length, icon: TrendingUp },
                { id: 'clinical_decision', label: 'Clinical Decision Support', icon: Sparkles },
                { id: 'telehealth', label: 'Telehealth Video Desk', icon: Video },
                { id: 'earnings', label: 'Consultant Compensations', icon: CreditCard }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 text-white font-bold border-l-4 border-teal-500 pl-1.5' 
                        : 'text-slate-400 hover:text-slate-205 hover:bg-slate-850'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                    {!isNavCollapsed && (
                      <span className="text-xs truncate flex-1 flex items-center justify-between">
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`px-1.5 py-0.5 text-[9px] ${tab.badgeColor || 'bg-slate-800'} text-white font-mono rounded-full font-bold`}>
                            {tab.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 w-full lg:min-w-0 space-y-6">
          {activeSubTab === 'schedule' && (
            <div className="space-y-6">
              {/* Reschedule Modal / Overlay */}
              {editingApt && (
                <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-4 font-sans shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-teal-700" />
                      Reschedule Consultation for {editingApt.patientName}
                    </h3>
                    <button onClick={() => setEditingApt(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveApt} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold pb-1 uppercase tracking-wider text-[9px]">Consultation Date</label>
                      <input
                        type="date"
                        required
                        value={editAptDate}
                        onChange={(e) => setEditAptDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold pb-1 uppercase tracking-wider text-[9px]">Time Slot</label>
                      <select
                        value={editAptTime}
                        onChange={(e) => setEditAptTime(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                      >
                        <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                        <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                        <option value="01:00 PM - 01:30 PM">01:00 PM - 01:30 PM</option>
                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold pb-1 uppercase tracking-wider text-[9px]">Consult Type</label>
                      <div className="flex gap-2">
                        <select
                          value={editAptType}
                          onChange={(e) => setEditAptType(e.target.value)}
                          className="p-2 bg-white border border-slate-300 rounded-lg text-xs flex-1"
                        >
                          <option value="In-Person">In-Person</option>
                          <option value="Telemedicine">Telemedicine</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-teal-400 hover:bg-slate-800 font-bold rounded-lg uppercase">
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Create Custom Consultation Slot Form */}
              {showAddApt && (
                <div className="p-5 bg-slate-50 border border-slate-250 rounded-xl space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Create & File Custom Consultation Slot
                    </h3>
                    <button onClick={() => setShowAddApt(false)} className="text-slate-400 hover:text-slate-655">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAddAptSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold pb-1 uppercase tracking-wider text-[9px]">Target Patient</label>
                      <select
                        required
                        value={newAptPatId}
                        onChange={(e) => setNewAptPatId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold pb-1 uppercase tracking-wider text-[9px]">Session Date</label>
                      <input
                        type="date"
                        required
                        value={newAptDate}
                        onChange={(e) => setNewAptDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold pb-1 uppercase tracking-wider text-[9px]">Select Time Window</label>
                      <select
                        value={newAptTime}
                        onChange={(e) => setNewAptTime(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                        <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                        <option value="01:00 PM - 01:30 PM">01:00 PM - 01:30 PM</option>
                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold pb-1 uppercase tracking-wider text-[9px]">Modality</label>
                      <div className="flex gap-2">
                        <select
                          value={newAptType}
                          onChange={(e) => setNewAptType(e.target.value)}
                          className="p-2 bg-white border border-slate-300 rounded-lg text-xs flex-1"
                        >
                          <option value="In-Person">In-Person</option>
                          <option value="Telemedicine">Telemedicine</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-teal-400 hover:bg-slate-800 font-extrabold rounded-lg uppercase">
                          Schedule
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-slate-55 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-850 uppercase tracking-widest block font-sans">My Consultation Schedule</span>
                    <span className="text-[10px] text-slate-450 font-mono">Real-time daily roster & slots directory</span>
                  </div>
                  <button
                    onClick={() => setShowAddApt(!showAddApt)}
                    className="px-3 py-1.5 bg-slate-900 text-teal-400 hover:bg-slate-805 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Direct Book Slot
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-700">
                    <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                      <tr>
                        <th className="px-5 py-3 text-left font-semibold">Appointment Time</th>
                        <th className="px-5 py-3 text-left font-semibold">Patient Name</th>
                        <th className="px-5 py-3 text-center font-semibold">Type</th>
                        <th className="px-5 py-3 text-center font-semibold">Status</th>
                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {myAppointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3.5 font-mono text-slate-600 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-605 shrink-0" />
                            {apt.date ? `${apt.date} • ` : ''}{apt.timeSlot}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: {apt.patientId}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                              apt.type === 'Telemedicine' ? 'bg-indigo-55 text-indigo-705 border border-indigo-200' :
                              'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                              {apt.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-805' :
                              apt.status === 'Cancelled' ? 'bg-rose-105 text-rose-805' :
                              'bg-amber-100 text-amber-805'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {apt.status === 'Scheduled' && (
                                <>
                                  <button
                                    onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                                    className="text-xs font-bold text-white bg-teal-650 hover:bg-teal-750 px-2 py-1 rounded transition-colors cursor-pointer"
                                  >
                                    Done
                                  </button>
                                  <button
                                    onClick={() => handleEditAptClick(apt)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white rounded cursor-pointer"
                                    title="Reschedule Booking"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (onDeleteAppointment) {
                                    onDeleteAppointment(apt.id);
                                  } else {
                                    onUpdateAppointmentStatus(apt.id, 'Cancelled');
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 bg-white rounded cursor-pointer"
                                title="Delete/Cancel Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {myAppointments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">
                            No consultation bookings registered for your schedule currently.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

      {activeSubTab === 'ehr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EHR form (Colspan 1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-855 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-teal-600" />
              Write prescription & Diagnostic order
            </h3>

            <form onSubmit={handlePrescriptionSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 font-mono">Patient clinical file</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-teal-500 focus:outline-hidden rounded-lg font-medium"
                >
                  <option value="">-- Select Patient target --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Age: {p.age}, Blood: {p.bloodGroup})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 font-mono">Clinical Diagnosis Analysis Statement</label>
                <textarea
                  required
                  placeholder="Summarize present symptoms, surgical reviews, or diagnostic conclusions."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-305 focus:border-teal-555 rounded-lg min-h-[70px] font-sans"
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Medication Dosage schedule</span>
                  <button
                    type="button"
                    onClick={addMedicineLine}
                    className="text-[10px] font-bold text-teal-605 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded cursor-pointer"
                  >
                    + Add drug line
                  </button>
                </div>

                {medsList.map((med, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-455 uppercase font-bold tracking-wider">Medicine Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aspirin / Atorvastatin"
                          value={med.name}
                          onChange={(e) => {
                            const updated = [...medsList];
                            updated[index].name = e.target.value;
                            setMedsList(updated);
                          }}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-455 uppercase font-bold tracking-wider">Dosing (e.g. 1-0-1)</label>
                        <input
                          type="text"
                          required
                          placeholder="1-0-1"
                          value={med.dosage}
                          onChange={(e) => {
                            const updated = [...medsList];
                            updated[index].dosage = e.target.value;
                            setMedsList(updated);
                          }}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-455 uppercase font-bold tracking-wider font-mono">Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5 days"
                          value={med.duration}
                          onChange={(e) => {
                            const updated = [...medsList];
                            updated[index].duration = e.target.value;
                            setMedsList(updated);
                          }}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-455 uppercase font-bold tracking-wider font-mono">Special instructions</label>
                        <input
                          type="text"
                          placeholder="e.g. Take bedtime / After food"
                          value={med.instructions}
                          onChange={(e) => {
                            const updated = [...medsList];
                            updated[index].instructions = e.target.value;
                            setMedsList(updated);
                          }}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>

                    {medsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineLine(index)}
                        className="absolute top-1 right-1 text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                      >
                        ✔ Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                id="btn-prescribe-ehr"
                className="w-full bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold font-mono text-xs py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-350" />
                SIGN & WRITE CLINICAL PRESCRIPTION
              </button>

              {prescriptionSuccess && (
                <div className="text-center font-bold text-xs text-emerald-600 font-sans">
                  ✔ Clinical EHR order signed with electronic cryptographic seal.
                </div>
              )}
            </form>
              {/* EHR Prescriptions feed history database */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-450 pb-2 border-b border-slate-100">Prescriptions history database</h3>

              {/* Edit Prescription Overlay */}
              {editingPresc && (
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 text-xs">Edit prescription ref #{editingPresc.id}</strong>
                    <button onClick={() => setEditingPresc(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleSavePresc} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Diagnosis / Indications</label>
                      <input
                        type="text"
                        required
                        value={editDiagnosis}
                        onChange={(e) => setEditDiagnosis(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Medicines</label>
                      {editMeds.map((med, index) => (
                        <div key={index} className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...editMeds];
                              updated[index].name = e.target.value;
                              setEditMeds(updated);
                            }}
                            placeholder="Substance Name"
                            className="p-1 px-1.5 border rounded text-xs bg-white flex-1"
                          />
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...editMeds];
                              updated[index].dosage = e.target.value;
                              setEditMeds(updated);
                            }}
                            placeholder="Dosage"
                            className="p-1 px-1.5 border rounded text-xs bg-white w-20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditMeds(editMeds.filter((_, i) => i !== index));
                            }}
                            className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEditMeds([...editMeds, { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After meal' }])}
                        className="text-[10px] text-indigo-600 hover:underline block pt-1 font-semibold"
                      >
                        + Add Medicine Substance Line
                      </button>
                    </div>

                    <button type="submit" className="w-full py-1.5 bg-slate-900 text-teal-400 hover:bg-slate-800 font-bold rounded-lg uppercase text-[10px]">
                      Accept Electronic Sync Signature
                    </button>
                  </form>
                </div>
              )}

              <div className="mt-4 space-y-4 overflow-y-auto max-h-[380px]">
                {prescriptions.map(presc => (
                  <div key={presc.id} className="p-3.5 bg-slate-55 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-455 font-mono">
                      <span>Prescriptor Reference: #{presc.id}</span>
                      <span>Date Written: {presc.date}</span>
                    </div>

                    <div className="text-xs flex justify-between items-center">
                      <span>Patient Recipient: <strong className="text-slate-805">{presc.patientName}</strong></span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPrescClick(presc)}
                          className="p-1 border border-slate-210 text-slate-550 hover:text-indigo-650 rounded hover:border-indigo-200 bg-white cursor-pointer"
                          title="Edit Diagnosis & Meds"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (onDeletePrescription) onDeletePrescription(presc.id);
                          }}
                          className="p-1 border border-slate-210 text-slate-450 hover:text-rose-600 rounded hover:border-rose-200 bg-white cursor-pointer"
                          title="Delete Record Entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-655 bg-white p-2.5 rounded border border-slate-100 italic font-mono leading-normal">
                      Diagnosis: "{presc.diagnosis}"
                    </div>

                    <div className="space-y-1 pt-1 border-t border-dashed border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-455 block font-mono">Authorized Substances:</span>
                      {presc.medicines.map((m, idx) => (
                        <div key={idx} className="text-xs flex justify-between text-slate-705 bg-indigo-50/40 p-1.5 rounded pr-3">
                          <span>💊 {m.name} ({m.dosage})</span>
                          <span className="text-indigo-650 font-semibold text-[11px]">{m.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              * EHR compliance conforms with global FDA, WHO, and HIPAA health record standards.
            </div>
          </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ipd' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Inpatient Cases (IPD)</span>
          </div>

          <div className="overflow-x-auto font-sans text-sm text-slate-100">
            <table className="w-full text-slate-705">
              <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Patient Info</th>
                  <th className="px-5 py-3 text-center font-semibold">Age / Sex</th>
                  <th className="px-5 py-3 text-center font-semibold">Blood Group</th>
                  <th className="px-5 py-3 text-left font-semibold">Bed Location</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {myIPDPatients.map(pat => (
                  <tr key={pat.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900 block">{pat.name}</span>
                      <span className="text-xs text-slate-400 block font-mono">ID Reference: {pat.id} • Registered: {pat.registeredDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium">{pat.age} yrs • {pat.gender}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-rose-600">{pat.bloodGroup}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs px-2 py-1 bg-slate-100 text-slate-750 rounded font-semibold">
                        Zone Target: Admitted Ward Room
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <button
                        onClick={() => setInspectedPatient(pat)}
                        className="text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-indigo-150 cursor-pointer"
                      >
                        Inspect Vitals history
                      </button>
                    </td>
                  </tr>
                ))}
                {myIPDPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                      No admitted IPD patients assigned to you right now. Use the Branch Admin dashboard to assign physician oversight.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'labs' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Lab & Diagnostics Results</span>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Review blood work, radiology profiles, and other lab reports.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-150">
            {labOrders.map(order => (
              <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{order.testName}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'In Progress' ? 'bg-blue-105 text-blue-805' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-505 font-sans">
                    Patient: <strong className="text-slate-800">{order.patientName}</strong> | Ordered on: {order.orderedDate}
                  </p>

                  {order.result ? (
                    <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-150 leading-relaxed font-sans flex items-start gap-1.5 animate-fade-in">
                      <Star className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Diagnostics findings:</strong> {order.result}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs bg-slate-50 text-slate-500 p-3 rounded-lg font-sans border border-slate-100 italic">
                      Diagnostics spectrum pending. Laboratory queue executing...
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono text-slate-400 font-medium">LAB ORDER-{order.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'earnings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono block">Professional Earnings</span>
              <h2 className="text-4xl font-extrabold tracking-tight">${doctor.earnings.toLocaleString()}</h2>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Your total earnings for completed consultations, ward rounds, and telemedicine clinics.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono">BASE RATE</div>
                  <div className="text-lg font-bold font-mono text-white">$120/consultation</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                  <div className="text-[10px] text-slate-455 font-mono">TELEHEALTH SHARE</div>
                  <div className="text-lg font-bold font-mono text-teal-350">85% splits ratio</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-805 flex justify-between items-center text-xs font-mono text-slate-400">
              <span>SaaS Settlement</span>
              <span>Taxes Included</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-855 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Active Patient Ratings & Reviews
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                Your direct clinical rating aggregated from clinical surveys submitted after consultations.
              </p>

              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center font-sans">
                    <span className="text-xs font-bold text-slate-800">Excellent medical care!</span>
                    <span className="text-xs font-bold text-yellow-500">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-505 font-sans leading-normal">
                    "Dr. {doctor.name.split(' ').slice(1).join(' ')} was extremely thorough on my neurology assessment. Highly recommended." — Admitted Inpatient
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center font-sans">
                    <span className="text-xs font-bold text-slate-805">Comprehensive and responsive</span>
                    <span className="text-xs font-bold text-yellow-500">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-505 font-sans leading-normal">
                    "Very easy interactive Telemedicine appointment. Explanations were extremely helpful." — Telemedicine Consult
                  </p>
                </div>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider mt-4">
              Continuous QA and Patient reviews
            </span>
          </div>
        </div>
      )}

      {activeSubTab === 'clinical_decision' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Clinical Decision Support AI Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-800">
            {/* ICD-11 Search & Medical Coding */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-indigo-700" />
                  ICD-10/11 International Medical Coding Lookup
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-sans">Search universal diagnostic coding classifications to map directly into EHR templates.</p>
              
              <div className="space-y-2.5">
                {[
                  { diagnosis: 'Type 2 Diabetes Mellitus with Ketoacidosis', code: 'ICD-11: 5A11 / ICD-10: E11.1' },
                  { diagnosis: 'Essential Hypertension (Primary)', code: 'ICD-11: BA00 / ICD-10: I10' },
                  { diagnosis: 'Acute Obstructive Appendicitis', code: 'ICD-11: DB10 / ICD-10: K35.8' },
                  { diagnosis: 'Migraine without Aura, Intractable', code: 'ICD-11: 8A80.0 / ICD-10: G43.01' }
                ].map((icd, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                    <span className="font-semibold block">{icd.diagnosis}</span>
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold border border-indigo-150">{icd.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart drug-to-allergy interactive interaction check */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Clinical AI Decision support: Drug-Allergy Interaction Engine
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-808 font-bold tracking-wider rounded font-mono">LIVE API SAFE</span>
              </div>
              
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1">
                  ⚠ High Risk Alert: Cross-Interaction Detected!
                </h4>
                <p className="text-[11px] text-rose-808 leading-relaxed font-sans">
                  Target Drug: <strong>Penicillin G Benzathine Infusion</strong> matches Patient allergen history of <strong>B-Lactam antibiotics hypersensitivity</strong>!
                </p>
                <div className="text-[10px] text-rose-505 font-medium border-t border-rose-150 pt-1.5">
                  Alternative recommendations: Clindamycin 600mg IV or Erythromycin Oral blocks.
                </div>
              </div>

              {/* Patient Education Material sharing */}
              <div className="border-t border-slate-150 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-450 uppercase font-mono">Patient Educational Pamphlet Dispatcher</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { title: 'Post-Op Wound Hygiene.pdf', share: 'Share with ICU Patient' },
                    { title: 'Chronic Hypertension Care.pdf', share: 'Share with Outpatient' }
                  ].map((pamp, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                      <span className="font-bold text-slate-805 block truncate">{pamp.title}</span>
                      <button className="mt-2 text-left text-[10px] text-indigo-707 hover:text-indigo-900 font-semibold cursor-pointer">
                        ✔ {pamp.share}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-800">
            {/* Out-of-network referral tracking */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Shuffle className="w-4 h-4 text-teal-600" />
                  Specialist Referral & Second Opinions Network
                </h3>
              </div>
              <p className="text-xs text-slate-505 font-sans">Track in-network or out-of-network specialist handovers.</p>

              <div className="space-y-2">
                {[
                  { patient: 'Meera Deshmukh', targetDoctor: 'Dr. Vineet Roy (Cardiologist)', reason: 'Severe mitral valve regurgitation evaluation', status: 'Accepted' },
                  { patient: 'Rahul Mehta', targetDoctor: 'Dr. Sarah Smith (Endocrinology)', reason: 'Complex pituitary adenoma hormone balancing', status: 'Pending Review' }
                ].map((ref, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-205 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-905 block font-bold font-sans">Patient: {ref.patient}</strong>
                      <span className="text-[11px] text-slate-505 block mt-0.5">Referred To: <strong>{ref.targetDoctor}</strong></span>
                      <span className="text-[10px] text-slate-455 block mt-0.5 italic">Clinical Reason: {ref.reason}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${ref.status === 'Accepted' ? 'bg-emerald-50 text-emerald-808 border border-emerald-202' : 'bg-amber-50 text-amber-805 border border-amber-202'}`}>
                      {ref.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peer to Peer second opinions request board */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Peer-to-Peer Medical Second Opinion Board
                </h3>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>Subject: Complex Glioblastoma Multiforme (GBM) MRI scans</span>
                  <span className="text-indigo-650">Requested by Me</span>
                </div>
                <p className="text-[11px] text-slate-505 font-sans leading-relaxed mt-1">"Scans display sub-centimeter infiltration. Seeking advice on optimal adjuvant Temozolomide cycles combined with Optune therapy timeline."</p>
                <div className="text-[10px] text-slate-505 font-mono mt-2 bg-white border border-slate-150 p-1.5 rounded">
                  <strong>Reply from Dr. S. Smith:</strong> "Optimal chemotherapy intervals suggest overlapping Optune arrays at 18 hours daily minimum."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'telehealth' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Telehealth video session desk and list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800">
            
            {/* Telehealth patient consultation virtual queue */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 col-span-1 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-805">Upcoming Telehealth virtual appointments</h3>
              </div>
              
              <div className="space-y-2.5">
                {[
                  { name: 'Kushal Patil', time: '04:15 PM (In 10 mins)', state: 'Waiting Room', code: 'CONF-810' },
                  { name: 'Meera Deshmukh', time: '04:45 PM', state: 'Scheduled', code: 'CONF-811' }
                ].map((tcon, id) => (
                  <div key={id} className="p-3 bg-slate-50 border border-slate-205 rounded-xl text-xs flex justify-between items-center font-sans">
                    <div>
                      <strong className="text-slate-900 font-bold block">{tcon.name}</strong>
                      <span className="text-indigo-707 font-mono text-[10px] block mt-0.5">{tcon.time}</span>
                      <span className="text-[9px] text-slate-455 block">Code: {tcon.code}</span>
                    </div>

                    <div className="text-right space-y-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded block text-center ${tcon.state === 'Waiting Room' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-202'}`}>
                        {tcon.state}
                      </span>
                      {tcon.state === 'Waiting Room' && (
                        <button className="px-2 py-0.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[9px] rounded cursor-pointer">
                          Join Call
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Video consult screen feed simulations */}
            <div className="lg:col-span-2 bg-slate-950 text-white rounded-2xl p-5 shadow-md space-y-4 flex flex-col justify-between h-[360px]">
              <div className="flex justify-between items-center bg-slate-905 p-2.5 rounded border border-slate-850">
                <div>
                  <span className="text-[9px] font-mono tracking-wider uppercase bg-teal-500 text-slate-950 font-extrabold px-2 py-0.5 rounded inline-block animate-pulse">Consult Live Stream</span>
                  <h3 className="text-xs font-bold text-white mt-1">Patient Stream: Kushal Patil (#P-810)</h3>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  Duration: 00:08:44 | Audio Stream Safe ✔
                </div>
              </div>

              {/* simulated avatar screen */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3 font-sans">
                  <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full mx-auto flex items-center justify-center text-xl font-bold text-teal-400 font-mono">
                    KP
                  </div>
                  <p className="text-xs text-slate-300 font-sans">Camera simulated feeds. Patient bandwidth rate normal (4 Mbps).</p>
                </div>
              </div>

              {/* call controls */}
              <div className="flex justify-center gap-2.5 pt-4 border-t border-slate-900 font-mono">
                <button className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                  Mute Mic
                </button>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] rounded-lg cursor-pointer">
                  Stop Video
                </button>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-200 font-bold text-[10px] rounded-lg cursor-pointer">
                  Share Screen
                </button>
                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                  Record Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {inspectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Vitals & Record History: {inspectedPatient.name}</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Continuous bio-telemetry reports from active nurses schedules.</p>
            </div>

            <div className="p-5 space-y-4 max-h-[300px] overflow-y-auto">
              <div className="text-xs space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-sans">
                <div>Age: <strong className="text-slate-800">{inspectedPatient.age}</strong> | Gender: <strong className="text-slate-800">{inspectedPatient.gender}</strong></div>
                <div>Blood group: <strong className="text-rose-650 font-bold">{inspectedPatient.bloodGroup}</strong></div>
                <div>Address: <span className="text-slate-500">{inspectedPatient.address || 'No residential details recorded'}</span></div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-450 uppercase block font-mono font-sans">Logged Vitals Streams:</span>
                <div className="space-y-2 text-xs font-sans">
                  <div className="p-3 bg-teal-50 border border-teal-150 text-teal-900 rounded-lg space-y-1">
                    <div className="font-semibold text-teal-800">Bedside observation: Normal stability</div>
                    <p className="text-slate-650 leading-relaxed font-sans">
                      Continuous telemetry stable. Ox level at 98%, heart rate normal at 75bpm. Maintain Metoprolol scheduled administration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectedPatient(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Close inspect portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
