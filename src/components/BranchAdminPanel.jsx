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
  Home, Users, CreditCard, Layers, Plus, Heart, HelpCircle, 
  Search, ShieldAlert, Check, X, FileText, Bed, Trash2, ShieldCheck, 
  TrendingUp, AlertCircle, Sparkles, Filter, Edit
} from 'lucide-react';

export default function BranchAdminPanel({
  branch,
  beds,
  doctors,
  patients,
  invoices,
  labOrders,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onUpdateBedStatus,
  onUpdateBed,
  onDeleteBed,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onReconcileInvoice,
  inventoryItems,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onRestockMedicine,
  onDischargePatient,
  onSetBedTimer,
  onExpireBedTimer,
  onAddBed,
  onAddLabOrder,
  onUpdateLabOrder,
  onDeleteLabOrder,
  hospitalName,
  activeSubscription
}) {
  // Sub-tabs inside Branch: 'beds' | 'staff' | 'billing' | 'labs' | 'inventory'
  const [activeSubTab, setActiveSubTab] = useState('beds');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Editing States for CRUD operations
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocSpecialty, setEditDocSpecialty] = useState('');
  const [editDocPhone, setEditDocPhone] = useState('');
  const [editDocAvailability, setEditDocAvailability] = useState('On Duty');
  const [editDocEmail, setEditDocEmail] = useState('');

  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editPatName, setEditPatName] = useState('');
  const [editPatAge, setEditPatAge] = useState('');
  const [editPatGender, setEditPatGender] = useState('Male');
  const [editPatPhone, setEditPatPhone] = useState('');
  const [editPatAilment, setEditPatAilment] = useState('');
  const [editPatStatus, setEditPatStatus] = useState('Diagnostic Triage');
  const [editPatBillDue, setEditPatBillDue] = useState('0');
  const [editPatRoomBed, setEditPatRoomBed] = useState('');

  const [editingBedId, setEditingBedId] = useState(null);
  const [editBedNumber, setEditBedNumber] = useState('');
  const [editBedCategory, setEditBedCategory] = useState('General');
  const [editBedStatus, setEditBedStatus] = useState('Available');

  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editInvSubject, setEditInvSubject] = useState('');
  const [editInvPatientId, setEditInvPatientId] = useState('');
  const [editInvAmount, setEditInvAmount] = useState('');
  const [editInvStatus, setEditInvStatus] = useState('Pending Approval');

  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editInvItemName, setEditInvItemName] = useState('');
  const [editInvItemUnit, setEditInvItemUnit] = useState('Vials');
  const [editInvItemStock, setEditInvItemStock] = useState(0);
  const [editInvItemRequiredMin, setEditInvItemRequiredMin] = useState(0);
  const [editInvItemPrice, setEditInvItemPrice] = useState(0);

  const [editingLabId, setEditingLabId] = useState(null);
  const [editLabTestName, setEditLabTestName] = useState('');
  const [editLabPatientId, setEditLabPatientId] = useState('');
  const [editLabDocId, setEditLabDocId] = useState('');
  const [editLabStatus, setEditLabStatus] = useState('Diagnostic Queued');
  const [editLabUrgent, setEditLabUrgent] = useState(false);

  // CRUD Edit Submission Handlers
  const handleEditDoctorSubmit = (e) => {
    e.preventDefault();
    if (editingDoctorId && onUpdateDoctor) {
      onUpdateDoctor(editingDoctorId, {
        name: editDocName,
        specialty: editDocSpecialty,
        phone: editDocPhone,
        availability: editDocAvailability,
        email: editDocEmail
      });
      setEditingDoctorId(null);
    }
  };

  const handleEditPatientSubmit = (e) => {
    e.preventDefault();
    if (editingPatientId && onUpdatePatient) {
      onUpdatePatient(editingPatientId, {
        name: editPatName,
        age: Number(editPatAge),
        gender: editPatGender,
        phone: editPatPhone,
        ailment: editPatAilment,
        status: editPatStatus,
        billDue: Number(editPatBillDue),
        roomBed: editPatRoomBed
      });
      setEditingPatientId(null);
    }
  };

  const handleEditBedSubmit = (e) => {
    e.preventDefault();
    if (editingBedId && onUpdateBed) {
      onUpdateBed(editingBedId, {
        bedNumber: editBedNumber,
        category: editBedCategory,
        status: editBedStatus
      });
      setEditingBedId(null);
    }
  };

  const handleEditInvoiceSubmit = (e) => {
    e.preventDefault();
    if (editingInvoiceId && onUpdateInvoice) {
      const selectedPat = patients.find(p => p.id === editInvPatientId);
      onUpdateInvoice(editingInvoiceId, {
        subject: editInvSubject,
        patientId: editInvPatientId,
        patientName: selectedPat ? selectedPat.name : 'Unknown Patient',
        amount: Number(editInvAmount),
        status: editInvStatus
      });
      setEditingInvoiceId(null);
    }
  };

  const handleEditInventorySubmit = (e) => {
    e.preventDefault();
    if (editingInventoryId && onUpdateInventoryItem) {
      onUpdateInventoryItem(editingInventoryId, {
        name: editInvItemName,
        unit: editInvItemUnit,
        stock: Number(editInvItemStock),
        requiredMin: Number(editInvItemRequiredMin),
        price: Number(editInvItemPrice)
      });
      setEditingInventoryId(null);
    }
  };

  const handleEditLabSubmit = (e) => {
    e.preventDefault();
    if (editingLabId && onUpdateLabOrder) {
      const selectedPat = patients.find(p => p.id === editLabPatientId);
      const selectedDoc = doctors.find(d => d.id === editLabDocId);
      onUpdateLabOrder(editingLabId, {
        testName: editLabTestName,
        patientId: editLabPatientId,
        patientName: selectedPat ? selectedPat.name : 'Unknown Patient',
        doctorId: editLabDocId,
        doctorName: selectedDoc ? selectedDoc.name : 'Unknown Doctor',
        status: editLabStatus,
        urgent: editLabUrgent
      });
      setEditingLabId(null);
    }
  };

  // Live real-time auto-updating chart data states
  const [liveBedsData, setLiveBedsData] = useState([]);
  const [liveInvoicesData, setLiveInvoicesData] = useState([]);

  useEffect(() => {
    setLiveBedsData([
      { name: 'Occupied', value: beds.filter(b => b.status === 'Occupied').length },
      { name: 'Unoccupied', value: beds.filter(b => b.status === 'Unoccupied' || b.status === 'Available').length },
      { name: 'Cleaning', value: beds.filter(b => b.status === 'Cleaning' || b.status === 'Sanitizing').length }
    ]);
  }, [beds]);

  useEffect(() => {
    setLiveInvoicesData([
      { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
      { name: 'Outstanding', value: invoices.filter(i => i.status !== 'Paid').length }
    ]);
  }, [invoices]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBedsData(prev => {
        if (prev.length === 0) return prev;
        return prev.map(item => {
          let jitter = Math.floor((Math.random() - 0.5) * 3);
          let newVal = Math.max(item.value + jitter, 1);
          return { ...item, value: newVal };
        });
      });

      setLiveInvoicesData(prev => {
        if (prev.length === 0) return prev;
        return prev.map(item => {
          let jitter = (Math.random() > 0.6) ? 1 : 0;
          let newVal = Math.max(item.value + jitter, 1);
          return { ...item, value: newVal };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Filter States
  const [bedsFilterStatus, setBedsFilterStatus] = useState('All');
  const [staffDocFilterText, setStaffDocFilterText] = useState('');
  const [staffDocFilterSpecialty, setStaffDocFilterSpecialty] = useState('All');
  const [staffPatFilterText, setStaffPatFilterText] = useState('');
  const [staffPatFilterStatus, setStaffPatFilterStatus] = useState('All');
  const [inventoryFilterText, setInventoryFilterText] = useState('');
  const [inventoryFilterCategory, setInventoryFilterCategory] = useState('All');
  const [billingFilterStatus, setBillingFilterStatus] = useState('All');
  const [billingFilterText, setBillingFilterText] = useState('');
  const [labsFilterStatus, setLabsFilterStatus] = useState('All');
  const [labsFilterText, setLabsFilterText] = useState('');

  // Local ticker to drive real-time counter updates on screen in real-time
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (endsAt) => {
    const diff = endsAt - Date.now();
    if (diff <= 0) return "Expired";
    const secs = Math.floor(diff / 1000);
    const d = Math.floor(secs / (24 * 3600));
    const h = Math.floor((secs % (24 * 3600)) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    if (d > 0) {
      return `${d}d ${h}h ${m}m ${s}s`;
    }
    return `${h}h ${m}m ${s}s`;
  };

  // Doctor Form Modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Cardiology');
  const [docContact, setDocContact] = useState('');
  const [docAvailability, setDocAvailability] = useState('On Duty');
  const [docProfession, setDocProfession] = useState('doctor'); // 'doctor' | 'nurse' | 'staff'
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');

  // Patient Form Modal & Admit State
  const [showPatModal, setShowPatModal] = useState(false);
  const [patName, setPatName] = useState('');
  const [patAge, setPatAge] = useState(30);
  const [patGender, setPatGender] = useState('Male');
  const [patBlood, setPatBlood] = useState('O+');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patAddress, setPatAddress] = useState('');
  const [patDocId, setPatDocId] = useState('');

  // Invoice generator state
  const [invoicePatientId, setInvoicePatientId] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('General Consultation Service');
  const [invoiceCost, setInvoiceCost] = useState(150);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  // Bed Triage Form state
  const [selectedBedToTriage, setSelectedBedToTriage] = useState(null);
  const [triagePatientId, setTriagePatientId] = useState('');
  const [triageTimer, setTriageTimer] = useState('');
  const [selectedMode, setSelectedMode] = useState('Unoccupied');

  useEffect(() => {
    if (selectedBedToTriage) {
      let status = selectedBedToTriage.status || 'Unoccupied';
      if (status === 'Available') status = 'Unoccupied';
      setSelectedMode(status);
      setTriagePatientId(selectedBedToTriage.patientId || '');
      setTriageTimer(selectedBedToTriage.timerDuration || '');
    } else {
      setSelectedMode('Unoccupied');
      setTriagePatientId('');
      setTriageTimer('');
    }
  }, [selectedBedToTriage]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Bed & Ward addition and ward mapper states
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedWard, setNewBedWard] = useState('ICU Unit 1');
  const [newBedStatus, setNewBedStatus] = useState('Unoccupied');

  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [newWardName, setNewWardName] = useState('');
  const [selectedWardForFilter, setSelectedWardForFilter] = useState('All');

  // Active statistics calculated locally
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
  const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleAddNewBed = (e) => {
    e.preventDefault();
    if (!newBedNumber || !newBedWard) return;
    if (onAddBed) {
      onAddBed({
        bedNumber: newBedNumber.trim(),
        wardName: newBedWard.trim(),
        status: newBedStatus
      });
    }
    setNewBedNumber('');
    setShowAddBedModal(false);
  };

  const handleAddNewWard = (e) => {
    e.preventDefault();
    if (!newWardName) return;
    if (onAddBed) {
      onAddBed({
        bedNumber: 'Bed 101',
        wardName: newWardName.trim(),
        status: 'Unoccupied'
      });
    }
    setNewWardName('');
    setShowAddWardModal(false);
  };

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (!docName || !docContact || !docEmail || !docPassword) return;
    onAddDoctor({
      branchId: branch.id,
      name: docName,
      specialty: docProfession === 'doctor' ? docSpecialty : (docProfession === 'nurse' ? 'Nursing Care' : 'Administrative Support'),
      contact: docContact,
      phone: docContact,
      availability: docAvailability,
      profession: docProfession,
      email: docEmail.trim().toLowerCase(),
      password: docPassword
    });
    setDocName('');
    setDocContact('');
    setDocEmail('');
    setDocPassword('');
    setDocProfession('doctor');
    setShowDocModal(false);
  };

  const handlePatSubmit = (e) => {
    e.preventDefault();
    if (!patName || !patPhone) return;
    onAddPatient({
      branchId: branch.id,
      name: patName,
      age: patAge,
      gender: patGender,
      bloodGroup: patBlood,
      phone: patPhone,
      email: patEmail || `${patName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: patAddress,
      status: 'Inpatient',
      assignedDoctorId: patDocId || undefined
    });
    setPatName('');
    setPatPhone('');
    setPatEmail('');
    setPatAddress('');
    setPatDocId('');
    setShowPatModal(false);
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!invoicePatientId) return;
    const pat = patients.find(p => p.id === invoicePatientId);
    if (!pat) return;
    onAddInvoice(pat.id, pat.name, invoiceDescription, Number(invoiceCost));
    setInvoiceSuccess(true);
    setTimeout(() => setInvoiceSuccess(false), 2500);
  };

  const handleTriageSubmit = (e) => {
    e.preventDefault();
    if (!selectedBedToTriage) return;
    
    if (selectedMode === 'Occupied') {
      if (!triagePatientId || !triageTimer) return;
      const pat = patients.find(p => p.id === triagePatientId);
      if (pat) {
        onUpdateBedStatus(selectedBedToTriage.id, 'Occupied', pat.id, pat.name);
        onSetBedTimer(selectedBedToTriage.id, triageTimer);
      }
    } else {
      onUpdateBedStatus(selectedBedToTriage.id, selectedMode);
    }
    setSelectedBedToTriage(null);
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Branch Administrator Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-slate-900 text-blue-400 rounded-md">
              Facility Branch Control
            </span>
            {activeSubscription && (
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1 shadow-3xs animate-fade-in">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Subscription: {activeSubscription.name}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mt-1.5">{hospitalName || branch.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tactical hospital operations: Bed lifecycle, diagnostic lab tracking, HR directories, and invoicing control.</p>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPatModal(true)}
            id="btn-register-patient"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-55 transition-colors rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Admit Patient
          </button>
          <button
            onClick={() => setShowDocModal(true)}
            id="btn-add-staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enroll Doctor/Nurse/Staff
          </button>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Admitted Patients</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {patients.filter(p => p.status === 'Inpatient').length}
          </div>
          <p className="text-[10px] text-slate-550 mt-1">Currently assigned to clinical beds</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">On-Duty Doctors</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {doctors.filter(d => d.availability === 'On Duty' || d.availability === 'Emergency').length}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Staff roster optimized</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bed Occupancy Rate</span>
            <Bed className="w-5 h-5 text-teal-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {beds.length > 0 ? Math.round((beds.filter(b => b.status === 'Occupied').length / beds.length) * 100) : 0}%
          </div>
          <p className="text-[10px] text-slate-555 mt-1">{beds.filter(b => b.status === 'Unoccupied').length} beds ready for immediate triage</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Outstanding Revenue</span>
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-605">
            ${totalOutstanding.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-555 mt-1">From {unpaidInvoices.length} pending branch invoices</p>
        </div>
      </div>

      {/* Real-time branch metrics visual dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-55 p-5 rounded-2xl border border-slate-200/80">
        {/* Bed Status Distribution */}
        <div className="bg-white p-5 border border-slate-150 rounded-xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Live Bed Allocation Status</h4>
              <p className="text-[10px] text-slate-500">Real-time status tracking of all clinical ward beds</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 border border-teal-200 rounded text-[9px] font-bold text-teal-700 uppercase font-mono">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liveBedsData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {[
                    { name: 'Occupied', color: '#ef4444' },
                    { name: 'Unoccupied', color: '#10b981' },
                    { name: 'Cleaning', color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">
                {liveBedsData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-[9px] uppercase font-mono text-slate-455 font-bold">Total Beds</span>
            </div>
          </div>

          <div className="flex justify-around text-[10px] font-bold text-slate-600 px-2 mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Occupied ({liveBedsData.find(i => i.name === 'Occupied')?.value || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Unoccupied ({liveBedsData.find(i => i.name === 'Unoccupied')?.value || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Cleaning ({liveBedsData.find(i => i.name === 'Cleaning')?.value || 0})</span>
            </div>
          </div>
        </div>

        {/* Ledger Invoices Pie chart */}
        <div className="bg-white p-5 border border-slate-150 rounded-xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Client Invoices Settlement Ratio</h4>
              <p className="text-[10px] text-slate-500">SaaS outstanding receivables versus reconciled collections</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px] font-bold text-blue-700 uppercase font-mono">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
              Auto Updates
            </span>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liveInvoicesData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {[
                    { name: 'Paid', color: '#10b981' },
                    { name: 'Outstanding', color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">
                {liveInvoicesData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-[9px] uppercase font-mono text-slate-455 font-bold">Invoices</span>
            </div>
          </div>

          <div className="flex justify-around text-[10px] font-bold text-slate-600 px-2 mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Paid ({liveInvoicesData.find(i => i.name === 'Paid')?.value || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Outstanding ({liveInvoicesData.find(i => i.name === 'Outstanding')?.value || 0})</span>
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
              {!isNavCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Branch Operations</span>}
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
                { id: 'beds', label: 'Ward Mapper & Beds', badge: beds.filter(b => b.status === 'Unoccupied').length, icon: Bed, badgeColor: 'bg-emerald-600' },
                { id: 'staff', label: 'Staff & Patients', badge: doctors.length + patients.length, icon: Users },
                { id: 'inventory', label: 'Drug Inventory', badge: inventoryItems.filter(i => i.stockLevel < i.criticalThreshold).length, icon: Layers, badgeColor: 'bg-amber-600 font-bold' },
                { id: 'billing', label: 'Invoicing & Ledgers', icon: CreditCard },
                { id: 'labs', label: 'Labs Workload Queue', badge: labOrders.filter(o => o.status === 'In Progress').length, icon: TrendingUp },
                { id: 'emergency_ot', label: 'ER & Operative Suites', icon: ShieldAlert },
                { id: 'specialized_ops', label: 'Specialized Operations', icon: Heart },
                { id: 'hospitality', label: 'Hospital Services', icon: Home }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 text-white font-bold border-l-4 border-blue-500 pl-1.5' 
                        : 'text-slate-400 hover:text-slate-205 hover:bg-slate-850'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
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
          {activeSubTab === 'beds' && (() => {
            const wardNames = Array.from(new Set(beds.map(b => b.wardName))).filter(Boolean);
            const filteredBeds = beds.filter(b => {
              const matchesStatus = bedsFilterStatus === 'All' || b.status === bedsFilterStatus;
              const matchesWard = selectedWardForFilter === 'All' || b.wardName === selectedWardForFilter;
              return matchesStatus && matchesWard;
            });

            return (
              <div className="space-y-6 animate-fade-in text-sans">
                {/* 1. INTERACTIVE WARD MAPPER (CIRCULAR SQUARE STYLE) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Interactive Ward Mapper Explorer
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Select a ward card to isolate specific bed assignments. Newly added wards show up automatically.
                      </p>
                    </div>
                    {selectedWardForFilter !== 'All' && (
                      <button
                        onClick={() => setSelectedWardForFilter('All')}
                        className="text-xs text-blue-650 hover:text-blue-800 font-bold underline"
                      >
                        Reset Isolation
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {/* Wards Rendered as Perfect Circular Squares */}
                    {wardNames.map((wardName) => {
                      const wardBeds = beds.filter(b => b.wardName === wardName);
                      const isSelected = selectedWardForFilter === wardName;
                      const occupiedCount = wardBeds.filter(wb => wb.status === 'Occupied').length;
                      const sanitationCount = wardBeds.filter(wb => wb.status === 'Sanitation').length;
                      const emptyCount = wardBeds.length - occupiedCount - sanitationCount;

                      return (
                        <div
                          key={wardName}
                          onClick={() => setSelectedWardForFilter(isSelected ? 'All' : wardName)}
                          className={`w-full aspect-square border-2 transition-all duration-200 p-5 rounded-[2rem] flex flex-col justify-between shadow-3xs cursor-pointer hover:shadow-xs group relative ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/20 text-blue-955 font-bold ring-2 ring-blue-500/20' 
                              : 'border-slate-205 bg-white hover:border-slate-350'
                          }`}
                        >
                          {/* Card Header inside Ward Circular Square */}
                          <div className="flex justify-between items-center">
                            <span className="p-1.5 bg-slate-50 rounded-xl text-slate-500 flex items-center justify-center">
                              <Layers className="w-3.5 h-3.5" />
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 tracking-wide rounded-full font-mono">
                              {wardBeds.length} Beds
                            </span>
                          </div>

                          {/* Card Core Middle info */}
                          <div className="my-auto">
                            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-650 transition-colors">
                              {wardName}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-medium uppercase font-mono tracking-widest block mt-0.5">
                              Ward Unit Mapping
                            </span>
                          </div>

                          {/* Card Status Stats */}
                          <div className="space-y-1.5">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                              {occupiedCount > 0 && <span className="bg-rose-500 h-full inline-block" style={{ width: `${(occupiedCount / wardBeds.length) * 100}%` }} />}
                              {sanitationCount > 0 && <span className="bg-amber-400 h-full inline-block" style={{ width: `${(sanitationCount / wardBeds.length) * 100}%` }} />}
                              {emptyCount > 0 && <span className="bg-emerald-500 h-full inline-block" style={{ width: `${(emptyCount / wardBeds.length) * 100}%` }} />}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-550 font-semibold font-mono">
                              <span className="text-rose-600 font-bold">{occupiedCount} Occ</span>
                              <span className="text-emerald-600 font-bold">{emptyCount} Rdy</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Create New Ward Circular Square Card Option */}
                    <div
                      onClick={() => setShowAddWardModal(true)}
                      className="w-full aspect-square border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-slate-50/50 rounded-[2rem] p-5 flex flex-col items-center justify-center transition-all cursor-pointer text-center group text-slate-500 text-xs font-bold font-sans"
                    >
                      <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-650 transition-colors duration-200" />
                      <span className="text-xs font-bold text-slate-700 tracking-tight mt-1.5 block">Create Ward</span>
                      <p className="text-[10px] text-slate-400 font-normal max-w-[120px] mx-auto mt-0.5 leading-normal">Setup custom diagnostic & care wards</p>
                    </div>
                  </div>
                </div>

                {/* 2. ACTIONS AND BEDS GRID */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5 gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Bed Slots System Details</h3>
                      <p className="text-xs text-slate-550">
                        Showing {filteredBeds.length} bed slots in {selectedWardForFilter === 'All' ? 'all' : selectedWardForFilter} ward category.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={bedsFilterStatus}
                        onChange={(e) => setBedsFilterStatus(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-305 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="All">All statuses ({beds.length})</option>
                        <option value="Occupied">Occupied ({beds.filter(b => b.status === 'Occupied').length})</option>
                        <option value="Sanitation">Sanitation Loop ({beds.filter(b => b.status === 'Sanitation').length})</option>
                        <option value="Unoccupied">Unoccupied Ready ({beds.filter(b => b.status === 'Unoccupied').length})</option>
                      </select>

                      <button
                        onClick={() => setShowAddBedModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-3xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Configure Bed Slot
                      </button>
                    </div>
                  </div>

                  {/* Bed Color Codes Header bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-slate-700">
                      <span className="font-semibold text-slate-855">Bed Color Codes:</span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-655 font-medium">
                        <span className="w-3 h-3 bg-rose-500 rounded-lg inline-block" /> Occupied
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-655 font-medium">
                        <span className="w-3 h-3 bg-amber-400 rounded-lg inline-block" /> Sanitation Loop
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-655 font-medium">
                        <span className="w-3 h-3 bg-emerald-500 rounded-lg inline-block" /> Unoccupied Ready
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Total Ward Capacity Managed: {beds.length} Slots</span>
                  </div>

                  {/* Beds grid rendered as Circular Squares */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredBeds.map((bed) => {
                    const bStatus = bed.status;
                    const cardBg = 
                      bStatus === 'Occupied' ? 'bg-rose-50/70 border-rose-200 animate-slide-up' :
                      bStatus === 'Sanitation' ? 'bg-amber-50/70 border-amber-200' :
                      'bg-emerald-50/70 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                    const dotBg = 
                      bStatus === 'Occupied' ? 'bg-rose-500' :
                      bStatus === 'Sanitation' ? 'bg-amber-400' :
                      'bg-emerald-500';

                    return (
                      <div 
                        key={bed.id} 
                        className={`p-5 border-2 rounded-[2rem] aspect-square shadow-3xs transition-transform duration-200 hover:scale-[1.03] ${cardBg} cursor-pointer group relative flex flex-col justify-between`}
                        onClick={() => setSelectedBedToTriage(bed)}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="p-1.5 bg-white/80 rounded-xl text-slate-700 shadow-3xs flex items-center justify-center">
                              <Bed className="w-4 h-4" />
                            </span>
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingBedId(bed.id);
                                  setEditBedNumber(bed.bedNumber);
                                  setEditBedCategory(bed.category || 'General');
                                  setEditBedStatus(bed.status);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-650 rounded bg-white/60 hover:bg-white shadow-3xs cursor-pointer"
                                title="Edit Bed Configuration"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (onDeleteBed) onDeleteBed(bed.id);
                                }}
                                className="p-1 text-rose-500 hover:text-white rounded bg-white/60 hover:bg-rose-500 shadow-3xs cursor-pointer"
                                title="Delete Bed Slot"
                              >
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                              <span className={`w-2 h-2 rounded-full ${dotBg}`} />
                            </div>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-sm mt-3">{bed.bedNumber}</h3>
                          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono mt-0.5 truncate" title={bed.wardName}>
                            {bed.wardName}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-sans">
                            {bStatus === 'Occupied' ? (
                              <div>
                                <span className="text-slate-450 text-[9px] block">Patient Assigned:</span>
                                <span className="font-bold text-rose-900 truncate block mt-0.5">{bed.patientName}</span>
                              </div>
                            ) : bStatus === 'Sanitation' ? (
                              <span className="text-amber-800 font-bold text-[10px] block italic">Sterilizing Ward...</span>
                            ) : (
                              <div>
                                <span className="text-emerald-800 font-extrabold text-[10px] block">💤 Unoccupied Bed</span>
                                <span className="text-emerald-600 text-[9px] block font-semibold mt-0.5">Ready for allocation</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Operational Release Timer Controls inside card */}
                        {bStatus === 'Occupied' && (
                          <div className="mt-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                            {bed.timerEndsAt ? (
                              <div className="space-y-1">
                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest block font-mono">Release Timer:</span>
                                <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-1 py-0.5 rounded-md">
                                  <span className="truncate">⏳ {formatTimeRemaining(bed.timerEndsAt)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Set Release:</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onSetBedTimer(bed.id, '3_days')}
                                    className="flex-1 text-[8px] font-bold bg-white text-slate-655 border border-slate-205 hover:bg-slate-50 hover:text-indigo-605 hover:border-indigo-250 py-0.5 rounded transition-all cursor-pointer text-center"
                                    title="Set release countdown of 3 days"
                                  >
                                    3D
                                  </button>
                                  <button
                                    onClick={() => onSetBedTimer(bed.id, '5_days')}
                                    className="flex-1 text-[8px] font-bold bg-white text-slate-655 border border-slate-205 hover:bg-slate-50 hover:text-indigo-605 hover:border-indigo-250 py-0.5 rounded transition-all cursor-pointer text-center"
                                    title="Set release countdown of 5 days"
                                  >
                                    5D
                                  </button>
                                  <button
                                    onClick={() => onSetBedTimer(bed.id, '1_week')}
                                    className="flex-1 text-[8px] font-bold bg-white text-slate-655 border border-slate-205 hover:bg-slate-50 hover:text-indigo-605 hover:border-indigo-250 py-0.5 rounded transition-all cursor-pointer text-center"
                                    title="Set release countdown of 1 week"
                                  >
                                    1W
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredBeds.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-[2rem] border border-slate-200 text-slate-400 text-xs shadow-3xs">
                      No beds match active status or ward explorer isolation filters. Click a ward card above to toggle view.
                    </div>
                  )}
                  </div>
                </div>
              </div>
            );
          })()}
       {activeSubTab === 'staff' && (() => {
        const docSpecialties = Array.from(new Set(doctors.map(d => d.specialty)));
        
        const filteredDocs = doctors.filter(doc => {
          const matchesText = doc.name.toLowerCase().includes(staffDocFilterText.toLowerCase()) || 
                             doc.specialty.toLowerCase().includes(staffDocFilterText.toLowerCase());
          const matchesSpecialty = staffDocFilterSpecialty === 'All' || doc.specialty === staffDocFilterSpecialty;
          return matchesText && matchesSpecialty;
        });

        const filteredPats = patients.filter(pat => {
          const matchesText = pat.name.toLowerCase().includes(staffPatFilterText.toLowerCase()) || 
                             pat.phone.includes(staffPatFilterText);
          const matchesStatus = staffPatFilterStatus === 'All' || pat.status === staffPatFilterStatus;
          return matchesText && matchesStatus;
        });

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical practitioners */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Enrolled Branch Doctors</span>
                <button 
                  onClick={() => setShowDocModal(true)}
                  className="px-2.5 py-1 text-xs text-white bg-slate-900 font-medium rounded-lg cursor-pointer hover:bg-slate-800"
                >
                  + Register New Dr
                </button>
              </div>

              {/* Doctors Filter bar */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row gap-2 items-center text-xs">
                <div className="relative w-full sm:w-1/2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search doctor..."
                    value={staffDocFilterText}
                    onChange={(e) => setStaffDocFilterText(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={staffDocFilterSpecialty}
                  onChange={(e) => setStaffDocFilterSpecialty(e.target.value)}
                  className="w-full sm:w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Specialties</option>
                  {docSpecialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {(staffDocFilterText !== '' || staffDocFilterSpecialty !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setStaffDocFilterText(''); setStaffDocFilterSpecialty('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-850">{doc.name}</h3>
                        {doc.profession && (
                          <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-md ${
                            doc.profession === 'doctor' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            doc.profession === 'nurse' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {doc.profession}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{doc.specialty} • {doc.contact}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        doc.availability === 'On Duty' ? 'bg-emerald-100 text-emerald-800' :
                        doc.availability === 'Emergency' ? 'bg-rose-105 text-rose-800' :
                        'bg-slate-100 text-slate-650'
                      }`}>
                        {doc.availability}
                      </span>
                      <span className="text-xs font-bold text-slate-600">★ {(doc.rating || 4.5).toFixed(1)}</span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDoctorId(doc.id);
                            setEditDocName(doc.name);
                            setEditDocSpecialty(doc.specialty);
                            setEditDocPhone(doc.phone || doc.contact || '');
                            setEditDocAvailability(doc.availability);
                            setEditDocEmail(doc.email || '');
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 cursor-pointer"
                          title="Edit practitioner"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteDoctor) onDeleteDoctor(doc.id);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-rose-500 cursor-pointer"
                          title="Delete practitioner"
                        >
                          <Plus className="w-3.5 h-3.5 rotate-45" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDocs.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No doctor matches the query.
                  </div>
                )}
              </div>
            </div>

            {/* Central Patients register roster */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Patient Roster</span>
                <button
                  onClick={() => setShowPatModal(true)}
                  className="px-2.5 py-1 text-xs text-white bg-blue-600 font-medium rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  + Admit Patient
                </button>
              </div>

              {/* Patients Filter bar */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row gap-2 items-center text-xs">
                <div className="relative w-full sm:w-1/2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name/phone..."
                    value={staffPatFilterText}
                    onChange={(e) => setStaffPatFilterText(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={staffPatFilterStatus}
                  onChange={(e) => setStaffPatFilterStatus(e.target.value)}
                  className="w-full sm:w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Outpatient">Outpatient</option>
                </select>
                {(staffPatFilterText !== '' || staffPatFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setStaffPatFilterText(''); setStaffPatFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-705">
                  <tbody className="divide-y divide-slate-150">
                    {filteredPats.map(pat => (
                      <tr key={pat.id} className="hover:bg-slate-5 group transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{pat.name}</div>
                          <span className="text-[11px] block text-slate-400">{pat.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>{pat.age} yrs • <strong className="text-rose-600">{pat.bloodGroup}</strong></div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            pat.status === 'Inpatient' ? 'bg-indigo-100 text-indigo-850' :
                            pat.status === 'Discharged' ? 'bg-slate-150 text-slate-650' :
                            'bg-amber-100 text-amber-850'
                          }`}>
                            {pat.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {pat.status === 'Inpatient' ? (
                              <button
                                onClick={() => onDischargePatient(pat.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md border border-rose-200 cursor-pointer transition-all shrink-0"
                              >
                                Discharge Form
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">Inactive</span>
                            )}

                            <button
                              onClick={() => {
                                setEditingPatientId(pat.id);
                                setEditPatName(pat.name);
                                setEditPatAge(pat.age || '');
                                setEditPatGender(pat.gender || 'Male');
                                setEditPatPhone(pat.phone || '');
                                setEditPatAilment(pat.ailment || '');
                                setEditPatStatus(pat.status);
                                setEditPatBillDue(pat.billDue?.toString() || '0');
                                setEditPatRoomBed(pat.roomBed || '');
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-650 cursor-pointer shrink-0"
                              title="Edit patient registry"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (onDeletePatient) onDeletePatient(pat.id);
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer shrink-0"
                              title="Delete patient file"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPats.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                          No patient record matches your current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {activeSubTab === 'inventory' && (() => {
        const inventoryCategories = Array.from(new Set(inventoryItems.map(item => item.category)));

        const filteredInventory = inventoryItems.filter(item => {
          const matchesText = item.name.toLowerCase().includes(inventoryFilterText.toLowerCase()) || 
                             item.dosage.toLowerCase().includes(inventoryFilterText.toLowerCase());
          const matchesCategory = inventoryFilterCategory === 'All' || item.category === inventoryFilterCategory;
          return matchesText && matchesCategory;
        });

        return (
          <div className="space-y-4 animate-fade-in">
            {/* Pharmacy Alerts and Live Stock Count indicator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-650 uppercase block">Active Formula Stocks</span>
                <strong className="text-2xl font-bold font-mono text-slate-850 mt-1 block">
                  {inventoryItems.length} formulations
                </strong>
                <p className="text-[10px] text-slate-500 mt-1">Isolating clinical stocks assigned to this branch location</p>
              </div>

              <div className="p-4 bg-white border border-rose-250 rounded-xl">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase block">Critical low Warnings</span>
                <strong className="text-2xl font-bold font-mono text-rose-650 mt-1 block">
                  {inventoryItems.filter(item => item.quantity <= item.minQuantity).length} formulations
                </strong>
                <p className="text-[10px] text-rose-500 mt-1">Quantities currently beneath designated threshold parameters</p>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-150 rounded-xl">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-705 uppercase block">Dispatched items today</span>
                <strong className="text-2xl font-bold font-mono text-indigo-855 mt-1 block">42 units</strong>
                <p className="text-[10px] text-indigo-700 mt-1 font-sans">Synced with Nurse Medication administration logs</p>
              </div>
            </div>

            {/* Core Inventory items ledger list */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Pharmacy Inventory Stock</span>
                  <p className="text-[10px] text-slate-550 font-mono mt-0.5">Manage pharmacy inventory stock levels.</p>
                </div>

                {/* Filter bar built-in */}
                <div className="flex flex-wrap gap-2 text-xs items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search dosage/name..."
                      value={inventoryFilterText}
                      onChange={(e) => setInventoryFilterText(e.target.value)}
                      className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <select
                    value={inventoryFilterCategory}
                    onChange={(e) => setInventoryFilterCategory(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    {inventoryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {(inventoryFilterText !== '' || inventoryFilterCategory !== 'All') && (
                    <button
                      type="button"
                      onClick={() => { setInventoryFilterText(''); setInventoryFilterCategory('All'); }}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-705">
                <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left">Clinical Medicine & Dosage</th>
                    <th className="px-5 py-3 text-left">Category Class</th>
                    <th className="px-5 py-3 text-center">Stock Level Status</th>
                    <th className="px-5 py-3 text-center">Remaining Quantity</th>
                    <th className="px-5 py-3 text-right">Procurement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredInventory.map(item => {
                    const isLow = item.quantity <= item.minQuantity;
                    const pct = Math.min(100, (item.quantity / (item.minQuantity * 2.5)) * 100);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5">
                          <div>
                            <strong className="text-slate-900 block font-bold text-[13px]">{item.name}</strong>
                            <span className="text-[10px] text-slate-450 font-mono block">Concentration: {item.dosage}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="max-w-[120px] mx-auto">
                            <div className="flex justify-between text-[9px] mb-1 font-mono">
                              <span className={isLow ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                                {isLow ? "LOW STOCK" : "ADEQUATE"}
                              </span>
                              <span>{Math.round(pct)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <strong className={`font-mono text-xs ${isLow ? 'text-rose-605 font-bold' : 'text-slate-805'}`}>
                            {item.quantity} {item.unit}
                          </strong>
                          <span className="text-[10px] text-slate-455 font-mono block">Min trigger: {item.minQuantity}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => onRestockMedicine(item.id, 50)}
                              className="bg-indigo-50 border border-indigo-200 text-indigo-705 lg:inline-block hover:bg-indigo-100 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              +50 Restock
                            </button>
                            <button
                              onClick={() => onRestockMedicine(item.id, 100)}
                              className="bg-slate-900 border border-slate-750 text-white lg:inline-block hover:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              +100 Restock
                            </button>

                            <button
                              onClick={() => {
                                setEditingInventoryId(item.id);
                                setEditInvItemName(item.name);
                                setEditInvItemUnit(item.unit || 'Vials');
                                setEditInvItemStock(item.quantity || item.stock || 0);
                                setEditInvItemRequiredMin(item.minQuantity || item.requiredMin || 0);
                                setEditInvItemPrice(item.price || 0);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-650 cursor-pointer"
                              title="Update stock parameters"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (onDeleteInventoryItem) onDeleteInventoryItem(item.id);
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                              title="Delete formulation"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-xs font-sans">
                        No medical formulations match your search parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

      {activeSubTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billing Engine Invoice Form (ColSpan 1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-850 pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Automated Inbound Billing Portal
            </h3>

            <form onSubmit={handleInvoiceSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Target Account Patient</label>
                <select
                  required
                  value={invoicePatientId}
                  onChange={(e) => setInvoicePatientId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium"
                >
                  <option value="">-- Choose Patient Case File --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Service item Classification</label>
                <select
                  value={invoiceDescription}
                  onChange={(e) => {
                    setInvoiceDescription(e.target.value);
                    if (e.target.value.includes('Contrast Head MRI')) setInvoiceCost(1450);
                    else if (e.target.value.includes('Ventilation')) setInvoiceCost(2500);
                    else if (e.target.value.includes('X-Ray')) setInvoiceCost(180);
                    else setInvoiceCost(150);
                  }}
                  className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium"
                >
                  <option value="General Specialist Consultation">General Specialist Consultation ($150)</option>
                  <option value="Contrast Head MRI Scan Diagnostic Charge">Contrast Head MRI Scan ($1450)</option>
                  <option value="Daily ICU Ventilation Life Support Bed">Daily ICU Ventilation Support ($2500)</option>
                  <option value="Chest Radiology X-Ray scan Diagnostics">Chest Radiology X-Ray ($180)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Custom Base Amount ($)</label>
                <input
                  type="number"
                  required
                  value={invoiceCost}
                  onChange={(e) => setInvoiceCost(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Generate Compliant Invoice
                </button>

                {invoiceSuccess && (
                  <div className="mt-2 text-center text-xs text-emerald-600 font-bold">
                    ✔ Invoice generated, logged, and synced!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Reconciliation table (ColSpan 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="text-xs font-bold text-slate-855 uppercase tracking-widest">Billing Invoices</span>
              
              {/* Invoices Filter bar */}
              <div className="flex flex-wrap gap-2 text-xs items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search patient/ref..."
                    value={billingFilterText}
                    onChange={(e) => setBillingFilterText(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={billingFilterStatus}
                  onChange={(e) => setBillingFilterStatus(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Pending">Pending</option>
                </select>
                {(billingFilterText !== '' || billingFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setBillingFilterText(''); setBillingFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left">Invoice Ref</th>
                    <th className="px-4 py-2 text-left">Recipient</th>
                    <th className="px-4 py-2 text-right">Amount Due</th>
                    <th className="px-4 py-2 text-center">Payment Status</th>
                    <th className="px-4 py-2 text-center">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs font-sans">
                  {(() => {
                    const filteredInvoices = invoices.filter(inv => {
                      const matchesText = inv.patientName.toLowerCase().includes(billingFilterText.toLowerCase()) || 
                                         inv.id.toLowerCase().includes(billingFilterText.toLowerCase());
                      const matchesStatus = billingFilterStatus === 'All' || inv.status === billingFilterStatus;
                      return matchesText && matchesStatus;
                    });

                    if (filteredInvoices.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 text-xs font-sans">
                            No invoices matched your filters.
                          </td>
                        </tr>
                      );
                    }

                    return filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-600">{inv.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{inv.patientName}</div>
                          <span className="text-[10px] text-slate-400 block">{inv.date}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">${inv.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-sm font-semibold ${
                            inv.status === 'Paid' ? 'bg-emerald-55 text-emerald-805 border border-emerald-250' :
                            inv.status === 'Unpaid' ? 'bg-rose-50 text-rose-705 border border-rose-200' :
                            'bg-amber-50 text-amber-805 border border-amber-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1 border border-slate-200 p-0.5 rounded bg-slate-50 shrink-0">
                              {['Paid', 'Unpaid', 'Pending'].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => onReconcileInvoice(inv.id, st)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                                    inv.status === st
                                      ? 'bg-slate-900 text-teal-300'
                                      : 'bg-slate-100 text-slate-550 hover:bg-slate-205'
                                  }`}
                                >
                                  {st[0]}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                setEditingInvoiceId(inv.id);
                                setEditInvSubject(inv.subject || 'Medical Triage Invoice');
                                setEditInvPatientId(inv.patientId || '');
                                setEditInvAmount((inv.totalAmount || inv.amount || 0).toString());
                                setEditInvStatus(inv.status);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-650 cursor-pointer shrink-0"
                              title="Update bill details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (onDeleteInvoice) onDeleteInvoice(inv.id);
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer shrink-0"
                              title="Void & Delete invoice"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
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
      )}

      {activeSubTab === 'labs' && (() => {
        const filteredLabs = labOrders.filter(order => {
          const matchesText = order.patientName.toLowerCase().includes(labsFilterText.toLowerCase()) || 
                             order.testName.toLowerCase().includes(labsFilterText.toLowerCase()) ||
                             order.id.toLowerCase().includes(labsFilterText.toLowerCase());
          const matchesStatus = labsFilterStatus === 'All' || order.status === labsFilterStatus;
          return matchesText && matchesStatus;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-855 uppercase tracking-widest">Laboratory Workload Queue</span>
                <p className="text-[11px] text-slate-550 mt-0.5">Manage lab test orders and completion status.</p>
              </div>
              
              {/* Lab Filter bar */}
              <div className="flex flex-wrap gap-2 text-xs items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder="Search test/patient..."
                    value={labsFilterText}
                    onChange={(e) => setLabsFilterText(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={labsFilterStatus}
                  onChange={(e) => setLabsFilterStatus(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                </select>
                {(labsFilterText !== '' || labsFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setLabsFilterText(''); setLabsFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-150">
              {filteredLabs.map(order => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{order.testName}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-805 animate-pulse' :
                        'bg-slate-150 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      Patient Reference: <strong className="text-slate-700">{order.patientName}</strong> | Ordered On: {order.orderedDate}
                    </div>
                    {order.result && (
                      <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans text-slate-655 flex items-start gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Diagnostics Report Analysis:</strong> {order.result || "Compiled"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <div className="text-right text-xs font-semibold text-slate-400 font-mono">
                      REF-{order.id}
                    </div>
                    <button
                      onClick={() => {
                        setEditingLabId(order.id);
                        setEditLabTestName(order.testName);
                        setEditLabPatientId(order.patientId || '');
                        setEditLabDocId(order.doctorId || 'doc-1');
                        setEditLabStatus(order.status);
                        setEditLabUrgent(order.urgent || false);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-650 cursor-pointer"
                      title="Edit pathology test order"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (onDeleteLabOrder) onDeleteLabOrder(order.id);
                      }}
                      className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                      title="Delete laboratory order"
                    >
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredLabs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No lab workload queue requests match your current filters.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeSubTab === 'emergency_ot' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Emergency, Triage and OT features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Triage (P1 / P2 / P3) Management */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Casualty & Emergency Triage Desk</h3>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded font-mono uppercase">2 Critical Cases</span>
              </div>
              
              <div className="space-y-2.5">
                {[
                  { name: 'Arjun Sharma', priority: 'P1 (Immediate Critical)', condition: 'Severe Head Injury - MVA', time: '5 mins ago', badge: 'bg-rose-105 text-rose-805 border-rose-250 font-bold animate-pulse' },
                  { name: 'Meera Deshmukh', priority: 'P2 (Urgent)', condition: 'Acute Abdomen / Suspected Appendicitis', time: '14 mins ago', badge: 'bg-amber-100 text-amber-808 border-amber-250 font-semibold' },
                  { name: 'Kushal Patil', priority: 'P3 (Non-Urgent / Stable)', condition: 'Lacerated Left Arm', time: '30 mins ago', badge: 'bg-slate-100 text-slate-705 border-slate-250 font-medium' }
                ].map((tcase, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-900 block font-bold">{tcase.name}</strong>
                      <span className="text-[11px] text-slate-505 block mt-0.5">Presentation: <strong>{tcase.condition}</strong></span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Registered {tcase.time}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] uppercase border rounded-md ${tcase.badge}`}>
                      {tcase.priority}
                    </span>
                  </div>
                ))}
              </div>

              {/* Medico-Legal Cases MLC police logs */}
              <div className="border-t border-slate-150 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase font-mono">Medico-Legal Cases (MLC) Police Registry Log</h4>
                <div className="p-3 bg-slate-950/5 text-slate-707 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[10px] text-slate-450 border-b border-slate-200 pb-1">
                    <span>MLC Code: #ML-2026-081</span>
                    <span className="text-emerald-600 font-bold">✔ Police Station Intimated</span>
                  </div>
                  <strong className="block text-slate-805">Patient: Sandeep Jadhav (Assault trauma case)</strong>
                  <p className="text-[11px] text-slate-505 font-sans">Incident Type: Alleged physical battery at local venue. Attending IO: Offr. R. Thorat, Badge #449-DESK. Copy of Medico-Legal Certificate printed and filed.</p>
                </div>
              </div>
            </div>

            {/* Operating Theatre (OT) Scheduling */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Operating Theatre (OT) Schedules & Procedures</h3>
              </div>
              <div className="space-y-3">
                {[
                  { room: 'OT-01 Suite', surgeon: 'Dr. Vineet Roy', patient: 'Seema Rao (IPD-409)', procedure: 'Emergency Appendectomy', time: '12:30 PM - 01:45 PM', state: 'Occupied' },
                  { room: 'OT-02 Suite', surgeon: 'Dr. Asha Deshpande', patient: 'Rahul Mehta (IPD-302)', procedure: 'Open Reduction Ortho Internal Fixation', time: '02:00 PM - 04:30 PM', state: 'Scheduled (Pre-Op)' }
                ].map((ot, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded">
                      <strong className="font-mono text-indigo-700 text-[11px] font-bold">{ot.room}</strong>
                      <span className={`px-2 py-0.2 text-[9px] font-bold rounded ${ot.state === 'Occupied' ? 'bg-rose-100 text-rose-805' : 'bg-blue-105 text-blue-805'}`}>{ot.state}</span>
                    </div>
                    <div className="text-slate-650 font-sans mt-0.5">
                      <span className="block font-bold">Patient: <strong className="text-slate-800">{ot.patient}</strong></span>
                      <span className="block">Assigned Specialist: <strong className="text-slate-805">{ot.surgeon}</strong></span>
                      <span className="block">Procedure: <strong className="text-slate-707">{ot.procedure}</strong></span>
                      <span className="block font-mono text-[10px] text-slate-500 mt-1">⏰ Interval: {ot.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ICU NICU hourly vital checklist logs */}
              <div className="border-t border-slate-150 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase font-mono">ICU & NICU Command hourly vitals checklist and ventilators</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 font-sans">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Patient: Master Kabir (NICU Unit 2B)</span>
                    <span className="text-indigo-600">Bed: #04H</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
                    <div className="bg-white p-1 border border-slate-200 rounded">
                      <span>HR</span>
                      <strong className="block text-slate-850">142 bpm</strong>
                    </div>
                    <div className="bg-white p-1 border border-slate-200 rounded">
                      <span>SPO2</span>
                      <strong className="block text-emerald-650">99%</strong>
                    </div>
                    <div className="bg-white p-1 border border-slate-200 rounded">
                      <span>Temp</span>
                      <strong className="block text-slate-850">98.6°F</strong>
                    </div>
                    <div className="bg-white p-1 border border-slate-200 rounded">
                      <span>Ventilator</span>
                      <strong className="block text-indigo-600">SimV Mode</strong>
                    </div>
                  </div>
                  <span className="block text-[10px] text-slate-450 italic font-medium leading-normal">Checked 18 mins ago by Nurse S. Shinde. Fluid input-output: IV infusion 20ml/hr normal saline mapped. Ready for handoff.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'specialized_ops' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Specialized and high level operation units */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Controlled substance narcotics registry log */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Controlled Narcotics substance Registry Log</h3>
              </div>
              <p className="text-[11px] text-slate-505 font-sans">Compliant with FDA Schedules in hospital dispensing locks.</p>
              
              <div className="space-y-2">
                {[
                  { name: 'Morphine Sulphate 10mg/ml', lot: 'LOT-B22', stock: '24 Ampoules', status: 'Secured Lockbook' },
                  { name: 'Fentanyl Ampoules 50mcg', lot: 'LOT-A19', stock: '12 Ampoules', status: 'Secured Lockbook' },
                  { name: 'Ketamine HCl Vial 500mg', lot: 'LOT-K44', stock: '8 Vials', status: 'Double Witness Required' }
                ].map((drug, id) => (
                  <div key={id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-900 block font-bold">{drug.name}</span>
                      <span className="bg-slate-200 font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">{drug.lot}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-505">
                      <span>Locked Balance: <strong>{drug.stock}</strong></span>
                      <span className="text-rose-650 font-semibold">{drug.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blood Bank matching metrics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Blood Bank & Compatibility Donor Registry</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">Facility sharded stock balance index counts.</p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                {['O+ (8 Bags)', 'O- (2 Bags)', 'AB+ (4 Bags)', 'A+ (10 Bags)', 'B+ (6 Bags)', 'B- (3 Bags)'].map((group, id) => {
                  const [grp, qty] = group.split(' ');
                  return (
                    <div key={id} className="p-2 border rounded-lg bg-red-50 border-red-200 text-red-800">
                      <strong className="block text-sm">{grp}</strong>
                      <span className="text-[9px] font-semibold">{qty.replace('(', '').replace(')', '')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Donor records checklist */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-550 mt-1">
                <span className="font-bold block text-slate-805">Incoming Blood Crossmatch Checklist:</span>
                <p className="text-[11px] text-slate-500 font-sans mt-1">Cross-check code patient ID verification, gel agglutination testing validation, and dual-technician badge verification required before transfusion.</p>
              </div>
            </div>

            {/* Mortuary & Death certificate registries */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Mortuary & Death certificate register</h3>
              </div>
              
              <div className="space-y-2.5 text-xs font-sans text-slate-707">
                {[
                  { name: 'Late Shripad Joshi', date: '2026-05-24', certificate: 'CERT-2026-092-D', status: 'Released (Body to Family)' },
                  { name: 'Unknown Body (Trauma)', date: '2026-05-25', certificate: 'Pending Postmortem', status: 'Held in Freezing Node 03' }
                ].map((mcase, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="font-semibold block text-slate-900">{mcase.name}</strong>
                    <div className="flex justify-between text-[11px] mt-0.5">
                      <span>Deceased: <strong>{mcase.date}</strong></span>
                      <span>Code: <strong className="font-mono text-indigo-600">{mcase.certificate}</strong></span>
                    </div>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">{mcase.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'hospitality' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* hospitality, assets, and waste management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Asset Maintenance Breakdowns AMC cycles */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Asset & Biomechanical Equipment AMC Cycles</h3>
              </div>
              <div className="space-y-2 pt-1">
                {[
                  { name: 'MRI Core Scanner 3Tesla (Phillips)', status: 'Operational', calibration: 'AMC Certified Oct 2026', badge: 'bg-emerald-50 text-emerald-805 border-emerald-202' },
                  { name: 'Patient Monitor Pulse-Ox (L&T)', status: 'Repair Needed (Core Alert)', calibration: 'AMC Overdue Since Jan', badge: 'bg-rose-50 text-rose-805 border-rose-220 animate-pulse' }
                ].map((asset, id) => (
                  <div key={id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <strong className="font-bold text-slate-905 block">{asset.name}</strong>
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className={`px-2 py-0.2 border rounded ${asset.badge}`}>{asset.status}</span>
                      <span className="text-slate-455 font-mono font-bold">{asset.calibration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Housekeeping task details Canteen Meals scheduler */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Dietary Canteen Schedules & Laundry</h3>
              </div>
              <div className="space-y-3.5 pt-1 text-xs text-slate-705">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <strong className="block text-slate-850">Daily IPD patients Canteen Diet Checklist</strong>
                  <p className="text-[11px] text-slate-500 font-sans">Diet charts connected instantly to doctor orders. 14 patients assigned diabetic-modified meals; 2 pediatric patients aligned gluten-free.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <strong className="block text-slate-850">Linen Laundry tracking logs</strong>
                  <p className="text-[11px] text-slate-500 font-sans">Standard general ward bedding items count: <strong>42 Dispatched, 30 Sanitized Checked-in</strong>. Heavy ICU safety cycle complete.</p>
                </div>
              </div>
            </div>

            {/* Biomedical Waste management yellow red blue category bag logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 font-sans text-slate-850">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Biomedical Waste tracking Bag logs</h3>
              </div>
              <p className="text-[11px] text-slate-505 font-sans">Compliant with State Pollution Board guidelines.</p>

              <div className="space-y-2">
                {[
                  { tag: 'Yellow Bio-Hazard Bag', content: 'Anatomical Tissue / Lab Cultures', weight: '4.8 kg', style: 'bg-yellow-50 border-yellow-250 text-yellow-805' },
                  { tag: 'Red Contaminated Plastic Bag', content: 'Catheters / Syringes / IV Tubing', weight: '6.2 kg', style: 'bg-red-50 border-red-250 text-red-805' },
                  { tag: 'Blue Glass Sharp Container', content: 'Broken Vials / Needles / Ampoules', weight: '2.1 kg', style: 'bg-blue-50 border-blue-250 text-blue-805' }
                ].map((bag, id) => (
                  <div key={id} className={`p-2.5 border rounded-lg text-xs flex justify-between items-center ${bag.style}`}>
                    <div>
                      <strong className="block font-bold">{bag.tag}</strong>
                      <span className="text-[10px] text-slate-550 font-sans block mt-0.5">{bag.content}</span>
                    </div>
                    <strong className="font-mono text-xs block font-extrabold">{bag.weight}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitor management gate pass registry */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800">
              <div className="border-b border-slate-100 pb-1">
                <h3 className="text-sm font-bold text-slate-800">Visitor Pass Registry Gatekeeper Log</h3>
              </div>
              <div className="space-y-2">
                {[
                  { visitor: 'Prashant Joshi', patient: 'Mrs. S. Joshi (Bed 102)', code: 'PASS-811-Q', area: 'ICU Unit 1 Room (Limited 15m)', state: 'Active inside ward' },
                  { visitor: 'Kiran Sen', patient: 'Vikram Sen (Bed 304)', code: 'PASS-221-A', area: 'General Ward 3D Block (OPD Hours)', state: 'Checked Out' }
                ].map((v, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans">
                    <div>
                      <strong className="text-slate-905 font-bold block">{v.visitor}</strong>
                      <span className="text-[11px] text-slate-505 block mt-0.5">Assigned Target: <strong>{v.patient}</strong> • Restricted Zone: <strong className="text-slate-600">{v.area}</strong></span>
                      <span className="text-[10px] font-mono text-indigo-605 block mt-0.5">Code: {v.code}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${v.state === 'Checked Out' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-202'}`}>
                      {v.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue system Token manager kiosk details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-slate-800 col-span-1">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Queue Token self Check-In kiosk Board</h3>
              </div>
              <p className="text-[11px] text-slate-550 font-sans">Dynamic patient reception queues displaying estimated waiting periods.</p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-805 font-mono">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Current Token</span>
                  <strong className="text-lg block text-indigo-707 font-black pt-0.5">TK-402</strong>
                  <span className="text-[9px] text-slate-455">Dr. Asha OPD</span>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Next Up</span>
                  <strong className="text-lg block text-indigo-707 font-black pt-0.5">TK-403</strong>
                  <span className="text-[9px] text-slate-455">Est Wait: 8 min</span>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Token Queue Load</span>
                  <strong className="text-lg block text-indigo-707 font-black pt-0.5">14 Cases</strong>
                  <span className="text-[9px] text-slate-455">Reception Desk A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Bed selection Triage modal */}
      {selectedBedToTriage && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Manage {selectedBedToTriage.bedNumber} State</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Set room sanitation cycles or align admitted emergency patients directly to available beds.</p>
            </div>

            <form onSubmit={handleTriageSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Bed Allocation Status Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('Sanitation');
                      setTriagePatientId('');
                      setTriageTimer('');
                    }}
                    className={`p-2 text-xs font-semibold rounded-lg border cursor-pointer text-center transition-all ${
                      selectedMode === 'Sanitation' || selectedMode === 'Sanitizing'
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs font-bold'
                        : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Sanitizing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('Unoccupied');
                      setTriagePatientId('');
                      setTriageTimer('');
                    }}
                    className={`p-2 text-xs font-semibold rounded-lg border cursor-pointer text-center transition-all ${
                      selectedMode === 'Unoccupied'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Unoccupied
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('Occupied');
                    }}
                    className={`p-2 text-xs font-semibold rounded-lg border cursor-pointer text-center transition-all ${
                      selectedMode === 'Occupied'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-bold'
                        : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    Occupied
                  </button>
                </div>
              </div>

              {selectedMode === 'Occupied' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Align Admitted Patient (Inpatient)</label>
                    <select
                      value={triagePatientId}
                      onChange={(e) => setTriagePatientId(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium"
                    >
                      <option value="">-- Choose Admitted Patient Case --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Age: {p.age}, {p.bloodGroup})</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Bed Release Countdown Timer</label>
                    <p className="text-[10px] text-slate-500 mb-2">Automate ward release to unoccupied status after choices.</p>
                    
                    {selectedBedToTriage.timerEndsAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-2 text-xs text-blue-805">
                        <span className="block font-bold">Active Countdown Term: {selectedBedToTriage.timerDuration?.replace('_', ' ')}</span>
                        <span className="font-mono text-[9px] text-blue-600">Active Remaining: {formatTimeRemaining(selectedBedToTriage.timerEndsAt)}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTriageTimer('3_days')}
                        className={`p-2 text-xs font-bold rounded-lg border cursor-pointer text-center transition-all ${
                          triageTimer === '3_days'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-100 border-indigo-200 text-indigo-900 hover:bg-indigo-200'
                        }`}
                      >
                        3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setTriageTimer('5_days')}
                        className={`p-2 text-xs font-bold rounded-lg border cursor-pointer text-center transition-all ${
                          triageTimer === '5_days'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-100 border-indigo-200 text-indigo-900 hover:bg-indigo-200'
                        }`}
                      >
                        5 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setTriageTimer('1_week')}
                        className={`p-2 text-xs font-bold rounded-lg border cursor-pointer text-center transition-all ${
                          triageTimer === '1_week'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-100 border-indigo-200 text-indigo-900 hover:bg-indigo-200'
                        }`}
                      >
                        1 Week
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBedToTriage(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={selectedMode === 'Occupied' && (!triagePatientId || !triageTimer)}
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Update Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bed Config Modal */}
      {showAddBedModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Register Facility Bed Slot</h3>
              <p className="text-xs text-slate-500 mt-0.5">Register details to initiate ward maps and status updates.</p>
            </div>

            <form onSubmit={handleAddNewBed} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Bed Identifier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bed 409 or Emergency Unit B"
                  value={newBedNumber}
                  onChange={(e) => setNewBedNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium shadow-3xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Target Ward Location</label>
                <select
                  value={newBedWard}
                  onChange={(e) => setNewBedWard(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium shadow-3xs"
                >
                  {Array.from(new Set(beds.map(b => b.wardName))).filter(Boolean).map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                  <option value="General Ward A">General Ward A</option>
                  <option value="ICU Unit 1">ICU Unit 1</option>
                  <option value="Pediatrics Wing">Pediatrics Wing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Initial Bed Status Color Code</label>
                <select
                  value={newBedStatus}
                  onChange={(e) => setNewBedStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium shadow-3xs"
                >
                  <option value="Unoccupied">Unoccupied (Ready)</option>
                  <option value="Sanitation">Sanitation Loop</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Configure Bed Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ward Config Modal */}
      {showAddWardModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Establish Care & Specialty Ward</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define specialty departments to map beds and operations.</p>
            </div>

            <form onSubmit={handleAddNewWard} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Specialty Ward Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurological ICU, Cardiac Care Wing"
                  value={newWardName}
                  onChange={(e) => setNewWardName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium shadow-3xs"
                />
                <p className="text-[10px] text-slate-450 mt-1">Establishing a new ward generates an initial Bed 101 placeholder.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWardModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Generate Ward Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Enrollment Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Enroll Clinical Staff / Practitioner</h3>
              <p className="text-xs text-slate-555 mt-0.5">Authorizes provider registry, credentials setup, and respective portal login capabilities.</p>
            </div>

            <form onSubmit={handleDocSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Allison Cameron, MD"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Profession</label>
                  <select
                    value={docProfession}
                    onChange={(e) => setDocProfession(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Initial Duty Status</label>
                  <select
                    value={docAvailability}
                    onChange={(e) => setDocAvailability(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-blue-500 rounded-lg font-medium"
                  >
                    <option value="On Duty">On Duty Roster</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>
              </div>

              {docProfession === 'doctor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Area of Specialty</label>
                  <select
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-medium"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diagnostic Medicine">Diagnostics</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Pediatrics Surgery">Pediatrics</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Secure Contact Mobile</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. +1 (555) 019-9231"
                  value={docContact}
                  onChange={(e) => setDocContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="abc@gmail.com"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-doctor-enroll"
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Enroll Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Admission Modal */}
      {showPatModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Inpatient Clinical Registration</h3>
              <p className="text-xs text-slate-550 mt-0.5">Define emergency parameters, vital statistics, and pair immediately with consulting physicians.</p>
            </div>

            <form onSubmit={handlePatSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Patient Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Robert Fulton"
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 focus:outline-hidden rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Age</label>
                  <input
                    required
                    type="number"
                    value={patAge}
                    onChange={(e) => setPatAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Gender</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Blood Group</label>
                  <select
                    value={patBlood}
                    onChange={(e) => setPatBlood(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 rounded-lg"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Phone Contact</label>
                  <input
                    required
                    type="text"
                    placeholder="+1 (555) 402-1209"
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Assigned Physician</label>
                  <select
                    value={patDocId}
                    onChange={(e) => setPatDocId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 focus:border-blue-500 rounded-lg"
                  >
                    <option value="">-- Choose Consulting Dr --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street details, city ZIP code"
                  value={patAddress}
                  onChange={(e) => setPatAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:bg-white rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPatModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-patient-admission"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Admit Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Doctor Edit Modal */}
      {editingDoctorId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Practitioner Details</h3>
              <p className="text-xs text-slate-550 mt-0.5">Change phone records, target specialty clinic focus, or duty status metrics.</p>
            </div>

            <form onSubmit={handleEditDoctorSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Specialist Name</label>
                <input
                  required
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Specialty Department</label>
                <input
                  required
                  type="text"
                  value={editDocSpecialty}
                  onChange={(e) => setEditDocSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Contact Phone</label>
                <input
                  required
                  type="text"
                  value={editDocPhone}
                  onChange={(e) => setEditDocPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Duty Status</label>
                <select
                  value={editDocAvailability}
                  onChange={(e) => setEditDocAvailability(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg font-medium"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1">Register Email</label>
                <input
                  required
                  type="email"
                  value={editDocEmail}
                  onChange={(e) => setEditDocEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-355 rounded-lg text-slate-805"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoctorId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Patient Edit Modal */}
      {editingPatientId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Patient File Registry</h3>
              <p className="text-xs text-slate-550 mt-0.5">Edit patient status, age parameters, or phone credentials.</p>
            </div>

            <form onSubmit={handleEditPatientSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Patient Full Name</label>
                <input
                  required
                  type="text"
                  value={editPatName}
                  onChange={(e) => setEditPatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Age</label>
                  <input
                    required
                    type="number"
                    value={editPatAge}
                    onChange={(e) => setEditPatAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Gender</label>
                  <select
                    value={editPatGender}
                    onChange={(e) => setEditPatGender(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Contact Phone</label>
                <input
                  required
                  type="text"
                  value={editPatPhone}
                  onChange={(e) => setEditPatPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-850"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Diagnosis or Ailment</label>
                <input
                  required
                  type="text"
                  value={editPatAilment}
                  onChange={(e) => setEditPatAilment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider pb-1">Case Status</label>
                  <select
                    value={editPatStatus}
                    onChange={(e) => setEditPatStatus(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg"
                  >
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider pb-1">Unreconciled Due</label>
                  <input
                    required
                    type="number"
                    value={editPatBillDue}
                    onChange={(e) => setEditPatBillDue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPatientId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Bed Edit Modal */}
      {editingBedId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Bed Slot Details</h3>
              <p className="text-xs text-slate-550 mt-0.5">Edit bed numbers, category classification, and operational states.</p>
            </div>

            <form onSubmit={handleEditBedSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Bed Number identifier</label>
                <input
                  required
                  type="text"
                  value={editBedNumber}
                  onChange={(e) => setEditBedNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Category Classification</label>
                <select
                  value={editBedCategory}
                  onChange={(e) => setEditBedCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg"
                >
                  <option value="General">General</option>
                  <option value="Emergency ICU">Emergency ICU</option>
                  <option value="Deluxe Triage ICU">Deluxe Triage ICU</option>
                  <option value="High Dependency HDU">High Dependency HDU</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Initial Status Code</label>
                <select
                  value={editBedStatus}
                  onChange={(e) => setEditBedStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg"
                >
                  <option value="Available">Available Ready</option>
                  <option value="Unoccupied">Unoccupied</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Sanitation">Sanitation Loop</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBedId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Invoice Edit Modal */}
      {editingInvoiceId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Ledger Invoice Details</h3>
              <p className="text-xs text-slate-550 mt-0.5">Re-price amounts, alter target client, or modify subject items.</p>
            </div>

            <form onSubmit={handleEditInvoiceSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Invoice Subject Description</label>
                <input
                  required
                  type="text"
                  value={editInvSubject}
                  onChange={(e) => setEditInvSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1">Align Patient Node</label>
                <select
                  required
                  value={editInvPatientId}
                  onChange={(e) => setEditInvPatientId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg font-bold text-slate-800"
                >
                  <option value="">-- Choose Patient Roster --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone || p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-mono">Total Invoice Amount ($)</label>
                <input
                  required
                  type="number"
                  value={editInvAmount}
                  onChange={(e) => setEditInvAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-sans">Audit status</label>
                <select
                  value={editInvStatus}
                  onChange={(e) => setEditInvStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-355 rounded-lg text-slate-800 font-sans"
                >
                  <option value="Paid">Fully Settled (Paid)</option>
                  <option value="Unpaid">Unpaid / Unreconciled</option>
                  <option value="Pending">Pending Audit Review</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingInvoiceId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Inventory Stock Edit Modal */}
      {editingInventoryId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Drug Formulation Parameters</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Alters safety thresholds and dosage descriptions.</p>
            </div>

            <form onSubmit={handleEditInventorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Medicine Formulation Name</label>
                <input
                  required
                  type="text"
                  value={editInvItemName}
                  onChange={(e) => setEditInvItemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Dosage Units Type</label>
                  <input
                    required
                    type="text"
                    value={editInvItemUnit}
                    onChange={(e) => setEditInvItemUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-mono">Price Per Unit ($)</label>
                  <input
                    required
                    type="number"
                    value={editInvItemPrice}
                    onChange={(e) => setEditInvItemPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-mono">Current Stock</label>
                  <input
                    required
                    type="number"
                    value={editInvItemStock}
                    onChange={(e) => setEditInvItemStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-850 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-mono">Critical Safety Min</label>
                  <input
                    required
                    type="number"
                    value={editInvItemRequiredMin}
                    onChange={(e) => setEditInvItemRequiredMin(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-850 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingInventoryId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Lab Order Edit Modal */}
      {editingLabId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Modify Lab Diagnosis Orders</h3>
              <p className="text-xs text-slate-550 mt-0.5 animate-fade-in font-sans">Edit tests, reassign clinician signatures, or scale diagnostics priority.</p>
            </div>

            <form onSubmit={handleEditLabSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Laboratory Test Name</label>
                <input
                  required
                  type="text"
                  value={editLabTestName}
                  onChange={(e) => setEditLabTestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-sans">Align Patient Node</label>
                <select
                  required
                  value={editLabPatientId}
                  onChange={(e) => setEditLabPatientId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg font-bold text-slate-800 font-sans"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone || p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-sans">Assign Clinician specialist</label>
                <select
                  required
                  value={editLabDocId}
                  onChange={(e) => setEditLabDocId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 rounded-lg font-bold text-slate-800 font-sans"
                >
                  <option value="">-- Choose Referring Dr --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1 font-sans">
                <div>
                  <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1">Diagnostic status</label>
                  <select
                    value={editLabStatus}
                    onChange={(e) => setEditLabStatus(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-355 rounded-lg text-slate-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="labEditUrgent"
                    checked={editLabUrgent}
                    onChange={(e) => setEditLabUrgent(e.target.checked)}
                    className="rounded text-indigo-600 cursor-pointer focus:ring-indigo-505"
                  />
                  <label htmlFor="labEditUrgent" className="text-xs font-bold text-rose-600 uppercase cursor-pointer">Emergency Urgent</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingLabId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
