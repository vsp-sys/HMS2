/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, ShieldAlert, Sparkles, Plus, AlertOctagon, HelpCircle, 
  Droplet, Layers, Clipboard, Check, RefreshCw, Send, AlertTriangle, Play, HelpCircle as HelpIcon, Key, Radio,
  Search, Users, UserCheck, ShieldCheck, Mail
} from 'lucide-react';

export default function StaffWorkspace({
  loggedInUser,
  patients,
  vitals,
  fluids,
  medications,
  handoffs,
  emergencyAlert,
  onLogVitals,
  onLogFluid,
  onToggleMedState,
  onAddHandoff,
  onTriggerEmergency,
  onResolveEmergency,
  inventoryItems,
  onDispensePharmacy,
  labOrders,
  onUpdateLabStatus,
  appointments,
  doctors = [],
  onAddDoctor,
  isStaffAdmin = false,
  onUpdateVitals,
  onDeleteVitals,
  onUpdateFluids,
  onDeleteFluids,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication
}) {
  // Tabs: 'vitals' | 'medication' | 'fluids' | 'handover' | 'labs_coor' | 'queues' | 'staff_mgmt'
  const [activeSubTab, setActiveSubTab] = useState(isStaffAdmin ? 'staff_mgmt' : 'vitals');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Staff Administration roster & schedules states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('nurse123');
  const [newStaffRole, setNewStaffRole] = useState('nurse'); // 'nurse' | 'doctor' | 'staff_admin'
  const [newStaffContact, setNewStaffContact] = useState('');
  const [newStaffAvailability, setNewStaffAvailability] = useState('On Duty');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('Critical Care Ward');
  const [newStaffSuccess, setNewStaffSuccess] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [updatedAvailability, setUpdatedAvailability] = useState({}); // local state updates override for testing list

  // Filter states
  const [vitalsFilterText, setVitalsFilterText] = useState('');
  const [vitalsFilterClass, setVitalsFilterClass] = useState('All');

  const [medsFilterText, setMedsFilterText] = useState('');
  const [medsFilterStatus, setMedsFilterStatus] = useState('All');

  const [fluidsFilterText, setFluidsFilterText] = useState('');

  const [handoffFilterText, setHandoffFilterText] = useState('');

  const [labCoorFilterText, setLabCoorFilterText] = useState('');
  const [labCoorFilterStatus, setLabCoorFilterStatus] = useState('All');

  const [queueFilterText, setQueueFilterText] = useState('');

  // Top level state for filling assays to avoid nested useState hooks error
  const [labResultsFeed, setLabResultsFeed] = useState({});

  // Vitals form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [heartRate, setHeartRate] = useState(75);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [spO2, setSpO2] = useState(98);
  const [temp, setTemp] = useState(98.6);
  const [nurseName, setNurseName] = useState(loggedInUser?.name || 'Nurse Sarah Jenkins, RN');
  const [vitalsSuccess, setVitalsSuccess] = useState(false);

  // Fluid form
  const [fluidPatientId, setFluidPatientId] = useState('');
  const [fluidIntake, setFluidIntake] = useState(250);
  const [fluidOutput, setFluidOutput] = useState(200);
  const [fluidNotes, setFluidNotes] = useState('');
  const [fluidSuccess, setFluidSuccess] = useState(false);

  // Handover form
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverAlerts, setHandoverAlerts] = useState('');
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Emergency triggers
  const [emergencyLocation, setEmergencyLocation] = useState('Critical Care Ward Rm 12');

  // Bed class calculator based on HR, BP metrics
  const getSmartTriageValue = (hr, sys, ox, tm) => {
    let warningWeight = 0;
    if (hr < 50 || hr > 115) warningWeight += 2;
    if (sys < 95 || sys > 150) warningWeight += 2;
    if (ox < 92) warningWeight += 3;
    if (tm > 101.5 || tm < 96.0) warningWeight += 1.5;

    if (warningWeight >= 4) return 'Critical';
    if (warningWeight >= 2) return 'Warning';
    return 'Stable';
  };

  // Nurse CRUD States for Vital signs, Fluid balances, and Ward medications
  const [editingVitalsId, setEditingVitalsId] = useState(null);
  const [editHeartRate, setEditHeartRate] = useState(75);
  const [editSystolic, setEditSystolic] = useState(120);
  const [editDiastolic, setEditDiastolic] = useState(80);
  const [editSpO2, setEditSpO2] = useState(98);
  const [editTemp, setEditTemp] = useState(98.6);

  const [editingFluidsId, setEditingFluidsId] = useState(null);
  const [editFluidIntake, setEditFluidIntake] = useState(250);
  const [editFluidOutput, setEditFluidOutput] = useState(200);
  const [editFluidNotes, setEditFluidNotes] = useState('');

  const [selectedMedPatientId, setSelectedMedPatientId] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medRoute, setMedRoute] = useState('Oral');
  const [medFrequency, setMedFrequency] = useState('q8h');
  const [medNotes, setMedNotes] = useState('');
  const [medSuccess, setMedSuccess] = useState(false);

  const [editingMedId, setEditingMedId] = useState(null);
  const [editMedName, setEditMedName] = useState('');
  const [editMedDosage, setEditMedDosage] = useState('');
  const [editMedRoute, setEditMedRoute] = useState('Oral');
  const [editMedFrequency, setEditMedFrequency] = useState('q8h');
  const [editMedNotes, setEditMedNotes] = useState('');

  // CRUD Save & Creation Handlers
  const handleSaveVitalsEdit = (e) => {
    e.preventDefault();
    if (!editingVitalsId || !onUpdateVitals) return;
    onUpdateVitals(editingVitalsId, {
      heartRate: Number(editHeartRate),
      bloodPressure: `${editSystolic}/${editDiastolic}`,
      spO2: Number(editSpO2),
      temperature: Number(editTemp)
    });
    setEditingVitalsId(null);
  };

  const handleSaveFluidsEdit = (e) => {
    e.preventDefault();
    if (!editingFluidsId || !onUpdateFluids) return;
    onUpdateFluids(editingFluidsId, {
      intakeMl: Number(editFluidIntake),
      outputMl: Number(editFluidOutput),
      notes: editFluidNotes
    });
    setEditingFluidsId(null);
  };

  const handleCreateMedication = (e) => {
    e.preventDefault();
    if (!selectedMedPatientId || !medName || !onAddMedication) return;
    const pat = patients.find(p => p.id === selectedMedPatientId);
    if (!pat) return;
    onAddMedication({
      patientId: pat.id,
      patientName: pat.name,
      medicationName: medName,
      dosage: medDosage || '500mg',
      route: medRoute,
      frequency: medFrequency,
      notes: medNotes
    });
    setMedSuccess(true);
    setTimeout(() => {
      setMedSuccess(false);
      setSelectedMedPatientId('');
      setMedName('');
      setMedDosage('');
      setMedNotes('');
    }, 2000);
  };

  const handleSaveMedicationEdit = (e) => {
    e.preventDefault();
    if (!editingMedId || !onUpdateMedication) return;
    onUpdateMedication(editingMedId, {
      medicationName: editMedName,
      dosage: editMedDosage,
      route: editMedRoute,
      frequency: editMedFrequency,
      notes: editMedNotes
    });
    setEditingMedId(null);
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    onLogVitals({
      patientId: pat.id,
      patientName: pat.name,
      heartRate: Number(heartRate),
      bloodPressure: `${systolic}/${diastolic}`,
      spO2: Number(spO2),
      temperature: Number(temp),
      loggedBy: nurseName
    });

    setVitalsSuccess(true);
    setTimeout(() => {
      setVitalsSuccess(false);
      setSelectedPatientId('');
    }, 2500);
  };

  const handleFluidSubmit = (e) => {
    e.preventDefault();
    if (!fluidPatientId) return;
    const pat = patients.find(p => p.id === fluidPatientId);
    if (!pat) return;

    onLogFluid({
      patientId: pat.id,
      patientName: pat.name,
      intakeMl: Number(fluidIntake),
      outputMl: Number(fluidOutput),
      notes: fluidNotes
    });

    setFluidSuccess(true);
    setFluidNotes('');
    setTimeout(() => {
      setFluidSuccess(false);
      setFluidPatientId('');
    }, 2500);
  };

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    if (!handoverNotes) return;
    onAddHandoff(handoverNotes, handoverAlerts);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffContact('');
    setHandoverNotes('');
    setHandoverAlerts('');
    setHandoverSuccess(true);
    setTimeout(() => setHandoverSuccess(false), 3000);
  };

  const handleStaffEnrollSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    const newDocObj = {
      id: `nurse-${Date.now()}`,
      branchId: 'br-1',
      name: newStaffName,
      specialty: newStaffSpecialty,
      rating: 5.0,
      availability: newStaffAvailability,
      contact: newStaffContact || '+1 (555) ' + Math.round(100 + Math.random() * 899) + '-' + Math.round(1000 + Math.random() * 8999),
      earnings: 3000,
      profession: newStaffRole,
      role: newStaffRole,
      email: newStaffEmail.toLowerCase().trim(),
      password: newStaffPassword || 'nurse123'
    };

    if (onAddDoctor) {
      onAddDoctor(newDocObj);
    } else {
      doctors.push(newDocObj);
    }

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffContact('');
    setNewStaffSuccess(true);
    setTimeout(() => setNewStaffSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 relative font-sans text-slate-800">
      {/* PERSISTENT FULL-SCREEN CRISIS OVERLAY */}
      {emergencyAlert && emergencyAlert.active && (
        <div className="bg-rose-950 border-4 border-rose-605 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-pulse">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertOctagon className="w-56 h-56" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 font-sans">
            <div className="flex items-start gap-4">
              <span className="p-3 bg-red-650 rounded-xl text-white inline-block">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </span>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-red-300">
                  CRISIS CODE ACTIVE
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                  CODE {emergencyAlert.code === 'Blue' ? 'BLUE (CARDIAC RE-SUS)' : 'RED (FIRE/HAZARD)'}
                </h1>
                <p className="text-sm font-semibold text-rose-200 mt-1 font-sans">
                  Location Zone: {emergencyAlert.location} — Emergency Broadcast deployed to all paging units at {emergencyAlert.timestamp}.
                </p>
              </div>
            </div>

            <button 
              id="btn-resolve-emergency"
              onClick={onResolveEmergency}
              className="bg-white hover:bg-slate-100 text-rose-950 font-extrabold text-sm px-6 py-2.5 rounded-xl cursor-pointer shadow-lg tracking-wider font-sans"
            >
              ✔ CLEAR CHANNEL & STAND DOWN
            </button>
          </div>
        </div>
      )}

      {/* Clinical Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-900 text-indigo-205 rounded-md font-sans">
            {isStaffAdmin ? 'Administrative & Clinical Lead Hub' : 'Clinical Point-Of-Care'}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mt-1 font-sans">
            {isStaffAdmin ? 'Chief Nursing Officer & Staff Admin Desk' : 'Nurses & Bedside Attendants Desk'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans">
            {isStaffAdmin 
              ? 'Roster management, nursing schedules oversight, continuous bio-telemetry audit, and rapid emergency paging monitors.'
              : 'Continuous bio-telemetry, medication tracking, liquid intake charting, and crisis management commands.'}
          </p>
        </div>

        {/* Rapid emergency trigger controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-3 border border-slate-200 rounded-xl max-w-full font-sans shadow-3xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Page Crisis:</span>
            <button
              onClick={() => onTriggerEmergency('Blue', emergencyLocation)}
              id="btn-code-blue"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer transition-all shadow-xs"
            >
              Code Blue
            </button>
            <button
              onClick={() => onTriggerEmergency('Red', emergencyLocation)}
              id="btn-code-red"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer transition-all shadow-xs"
            >
              Code Red
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 font-sans whitespace-nowrap">at</span>
            <input
              type="text"
              value={emergencyLocation}
              onChange={(e) => setEmergencyLocation(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden rounded-lg text-xs font-bold text-slate-800 shadow-3xs"
              placeholder="Target ward location"
            />
          </div>
        </div>
      </div>

      {/* Navigation sub-tabs in Pop Left Navigation Block */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6 w-full">
        {/* Left Navigation Block Section */}
        <div className={`transition-all duration-305 shrink-0 ${isNavCollapsed ? 'lg:w-16 w-full' : 'lg:w-64 w-full'} lg:sticky lg:top-4 w-full`}>
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              {!isNavCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Clinical Nursing</span>}
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
              {(() => {
                const list = [
                  { id: 'vitals', label: 'Vitals Logger', badge: vitals.length, icon: Heart, badgeColor: 'bg-indigo-650' },
                  { id: 'medication', label: 'Medication (MAR)', badge: medications.filter(m => m.status === 'Active').length, icon: Layers },
                  { id: 'fluids', label: 'Fluid Balancing', icon: Droplet },
                  { id: 'labs_coor', label: 'Labs Diagnostics', badge: labOrders.filter(o => o.status === 'Requested').length, icon: Clipboard, badgeColor: 'bg-rose-600 animate-pulse' },
                  { id: 'wound_care', label: 'Wound & IV Line Log', icon: Sparkles },
                  { id: 'emergency_code', label: 'Code Blue Response', icon: ShieldAlert },
                  { id: 'queues', label: 'Receptionist Queue', badge: appointments.filter(a => a.status === 'Scheduled').length, icon: Clipboard },
                  { id: 'handover', label: 'Shift Handovers', badge: handoffs.length, icon: RefreshCw }
                ];
                if (isStaffAdmin) {
                  list.unshift({ id: 'staff_mgmt', label: 'Staff Roster Ops', badge: doctors.length, icon: Users, badgeColor: 'bg-blue-650' });
                }
                return list;
              })().map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 text-white font-bold border-l-4 border-indigo-505 pl-1.5' 
                        : 'text-slate-400 hover:text-slate-205 hover:bg-slate-850'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
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
          {activeSubTab === 'vitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Bedside vitals logger (Colspan 1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-850 pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-indigo-600" />
              Digital Vitals Terminal
            </h3>

            <form onSubmit={handleVitalsSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Target Patient Bed</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-500 focus:outline-hidden rounded-lg font-medium"
                >
                  <option value="">-- Choose Patient Case --</option>
                  {patients.filter(p => p.status === 'Inpatient').map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Inpatient)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    required
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">SpO2 Percentage (%)</label>
                  <input
                    type="number"
                    required
                    value={spO2}
                    onChange={(e) => setSpO2(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">BP Sys</label>
                  <input
                    type="number"
                    required
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center font-mono"
                  />
                </div>
                <div className="pt-6 text-center text-slate-450">/</div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">BP Dia</label>
                  <input
                    type="number"
                    required
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Assigned Nurse Sign</label>
                  <input
                    type="text"
                    required
                    value={nurseName}
                    onChange={(e) => setNurseName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Dynamic smart triage view */}
              {selectedPatientId && (
                <div className="p-3.5 rounded-lg border text-xs flex justify-between items-center bg-slate-50 border-slate-200">
                  <span className="font-bold text-slate-650">Smart Triage Grade:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                    getSmartTriageValue(heartRate, systolic, spO2, temp) === 'Critical' ? 'bg-rose-100 text-rose-800 font-mono scale-102 transition-all' :
                    getSmartTriageValue(heartRate, systolic, spO2, temp) === 'Warning' ? 'bg-amber-100 text-amber-805' :
                    'bg-emerald-100 text-emerald-805'
                  }`}>
                    {getSmartTriageValue(heartRate, systolic, spO2, temp)}
                  </span>
                </div>
              )}

              <button
                type="submit"
                id="btn-save-vitals"
                className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Commit Telemetry Logs
              </button>

              {vitalsSuccess && (
                <div className="text-center font-bold text-xs text-emerald-600 font-sans">
                  ✔ Vitals metrics calculated & logged successfully.
                </div>
              )}
            </form>
                 {/* Vitals Feed (Colspan 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <span className="text-xs font-bold text-slate-805 uppercase tracking-widest">Patient Vitals Stream</span>
                
                {/* Vitals Filter Controls */}
                <div className="flex flex-wrap gap-2 text-xs items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search patient/nurse..."
                      value={vitalsFilterText}
                      onChange={(e) => setVitalsFilterText(e.target.value)}
                      className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <select
                    value={vitalsFilterClass}
                    onChange={(e) => setVitalsFilterClass(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All classes</option>
                    <option value="Stable">Stable</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                  </select>
                  {(vitalsFilterText !== '' || vitalsFilterClass !== 'All') && (
                    <button
                      type="button"
                      onClick={() => { setVitalsFilterText(''); setVitalsFilterClass('All'); }}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Vitals Form Overlay */}
              {editingVitalsId && (
                <div className="p-4 bg-indigo-50 border-b border-indigo-200 text-xs">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-indigo-150">
                    <span className="font-bold text-indigo-900 uppercase tracking-wide font-mono">Modify Bio-Telemetry Records (ID: #{editingVitalsId})</span>
                    <button onClick={() => setEditingVitalsId(null)} className="text-slate-400 hover:text-slate-650 text-xs font-bold font-mono">
                      [✕ Cancel]
                    </button>
                  </div>
                  <form onSubmit={handleSaveVitalsEdit} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Heart Pulse (BPM)</label>
                      <input
                        type="number"
                        required
                        value={editHeartRate}
                        onChange={(e) => setEditHeartRate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Systolic BP</label>
                      <input
                        type="number"
                        required
                        value={editSystolic}
                        onChange={(e) => setEditSystolic(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Diastolic BP</label>
                      <input
                        type="number"
                        required
                        value={editDiastolic}
                        onChange={(e) => setEditDiastolic(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Pulse SpO2 (%)</label>
                      <input
                        type="number"
                        required
                        value={editSpO2}
                        onChange={(e) => setEditSpO2(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Temperature (°F)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={editTemp}
                          onChange={(e) => setEditTemp(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-slate-900 text-teal-400 hover:bg-slate-800 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Modify
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto font-sans">
                <table className="w-full text-xs text-slate-705">
                  <thead className="bg-slate-100 text-[11px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Patient Checked</th>
                      <th className="px-4 py-2.5 text-center font-semibold">BPM</th>
                      <th className="px-4 py-2.5 text-center font-semibold">BP</th>
                      <th className="px-4 py-2.5 text-center font-semibold">SpO2</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Temp</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Triage Class</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(() => {
                      const filteredVitals = vitals.filter(log => {
                        const matchesText = log.patientName.toLowerCase().includes(vitalsFilterText.toLowerCase()) || 
                                           (log.loggedBy && log.loggedBy.toLowerCase().includes(vitalsFilterText.toLowerCase()));
                        const matchesClass = vitalsFilterClass === 'All' || log.classification === vitalsFilterClass;
                        return matchesText && matchesClass;
                      });

                      if (filteredVitals.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-sans">
                              No bio-telemetry logs match your filter criteria.
                            </td>
                          </tr>
                        );
                      }

                      return filteredVitals.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-800 block">{log.patientName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{log.recordedAt} • {log.loggedBy}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-medium">{log.heartRate}</td>
                          <td className="px-4 py-3 text-center font-mono font-medium">{log.bloodPressure}</td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-blue-600">{log.spO2}%</td>
                          <td className="px-4 py-3 text-center font-mono">{log.temperature}°F</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.classification === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              log.classification === 'Warning' ? 'bg-amber-50 text-amber-750 border border-amber-200' :
                              'bg-emerald-50 text-emerald-705 border border-emerald-200'
                            }`}>
                              {log.classification}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  setEditingVitalsId(log.id);
                                  setEditHeartRate(log.heartRate);
                                  const parts = (log.bloodPressure || "120/80").split("/");
                                  setEditSystolic(Number(parts[0]) || 120);
                                  setEditDiastolic(Number(parts[1]) || 80);
                                  setEditSpO2(log.spO2);
                                  setEditTemp(log.temperature);
                                }}
                                className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-indigo-650 hover:border-indigo-200 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Modify
                              </button>
                              <button
                                onClick={() => {
                                  if (onDeleteVitals) onDeleteVitals(log.id);
                                }}
                                className="px-2 py-1 bg-white border border-slate-205 text-rose-650 hover:bg-rose-50 hover:border-rose-200 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>        </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 text-[11px] text-slate-500 leading-normal">
              * Triage ratings calculations follow standard emergency medical assessment guidelines based on systemic vitals.
            </div>
          </div>
              {activeSubTab === 'medication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          
          {/* Left Column: Form to Log / Edit MAR Schedules */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs bg-gradient-to-b from-white to-slate-50">
            {editingMedId ? (
              <form onSubmit={handleSaveMedicationEdit} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 tracking-wider">Modify MAR Schedule (Ref ID: #{editingMedId})</span>
                  <button type="button" onClick={() => setEditingMedId(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase pb-1">Therapeutic Agent Name</label>
                  <input
                    type="text"
                    required
                    value={editMedName}
                    onChange={(e) => setEditMedName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-555 uppercase pb-1">Dosage Weight</label>
                    <input
                      type="text"
                      required
                      value={editMedDosage}
                      onChange={(e) => setEditMedDosage(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-555 uppercase pb-1 font-sans">Frequency Interval</label>
                    <select
                      value={editMedFrequency}
                      onChange={(e) => setEditMedFrequency(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg"
                    >
                      <option value="q8h">Every 8 Hours (q8h)</option>
                      <option value="q12h">Every 12 Hours (q12h)</option>
                      <option value="q6h">Every 6 Hours (q6h)</option>
                      <option value="Daily">Once Daily (QD)</option>
                      <option value="PRN">As Needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-555 uppercase pb-1">Target Route</label>
                  <select
                    value={editMedRoute}
                    onChange={(e) => setEditMedRoute(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg text-xs"
                  >
                    <option value="Oral">Oral (PO)</option>
                    <option value="Intravenous">Intravenous (IV)</option>
                    <option value="Intramuscular">Intramuscular (IM)</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-555 uppercase pb-1 font-sans">Special Remarks</label>
                  <textarea
                    value={editMedNotes}
                    onChange={(e) => setEditMedNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg min-h-[60px]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMedId(null)}
                    className="flex-1 py-1.5 bg-white border border-slate-205 text-slate-600 font-bold rounded-lg uppercase text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-slate-900 text-teal-400 hover:bg-slate-800 font-bold rounded-lg uppercase text-[10px]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-850 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Schedule Medication MAR
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-sans">
                  Instantly schedule dynamic MAR records for current active inpatients at this branch ward.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase pb-1 text-slate-600">Select Patient Case</label>
                  <select
                    required
                    value={selectedMedPatientId}
                    onChange={(e) => setSelectedMedPatientId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg font-medium"
                  >
                    <option value="">-- Choose Patient Case --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.status === 'Inpatient' ? '[Inpatient]' : '[Outpatient]'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase pb-1">Therapeutic Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol, Ibuprofen"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-555 uppercase pb-1">Dosage Weight</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500mg, 10ml"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-355 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-555 uppercase pb-1 font-sans">Frequency Interval</label>
                    <select
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg text-xs"
                    >
                      <option value="q8h">Every 8 Hours (q8h)</option>
                      <option value="q12h">Every 12 Hours (q12h)</option>
                      <option value="q6h">Every 6 Hours (q6h)</option>
                      <option value="Daily">Once Daily (QD)</option>
                      <option value="PRN">As Needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-555 uppercase pb-1">Target Route</label>
                  <select
                    value={medRoute}
                    onChange={(e) => setMedRoute(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-lg text-xs"
                  >
                    <option value="Oral">Oral (PO)</option>
                    <option value="Intravenous">Intravenous (IV)</option>
                    <option value="Intramuscular">Intramuscular (IM)</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-555 uppercase pb-1 font-sans">Special Remarks</label>
                  <textarea
                    placeholder="e.g. Administer with meals, monitor BP..."
                    value={medNotes}
                    onChange={(e) => setMedNotes(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg min-h-[50px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-teal-400 hover:bg-slate-800 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                >
                  Schedule MAR Entry
                </button>

                {medSuccess && (
                  <div className="text-center font-bold text-xs text-emerald-600 font-sans">
                    ✔ Medication scheduled beautifully.
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Right Column (Colspan 2): Active MAR Schedules with Actions */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-850 uppercase tracking-wider block">Historic Medication Schedules</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Filter and administer medications</span>
                </div>

                {/* Meds Filters */}
                <div className="flex flex-wrap gap-2 text-xs items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search medicine/patient..."
                      value={medsFilterText}
                      onChange={(e) => setMedsFilterText(e.target.value)}
                      className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <select
                    value={medsFilterStatus}
                    onChange={(e) => setMedsFilterStatus(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active / Pending</option>
                    <option value="Administered">Administered</option>
                  </select>
                  {(medsFilterText !== '' || medsFilterStatus !== 'All') && (
                    <button
                      type="button"
                      onClick={() => { setMedsFilterText(''); setMedsFilterStatus('All'); }}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-155 max-h-[500px] overflow-y-auto">
                {(() => {
                  const filteredMeds = medications.filter(med => {
                    const matchesText = med.medicineName.toLowerCase().includes(medsFilterText.toLowerCase()) || 
                                       med.patientName.toLowerCase().includes(medsFilterText.toLowerCase()) ||
                                       (med.dose && med.dose.toLowerCase().includes(medsFilterText.toLowerCase()));
                    const matchesStatus = medsFilterStatus === 'All' || med.status === medsFilterStatus;
                    return matchesText && matchesStatus;
                  });

                  if (filteredMeds.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 text-xs font-sans">
                        No medication administration records matched your filters.
                      </div>
                    );
                  }

                  return filteredMeds.map(med => (
                    <div key={med.id} className="p-4 flex flex-col hover:bg-slate-50/50 gap-3 border-b">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{med.medicineName}</span>
                            <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded">
                              Dose: {med.dosage || med.dose}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Interval: {med.frequency || 'q8h'} • Route: {med.route || 'Oral'}</span>
                          </div>
                          <div className="text-xs text-slate-550 font-sans leading-relaxed">
                            Patient: <strong className="text-slate-805 font-semibold">{med.patientName}</strong> 
                            {med.notes && <span className="block text-[11px] text-slate-450 italic font-mono mt-0.5">Notes: {med.notes}</span>}
                            {med.administeredAt && (
                              <span className="text-emerald-600 block font-mono font-semibold text-[10px] mt-0.5">✔ Administered by Sarah RN: {med.administeredAt}</span>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded shrink-0 ${
                          med.status === 'Administered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {med.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-150 flex-wrap gap-2 text-xs">
                        <button
                          onClick={() => onToggleMedState(med.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                            med.status === 'Administered'
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          {med.status === 'Administered' ? 'Dispensed' : 'Trigger Administration'}
                        </button>

                        <div className="flex gap-1.5 matches-actions">
                          <button
                            onClick={() => {
                              setEditingMedId(med.id);
                              setEditMedName(med.medicineName);
                              setEditMedDosage(med.dosage || med.dose || '500mg');
                              setEditMedRoute(med.route || 'Oral');
                              setEditMedFrequency(med.frequency || 'q8h');
                              setEditMedNotes(med.notes || '');
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-indigo-650 hover:border-indigo-200 rounded font-bold text-[10px] cursor-pointer"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteMedication) onDeleteMedication(med.id);
                            }}
                            className="px-2 py-1 bg-white border border-slate-205 text-rose-650 hover:bg-rose-50 hover:border-rose-200 rounded font-bold text-[10px] cursor-pointer"
                          >
                            Discharge
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}    </div>
      )}

      {activeSubTab === 'fluids' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Chart Input form (Colspan 1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs bg-gradient-to-b from-white to-slate-50">
            <h3 className="text-sm font-bold text-slate-850 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-sky-600" />
              Fluid intake & Output tracking
            </h3>

            <form onSubmit={handleFluidSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1">Target Account Patient</label>
                <select
                  required
                  value={fluidPatientId}
                  onChange={(e) => setFluidPatientId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-medium"
                >
                  <option value="">-- Choose Patient Case --</option>
                  {patients.filter(p => p.status === 'Inpatient').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1">Intake Level (mL)</label>
                  <input
                    type="number"
                    required
                    value={fluidIntake}
                    onChange={(e) => setFluidIntake(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1">Output Level (mL)</label>
                  <input
                    type="number"
                    required
                    value={fluidOutput}
                    onChange={(e) => setFluidOutput(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-indigo-505 focus:outline-hidden rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1 font-sans">Observational Notes</label>
                <textarea
                  placeholder="e.g. Normal oral liquids/IV Saline or urinary discharges"
                  value={fluidNotes}
                  onChange={(e) => setFluidNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                id="btn-save-fluid"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Droplet className="w-3.5 h-3.5" />
                Commit Fluid Chart Entry
              </button>

              {fluidSuccess && (
                <div className="text-center font-bold text-xs text-emerald-600 font-sans">
                  ✔ Hydration balances logged correctly.
                </div>
              )}
            </form>
          </div>

          {/* Chart Display Feed (Colspan 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Patient Fluid Balance Logs</span>
                
                {/* Fluids Filter */}
                <div className="flex text-xs items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search patient/notes..."
                      value={fluidsFilterText}
                      onChange={(e) => setFluidsFilterText(e.target.value)}
                      className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  {fluidsFilterText !== '' && (
                    <button
                      type="button"
                      onClick={() => setFluidsFilterText('')}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Fluids Form Overlay */}
              {editingFluidsId && (
                <div className="p-4 bg-blue-50 border-b border-blue-210 text-xs">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-blue-150">
                    <span className="font-bold text-blue-900 uppercase tracking-wide font-mono">Modify Fluid Balance Record (ID: #{editingFluidsId})</span>
                    <button onClick={() => setEditingFluidsId(null)} className="text-slate-400 hover:text-slate-650 text-xs font-bold font-mono">
                      [✕ Cancel]
                    </button>
                  </div>
                  <form onSubmit={handleSaveFluidsEdit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Intake Level (mL)</label>
                      <input
                        type="number"
                        required
                        value={editFluidIntake}
                        onChange={(e) => setEditFluidIntake(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 pb-1">Output Level (mL)</label>
                      <input
                        type="number"
                        required
                        value={editFluidOutput}
                        onChange={(e) => setEditFluidOutput(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 pb-1 font-sans">Observational Notes</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editFluidNotes}
                          onChange={(e) => setEditFluidNotes(e.target.value)}
                          className="p-2 bg-white border border-slate-250 rounded-lg text-xs flex-1 font-sans"
                        />
                        <button
                          type="submit"
                          className="px-4 bg-slate-900 text-teal-400 hover:bg-slate-800 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Modify
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto text-sans">
                <table className="w-full text-xs text-slate-705 font-sans">
                  <thead className="bg-slate-100 text-[11px] text-slate-550 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Timestamp (UTC)</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Patient Case</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Intake (IV/Oral)</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Output (Vol)</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Clinical Observation Notes</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs font-sans">
                    {(() => {
                      const filteredFluids = fluids.filter(entry => {
                        return entry.patientName.toLowerCase().includes(fluidsFilterText.toLowerCase()) || 
                               (entry.notes && entry.notes.toLowerCase().includes(fluidsFilterText.toLowerCase()));
                      });

                      if (filteredFluids.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-sans">
                              No fluid logs matched your current filters.
                            </td>
                          </tr>
                        );
                      }

                      return filteredFluids.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-445 font-mono truncate max-w-[120px]">{entry.recordedAt}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 font-sans">{entry.patientName}</td>
                          <td className="px-4 py-3 text-center text-blue-600 font-bold font-mono">{entry.intakeMl} mL</td>
                          <td className="px-4 py-3 text-center text-amber-600 font-bold font-mono">{entry.outputMl} mL</td>
                          <td className="px-4 py-3 text-slate-550 italic truncate max-w-[150px] font-sans">{entry.notes || 'No remarks recorded'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  setEditingFluidsId(entry.id);
                                  setEditFluidIntake(entry.intakeMl);
                                  setEditFluidOutput(entry.outputMl);
                                  setEditFluidNotes(entry.notes || "");
                                }}
                                className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-blue-650 hover:border-blue-200 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Modify
                              </button>
                              <button
                                onClick={() => {
                                  if (onDeleteFluids) onDeleteFluids(entry.id);
                                }}
                                className="px-2 py-1 bg-white border border-slate-205 text-[10px] text-rose-650 hover:bg-rose-50 hover:border-rose-200 rounded font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'handover' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
          {/* Shift handover registrar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-850 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-600" />
              Define Shift Handover notes
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Ensure continuity of care of bed assignments, critical vitals drops, and outstanding medication schedules. 
            </p>

            <form onSubmit={handleHandoverSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Outgoing / Incoming Staff details</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-450 block">Registered Outgoing:</span>
                    <strong className="text-slate-800">Sarah Jenkins, RN</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-230 rounded-lg">
                    <span className="text-[10px] text-slate-455 block">Handing Over To:</span>
                    <strong className="text-slate-800">Keith Carter, LPN</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1">Handover Observations & Notes</label>
                <textarea
                  required
                  placeholder="Summarize ward updates, key complaints, active discharges info, etc."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg min-h-[90px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider pb-1">Critical Priority Alerts (Red Flag Notices)</label>
                <input
                  type="text"
                  placeholder="e.g. Bed 203 BP dipping, ICU results ready..."
                  value={handoverAlerts}
                  onChange={(e) => setHandoverAlerts(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-rose-850 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-teal-400 font-extrabold font-mono text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                DEPLOY SYSTEM HANDOVER RECORD
              </button>

              {handoverSuccess && (
                <div className="text-center font-bold text-xs text-emerald-600 font-sans">
                  ✔ Shift handover record signed electrically and locked.
                </div>
              )}
            </form>
          </div>

          {/* Handover History records */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Shift handoff registry logs</h3>
                
                {/* Handover Search */}
                <div className="flex text-xs items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search log details..."
                      value={handoffFilterText}
                      onChange={(e) => setHandoffFilterText(e.target.value)}
                      className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  {handoffFilterText !== '' && (
                    <button
                      type="button"
                      onClick={() => setHandoffFilterText('')}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4 font-sans">
                {(() => {
                  const filteredHandoffs = handoffs.filter(h => {
                    const text = (h.outgoingStaff + ' ' + h.incomingStaff + ' ' + h.notes + ' ' + (h.criticalAlerts || '')).toLowerCase();
                    return text.includes(handoffFilterText.toLowerCase());
                  });

                  if (filteredHandoffs.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 text-xs font-sans">
                        No shift handover records match your search criteria.
                      </div>
                    );
                  }

                  return filteredHandoffs.map(h => (
                    <div key={h.id} className="p-3 bg-slate-55 border border-slate-205 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                        <span>Ref ID: #{h.id}</span>
                        <span>Date logged: {h.date}</span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          Outgoing nurse: <strong className="text-slate-800">{h.outgoingStaff}</strong>
                        </div>
                        <div>
                          Incoming nurse: <strong className="text-slate-805">{h.incomingStaff}</strong>
                        </div>
                      </div>

                      <p className="text-xs text-slate-655 bg-white p-2.5 rounded-lg border border-slate-105 leading-normal font-sans">
                        {h.notes}
                      </p>

                      {h.criticalAlerts && (
                        <div className="text-xs bg-rose-50 border border-rose-150 text-rose-800 rounded-lg p-2.5 flex items-start gap-1 font-semibold leading-normal font-sans">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>Critical alerts: {h.criticalAlerts}</span>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              * Shift continuity is HIPAA protected and recorded into the core cloud ledger automatically.
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'wound_care' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Wound Management and Cannulation Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-800">
            
            {/* Pressure Ulcer monitoring systems */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-805">Wound Care Tracking & Pressure Ulcer Prevention</h3>
              </div>
              <p className="text-xs text-slate-500 font-sans">Braden Scale risk assessment logs paired with active wound healing stages.</p>

              <div className="space-y-3">
                {[
                  { patient: 'Arjun Sharma', location: 'Sacral Region', BradenScore: '14 (Moderate Risk)', stage: 'Stage II (Partial Thickness Skinitis)', dressing: 'Duoderm Hydrocolloid Applied 4 hrs ago' },
                  { patient: 'Meera Deshmukh', location: 'Left Lateral Heel', BradenScore: '19 (Low Risk / Healthy)', stage: 'Stage I (Non-blanchable erythema)', dressing: 'Allevyn Foam Protection' }
                ].map((wound, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 font-sans">
                    <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded">
                      <strong className="text-slate-905 block font-bold">Patient: {wound.patient}</strong>
                      <span className="text-[10px] bg-indigo-50 text-indigo-707 border border-indigo-200 font-bold px-1.5 py-0.2 rounded font-mono">Braden: {wound.BradenScore}</span>
                    </div>
                    <div className="text-slate-650 font-sans mt-1 space-y-0.5">
                      <div>Anatomical Location: <strong className="text-slate-800">{wound.location}</strong></div>
                      <div>Staging Scale: <strong className="text-rose-650">{wound.stage}</strong></div>
                      <div>Dressing Status: <strong className="text-slate-707">{wound.dressing}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IV Cannulation & Lines Logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-850">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">IV Line & Catheter Site Logbook</h3>
                <span className="px-1.5 py-0.5 text-[9px] bg-teal-50 text-teal-800 font-bold uppercase rounded font-mono">3 Active Lines</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { patient: 'Arjun Sharma', type: 'Peripheral IV (20G Pink)', site: 'Right forearm hand vein', date: '2026-05-24', healthy: 'Healthy (Phlebitis Grade 0)' },
                  { patient: 'Meera Deshmukh', type: 'Central PICC Triple-Lumen', site: 'Right basilic vein route', date: '2026-05-22', healthy: 'Flushed & patent - no warmth observed' }
                ].map((line, idx) => (
                  <div key={idx} className="p-3 bg-slate-55 border border-slate-200 rounded-lg text-xs font-sans space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">{line.patient}</span>
                      <span className="text-indigo-605 font-mono">{line.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-505">Insertion Site: <strong>{line.site}</strong> | Date: <strong>{line.date}</strong></p>
                    <span className="block text-[10px] font-bold text-emerald-700">✔ status check: {line.healthy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-805">
            {/* Visual Pain assessment slider log */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Pain Assessment Scale (Wong-Baker system)</h3>
              </div>
              <p className="text-xs text-slate-500 font-sans">Log pain levels daily for inpatient rounds assessments.</p>

              <div className="space-y-4 pt-1 font-sans">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-700 pb-1">
                    <span>Patient: <strong>Arjun Sharma</strong></span>
                    <strong className="text-rose-605 text-xs font-bold font-mono">Pain Scale: 6 / 10</strong>
                  </div>
                  <input type="range" min="0" max="10" defaultValue="6" className="w-full accent-rose-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
                    <span>0 - No Pain</span>
                    <span>5 - Moderate</span>
                    <span>10 - Worst Pain</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-250 rounded-lg text-xs font-sans">
                  <span className="font-bold text-slate-800 block">Assessment Guideline:</span>
                  <p className="text-slate-500 mt-1">Grade 5 and above warrants direct notification to attending medical consultants and trigger PRN Tramadol/Fentanyl as prescribed.</p>
                </div>
              </div>
            </div>

            {/* Nurse notes scheduler progress files */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Nurses Daily Progress sheets notes</h3>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                {[
                  { time: '09:30 AM', nurse: 'Sarah J.', note: 'Patient extremely restless. Sacral dressing Stage II healthy without exudate. Repositioned 30 degrees lateral left.' },
                  { time: '11:00 AM', nurse: 'Sarah J.', note: 'Hourly vitals done. Heart rate 82 bpm, SpO2 97% on room air. Infused scheduled paracetamol IV.' }
                ].map((note, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-707 font-mono">
                      <span>⏰ Time: {note.time}</span>
                      <span>Assigned: {note.nurse}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-505 font-sans leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'emergency_code' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Code Blue Response systems */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
            
            {/* Defibrillators Crash card audit checklists */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 col-span-1">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-850">Crash Cart Items checklist</h3>
                <span className="px-2 py-0.5 text-[9px] bg-slate-100 border border-slate-200 font-bold tracking-wider rounded font-mono text-slate-705">DAILY AUDIT</span>
              </div>
              
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Defibrillator Battery Charge Checked', ok: true },
                  { name: 'Ambu bag & Intubation Tubes', ok: true },
                  { name: 'Epinephrine & Atropine Stock counts', ok: true },
                  { name: 'Laryngoscope Blades validated', ok: true },
                  { name: 'Suction Unit functioning test', ok: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg font-sans">
                    <span className="font-medium text-slate-750">{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-202 font-bold font-mono">PASSED ✔</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Blue Emergency Response dispatcher logs */}
            <div className="lg:col-span-2 bg-rose-950 text-white rounded-2xl p-5 shadow-md space-y-4 flex flex-col justify-between h-[360px] font-sans">
              <div className="flex justify-between items-center bg-rose-900/40 p-3 rounded border border-rose-900 text-rose-100">
                <div>
                  <span className="text-[9px] font-mono tracking-wider uppercase bg-white text-rose-950 font-extrabold px-2 py-0.5 rounded inline-block animate-pulse">EMERGENCY DISPATCH LIVE</span>
                  <h3 className="text-xs font-bold text-white mt-1">Code Blue Broadcast Registry Log</h3>
                </div>
                <div className="text-right text-[10px] text-rose-250 font-mono">
                  Site: ICU Unit Room 302 | Response Team Activated 
                </div>
              </div>

              {/* simulated timeline feed */}
              <div className="flex-grow overflow-y-auto space-y-2 max-h-[160px] p-2 bg-rose-955/20 rounded font-mono text-[10px] text-rose-100">
                <p className="text-rose-300">[11:04 AM] CPR protocol Initiated. Attending Nurse S. Shinde started cardiac chest compressions.</p>
                <p className="text-rose-300">[11:05 AM] Intubation complete. Airway locked via ET tube #7.5 by Dr. Roy.</p>
                <p className="text-rose-150 font-bold">[11:06 AM] Epinephrine 1mg IV Bolus administered. Witnessed by Nurse Sarah J.</p>
                <p className="text-rose-150 font-bold">[11:07 AM] AED shock delivered. 150 Joules. Bi-Phasic. Patient resumed sinus rhythm.</p>
              </div>

              {/* simulated tools triggers */}
              <div className="pt-4 border-t border-rose-900 flex justify-end gap-2 text-xs">
                <button className="px-3 py-1.5 bg-rose-900 border border-rose-810 hover:bg-rose-800 text-white font-bold rounded-lg cursor-pointer">
                  MOCK DISPATCH CODE BLUE ALARM
                </button>
                <button className="px-3 py-1.5 bg-white text-rose-950 font-bold rounded-lg cursor-pointer">
                  MARK ALM RESOLVED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'labs_coor' && (
        <div className="space-y-4 animate-fade-in font-sans">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between md:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Laboratory Diagnostics & Coordination</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">Track lab orders, specimen collection status, and diagnostics reports.</p>
              </div>

              {/* Lab Coordination Filters */}
              <div className="flex flex-wrap gap-2 text-xs items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search test/patient..."
                    value={labCoorFilterText}
                    onChange={(e) => setLabCoorFilterText(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={labCoorFilterStatus}
                  onChange={(e) => setLabCoorFilterStatus(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {(labCoorFilterText !== '' || labCoorFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setLabCoorFilterText(''); setLabCoorFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto text-sm text-slate-750 font-sans">
              <table className="w-full">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Prescribed Test</th>
                    <th className="px-5 py-3 text-left font-semibold">Admitting Patient</th>
                    <th className="px-5 py-3 text-center font-semibold">Assay Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Diagnostic Reports Findings</th>
                    <th className="px-5 py-3 text-right font-semibold">Laboratory actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {(() => {
                    const filteredLabs = labOrders.filter(order => {
                      const matchesText = order.testName.toLowerCase().includes(labCoorFilterText.toLowerCase()) || 
                                         order.patientName.toLowerCase().includes(labCoorFilterText.toLowerCase()) ||
                                         String(order.id).includes(labCoorFilterText);
                      
                      const matchesStatus = labCoorFilterStatus === 'All' || order.status === labCoorFilterStatus;
                      return matchesText && matchesStatus;
                    });

                    if (filteredLabs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 text-xs font-sans">
                            No chemistry lab assay requests match your current filters.
                          </td>
                        </tr>
                      );
                    }

                    return filteredLabs.map(order => {
                      const currentVal = labResultsFeed[order.id] || '';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div>
                              <span className="font-bold text-slate-900 block font-sans">{order.testName}</span>
                              <span className="text-xs text-slate-500 font-mono block">Order ID: #{order.id} • Date: {order.orderedDate}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-800 font-sans">{order.patientName}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                              order.status === 'Completed' ? 'bg-emerald-50 border border-emerald-250 text-emerald-850' :
                              order.status === 'In Progress' ? 'bg-indigo-50 border border-indigo-250 text-indigo-850 animate-pulse font-sans' :
                              'bg-slate-50 border border-slate-200 text-slate-500 font-sans'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-sans">
                            {order.status === 'Completed' ? (
                              <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-850 text-xs font-mono">
                                <strong>Report:</strong> {order.result || 'No specific observations documented.'}
                              </div>
                            ) : (
                              <input
                                type="text"
                                required
                                placeholder="e.g. Troponin 0.04 ng/mL, normal range"
                                value={currentVal}
                                onChange={(e) => setLabResultsFeed({
                                  ...labResultsFeed,
                                  [order.id]: e.target.value
                                })}
                                className="px-2.5 py-1 text-xs bg-white border border-slate-350 focus:border-indigo-500 rounded-md w-full animate-none"
                              />
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {order.status !== 'Completed' ? (
                              <button
                                onClick={() => {
                                  onUpdateLabStatus(order.id, 'Completed', currentVal || 'Specimen processed successfully.');
                                }}
                                className="px-3 py-1 bg-indigo-600 font-extrabold hover:bg-indigo-700 text-white text-[11px] rounded transition-all cursor-pointer shadow-xs font-sans"
                              >
                                Fulfill Assay & report
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 block">Report Released ✔</span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'queues' && (
        <div className="space-y-4 animate-fade-in font-sans">
          {/* Daily Clinic Queue Numbers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 justify-between items-center flex flex-col sm:flex-row gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Clinic Check-in & Appointment Queue</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">Manage checked-in patients and assign consultation queues.</p>
              </div>

              {/* Queue Filters */}
              <div className="flex text-xs items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search patient/doctor/slot..."
                    value={queueFilterText}
                    onChange={(e) => setQueueFilterText(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                {queueFilterText !== '' && (
                  <button
                    type="button"
                    onClick={() => setQueueFilterText('')}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-705">
              <thead className="bg-slate-100 text-[10px] text-slate-550 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Appointed Patient</th>
                  <th className="px-5 py-3 text-left font-semibold">Attending physician</th>
                  <th className="px-5 py-3 text-center font-semibold">Consult slot details</th>
                  <th className="px-5 py-3 text-center font-semibold">Check-in Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Reception controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {(() => {
                  const filteredAppointments = appointments.filter(app => {
                    const text = (app.patientName + ' ' + app.doctorName + ' ' + app.timeSlot + ' ' + app.type + ' ' + app.status).toLowerCase();
                    return text.includes(queueFilterText.toLowerCase());
                  });

                  if (filteredAppointments.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 font-sans text-xs">
                          No clinic appointments found matching your search.
                        </td>
                      </tr>
                    );
                  }

                  return filteredAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 font-sans">
                          {app.patientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-sans">
                          <strong className="text-slate-850 block font-sans">{app.patientName}</strong>
                          <span className="text-[10px] text-slate-450 block font-mono">ID: {app.patientId}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-indigo-705 font-sans">{app.doctorName}</td>
                      <td className="px-5 py-3.5 text-center font-mono">
                        <span className="font-semibold block">{app.timeSlot}</span>
                        <span className="text-[9px] text-indigo-600 uppercase font-bold">{app.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-sans">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                          app.status === 'Scheduled' ? 'bg-amber-50 text-amber-800 border border-amber-250 animate-pulse' : 'bg-emerald-50 text-emerald-850 border border-emerald-250'
                        }`}>
                          {app.status === 'Scheduled' ? 'WAITING ARRIVAL' : 'CHECKED IN / ACTIVE'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        {app.status === 'Scheduled' ? (
                          <button
                            onClick={() => {
                              // Assign virtual queue number and update state or alert check in
                              app.status = 'Completed';
                              onLogVitals({
                                patientId: app.patientId,
                                patientName: app.patientName,
                                heartRate: 72,
                                bloodPressure: "120/80",
                                temperature: 98.6,
                                spO2: 99,
                                loggedBy: "System Desk"
                              });
                            }}
                            className="px-3 py-1 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-[10px] rounded cursor-pointer shadow-xs"
                          >
                            Check In & Triage
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                            ✔ Logged on duty
                          </span>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* 0. Staff Management & Roster panel (ONLY for isStaffAdmin) */}
      {isStaffAdmin && activeSubTab === 'staff_mgmt' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Enrolled Nodes</span>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{doctors.length}</p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1">Authorized Medical Profiles</span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">On-Duty Coverage</span>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {doctors.filter(d => (updatedAvailability[d.id] || d.availability) === 'On Duty').length}
                </p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1">Ward floor active roster</span>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Off-Duty / Rest</span>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {doctors.filter(d => (updatedAvailability[d.id] || d.availability) === 'Off Duty').length}
                </p>
                <span className="text-[9px] text-slate-450 font-medium block mt-1">Off-shift recuperating</span>
              </div>
              <div className="p-2.5 bg-slate-100 text-slate-500 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Vitals Logged</span>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{vitals.length}</p>
                <span className="text-[9px] text-rose-500 font-bold block mt-1">Recent logs: {vitals.length > 0 ? "Active" : "None"}</span>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg">
                <Heart className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT CONTAINER: LIST REGISTERED NURSE/STAFF */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5 font-sans">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> Active Roster Control
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">Search, monitor and toggle clinical shift status instantly.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search name/specialty..."
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 font-medium focus:outline-hidden focus:border-indigo-605 text-slate-800 font-sans"
                  />
                </div>
              </div>

              {/* LIST TABLE OR GRID */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-wider text-slate-450 bg-slate-50/50">
                      <th className="px-3 py-2">Profile / Unit</th>
                      <th className="px-3 py-2">Email Identity</th>
                      <th className="px-3 py-2 text-center">Clearance</th>
                      <th className="px-3 py-2 text-center">Roster Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors
                      .filter(doc => {
                        const nameMatch = doc.name.toLowerCase().includes(rosterSearch.toLowerCase());
                        const roleMatch = (doc.profession || '').toLowerCase().includes(rosterSearch.toLowerCase());
                        const specMatch = (doc.specialty || '').toLowerCase().includes(rosterSearch.toLowerCase());
                        return nameMatch || roleMatch || specMatch;
                      })
                      .map(docItem => {
                        const currAvailability = updatedAvailability[docItem.id] || docItem.availability;
                        const isCNO = docItem.profession === 'staff_admin' || docItem.role === 'staff_admin';
                        const isDoctor = docItem.profession === 'doctor' || (!docItem.profession && docItem.id.startsWith('doc'));
                        const isNurse = !isCNO && !isDoctor;

                        return (
                          <tr key={docItem.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                            <td className="px-3 py-2.5 font-sans">
                              <span className="font-bold text-slate-800 text-xs block">{docItem.name}</span>
                              <span className="text-[10px] text-slate-450 block">{docItem.specialty || 'General Duty'}</span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                              {docItem.email || 'roster-ref@medcore.io'}
                            </td>
                            <td className="px-3 py-2.5 text-center font-sans">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md tracking-wide ${
                                isCNO ? 'bg-indigo-100 text-indigo-800' :
                                isDoctor ? 'bg-emerald-100 text-emerald-850' :
                                'bg-sky-100 text-sky-850'
                              }`}>
                                {isCNO ? 'Staff Admin' : isDoctor ? 'Doctor' : 'Care Nurse'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center font-sans">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                currAvailability === 'On Duty' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                currAvailability === 'Emergency' ? 'bg-rose-55 bg-opacity-70 text-rose-700 border border-rose-255 animate-pulse' :
                                'bg-slate-150 text-slate-600'
                              }`}>
                                {currAvailability}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-sans">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setUpdatedAvailability(prev => ({
                                      ...prev,
                                      [docItem.id]: currAvailability === 'On Duty' ? 'Off Duty' : 'On Duty'
                                    }));
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                                >
                                  {currAvailability === 'On Duty' ? 'Set Off Duty' : 'Set On Duty'}
                                </button>
                                <button
                                  onClick={() => {
                                    setUpdatedAvailability(prev => ({
                                      ...prev,
                                      [docItem.id]: 'Emergency'
                                    }));
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold bg-rose-100 hover:bg-rose-200 rounded-md text-rose-705 cursor-pointer"
                                >
                                  Page
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT CONTAINER: ENROLL NEW CLINICAL STAFF FORM */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 h-fit">
              <div>
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5 font-sans">
                  <Plus className="w-4 h-4 text-emerald-600" /> Enroll Clinical Nurse / Staff
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">Add a new licensed caregiver to the branch directory.</p>
              </div>

              {newStaffSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-xl text-xs font-bold font-sans">
                  ✔ Clinical Personnel registered and synced. They can now immediately log in with their credentials!
                </div>
              )}

              <form onSubmit={handleStaffEnrollSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Full Name & Title
                  </label>
                  <input
                    required
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Nurse Clara Barton, RN"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-205 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Credential Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="abc@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-205 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Security Password
                  </label>
                  <input
                    required
                    type="text"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="nurse123"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-205 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Staff Role
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="nurse">Clinical Nurse</option>
                      <option value="staff">Clinical Staff</option>
                      <option value="staff_admin">Staff Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Initial Shift
                    </label>
                    <select
                      value={newStaffAvailability}
                      onChange={(e) => setNewStaffAvailability(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Emergency">Emergency Core</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Primary Ward Unit
                  </label>
                  <input
                    type="text"
                    value={newStaffSpecialty}
                    onChange={(e) => setNewStaffSpecialty(e.target.value)}
                    placeholder="Critical Care Units"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-205 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Contact Hotline (Optional)
                  </label>
                  <input
                    type="text"
                    value={newStaffContact}
                    onChange={(e) => setNewStaffContact(e.target.value)}
                    placeholder="+1 (555) 301-8888"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-205 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all mt-2 font-sans"
                >
                  <Plus className="w-3.5 h-3.5" /> Enlist and Sync Roster Node
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
