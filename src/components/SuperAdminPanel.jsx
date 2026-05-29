/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { 
  ShieldAlert, RefreshCw, Send, Check, X, ShieldCheck, 
  HelpCircle, Trash2, Heart, Plus, Users, LayoutDashboard, 
  Settings, Database, FileText, AlertTriangle, KeyRound, Radio, Shield, Filter,
  TrendingUp, Activity, Server, Clock, CreditCard, Layers, ChevronDown, ChevronUp, Edit
} from 'lucide-react';

import { addLicenseSync, updateLicenseSync, deleteLicenseSync } from '../firebaseSync';

export default function SuperAdminPanel({
  hospitals,
  branches,
  tickets,
  auditLogs,
  branchAdmins,
  licenses = [],
  onAddHospital,
  onUpdateHospital,
  onDeleteHospital,
  onToggleHospitalState,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onResolveTicket,
  onTriggerGlobalBroadcast,
  onTriggerSystemBackup,
  onWipeDatabase,
  onAddBranchAdmin,
  onUpdateBranchAdmin,
  onToggleBranchAdminStatus,
  onDeleteBranchAdmin,
  doctors,
  patients,
  onAddLicense,
  onUpdateLicense,
  onDeleteLicense
}) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Dynamic SaaS Licensing Tiers State and Handlers
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [newLicName, setNewLicName] = useState('');
  const [newLicDesc, setNewLicDesc] = useState('');
  const [newLicPrice, setNewLicPrice] = useState('');
  const [newLicDuration, setNewLicDuration] = useState('month');

  const [editingLicId, setEditingLicId] = useState(null);
  const [editLicName, setEditLicName] = useState('');
  const [editLicDesc, setEditLicDesc] = useState('');
  const [editLicPrice, setEditLicPrice] = useState('');
  const [editLicDuration, setEditLicDuration] = useState('month');
  const [deletingLicId, setDeletingLicId] = useState(null);

  const handleAddLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!newLicName.trim() || !newLicPrice) return;
    const priceNum = parseFloat(newLicPrice);
    if (isNaN(priceNum)) return;

    const payload = {
      name: newLicName.trim(),
      description: newLicDesc.trim(),
      price: priceNum,
      duration: newLicDuration
    };

    if (onAddLicense) {
      await onAddLicense(payload);
    } else {
      await addLicenseSync(payload);
    }

    setNewLicName('');
    setNewLicDesc('');
    setNewLicPrice('');
    setNewLicDuration('month');
    setShowAddLicense(false);
  };

  const handleEditClick = (lic) => {
    setEditingLicId(lic.id);
    setEditLicName(lic.name);
    setEditLicDesc(lic.description || '');
    setEditLicPrice(lic.price);
    setEditLicDuration(lic.duration || 'month');
  };

  const handleSaveEditLicense = async (id) => {
    if (!editLicName.trim() || !editLicPrice) return;
    const priceNum = parseFloat(editLicPrice);
    if (isNaN(priceNum)) return;

    const payload = {
      name: editLicName.trim(),
      description: editLicDesc.trim(),
      price: priceNum,
      duration: editLicDuration
    };

    if (onUpdateLicense) {
      await onUpdateLicense(id, payload);
    } else {
      await updateLicenseSync(id, payload);
    }

    setEditingLicId(null);
  };

  const handleDeleteLicenseClick = (id) => {
    setDeletingLicId(id);
  };

  const handleConfirmDeleteLicense = async (id) => {
    if (onDeleteLicense) {
      await onDeleteLicense(id);
    } else {
      await deleteLicenseSync(id);
    }
    setDeletingLicId(null);
  };

  // Real-time operations stats states for Super Admin Dashboard
  const [liveTraffic, setLiveTraffic] = useState([
    { time: '10:00 AM', bandwidth: 420, transactions: 15 },
    { time: '10:30 AM', bandwidth: 512, transactions: 24 },
    { time: '11:00 AM', bandwidth: 380, transactions: 19 },
    { time: '11:30 AM', bandwidth: 620, transactions: 32 },
    { time: '12:00 PM', bandwidth: 490, transactions: 28 },
    { time: '12:30 PM', bandwidth: 550, transactions: 35 },
    { time: '01:00 PM', bandwidth: 710, transactions: 44 },
    { time: '01:30 PM', bandwidth: 640, transactions: 40 },
  ]);

  const [liveSlaDistribution, setLiveSlaDistribution] = useState([
    { name: 'Unassigned', value: 4 },
    { name: 'Escalated', value: 8 },
    { name: 'In Progress', value: 12 },
    { name: 'Resolved', value: 22 },
  ]);

  const [liveHospitalLoads, setLiveHospitalLoads] = useState({});

  useEffect(() => {
    // Keep liveHospitalLoads synchronized with hospitals
    setLiveHospitalLoads(prev => {
      const next = { ...prev };
      let updated = false;
      hospitals.forEach(h => {
        if (next[h.id] === undefined) {
          // Identify associated details to compute base load
          const hospBranches = branches.filter(b => b.hospitalId === h.id);
          const branchIds = hospBranches.map(b => b.id);
          const hospPatients = patients ? patients.filter(p => branchIds.includes(p.branchId)) : [];
          const hospDoctors = doctors ? doctors.filter(d => branchIds.includes(d.branchId)) : [];
          // Calculate an active base load
          const baseLoad = (hospBranches.length * 20) + (hospPatients.length * 10) + (hospDoctors.length * 5);
          next[h.id] = Math.max(baseLoad, 18);
          updated = true;
        }
      });
      // Remove deleted/absent hospitals
      Object.keys(next).forEach(id => {
        if (!hospitals.some(h => h.id === id)) {
          delete next[id];
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [hospitals, branches, patients, doctors]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Shift real-time grid traffic
      setLiveTraffic(prev => {
        const next = [...prev];
        next.shift();
        const lastHour = next[next.length - 1].time;
        const [timePart, ampm] = lastHour.split(' ');
        let [hr, min] = timePart.split(':').map(Number);
        min += 30;
        if (min >= 60) {
          min -= 60;
          hr += 1;
          if (hr > 12) hr = 1;
        }
        const minStr = min < 10 ? `0${min}` : min;
        const nextTime = `${hr}:${minStr} ${ampm}`;
        
        const bw = Math.min(Math.max(Math.floor(520 + (Math.random() - 0.5) * 350), 150), 980);
        const tx = Math.min(Math.max(Math.floor(35 + (Math.random() - 0.5) * 30), 8), 75);
        
        next.push({ time: nextTime, bandwidth: bw, transactions: tx });
        return next;
      });

      // 2. Fluctuate SLA distribute slightly
      setLiveSlaDistribution(prev => {
        return prev.map(item => {
          let delta = Math.floor((Math.random() - 0.5) * 4);
          let newVal = Math.max(item.value + delta, 1);
          return { ...item, value: newVal };
        });
      });

      // 3. Fluctuate Hospital Load Balance ratios
      setLiveHospitalLoads(prev => {
        const next = { ...prev };
        let modified = false;
        Object.keys(next).forEach(id => {
          let delta = Math.floor((Math.random() - 0.5) * 6);
          next[id] = Math.max(next[id] + delta, 5);
          modified = true;
        });
        return modified ? next : prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Filter States
  const [hospFilterText, setHospFilterText] = useState('');
  const [hospFilterTier, setHospFilterTier] = useState('All');
  const [rbacFilterText, setRbacFilterText] = useState('');
  const [rbacFilterStatus, setRbacFilterStatus] = useState('All');
  const [docFilterText, setDocFilterText] = useState('');
  const [docFilterState, setDocFilterState] = useState('All');
  const [patFilterText, setPatFilterText] = useState('');
  const [patFilterState, setPatFilterState] = useState('All');
  const [ticketFilterPriority, setTicketFilterPriority] = useState('All');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [auditFilterUser, setAuditFilterUser] = useState('All');

  // New Hospital Form states
  const [showHospModal, setShowHospModal] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospCode, setHospCode] = useState('');
  const [hospTier, setHospTier] = useState('Standard');
  const [hospEmail, setHospEmail] = useState('');

  // Keep hospTier synchronized with available licenses:
  useEffect(() => {
    if (licenses && licenses.length > 0) {
      const hasCorrectTier = licenses.some(l => l.name === hospTier);
      if (!hasCorrectTier) {
        setHospTier(licenses[0].name);
      }
    }
  }, [licenses, hospTier]);

  // New Branch Form states
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchHospId, setBranchHospId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchBeds, setBranchBeds] = useState(30);

  // Broadcast Message states
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Backup states
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Branch Admin / RBAC states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminBranchId, setAdminBranchId] = useState('');
  const [adminPerms, setAdminPerms] = useState(['Billing Management', 'Bed Lifecycle Control']);

  // Editing State triggers for CRUD operations
  const [expandedHospIds, setExpandedHospIds] = useState({});
  const toggleHospExpand = (id) => {
    setExpandedHospIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [editingHospId, setEditingHospId] = useState(null);
  const [editHospName, setEditHospName] = useState('');
  const [editHospCode, setEditHospCode] = useState('');
  const [editHospTier, setEditHospTier] = useState('Standard');
  const [editHospEmail, setEditHospEmail] = useState('');

  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchCity, setEditBranchCity] = useState('');
  const [editBranchBeds, setEditBranchBeds] = useState(30);

  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminBranchId, setEditAdminBranchId] = useState('');
  const [editAdminPerms, setEditAdminPerms] = useState([]);

  // Integrated persistent interactive states for KYC checks, Referrals, Currencies, and Dunning configurations
  const [kycEntries, setKycEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('medcore_kyc_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return [
      { name: 'City Dental and Max Clinic', docs: ['State License.pdf', 'Signed Contract Agreement.pdf'], state: 'Verified', progress: '100% Onboarded' },
      { name: 'Saint Jude Heart Sanatorium', docs: ['NABH certification.png', 'GST certificate.pdf'], state: 'Pending Approval', progress: '75% Setup Done' },
      { name: 'Metro Trauma and Triage Hospital', docs: ['HIPAA Consent Sign.pdf', 'State Board License.pdf'], state: 'Suspended (KYC Overdue)', progress: '10% Setup Done' }
    ];
  });

  const [referrals, setReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem('medcore_referrals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return [
      { referrer: 'Mount Sinai Clinic Node', referred: 'City General Wellness', commission: '10% MRR', status: 'Paying' },
      { referrer: 'City General Wellness', referred: 'Holy Grace ICU Inst.', commission: '15% MRR', status: 'Pending Approval' }
    ];
  });

  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('medcore_active_currency') || 'USD ($)';
  });

  const [dunningReminderOption, setDunningReminderOption] = useState(() => {
    return localStorage.getItem('medcore_dunning_reminder') || 'Send 7 days before expiry';
  });

  useEffect(() => {
    try {
      localStorage.setItem('medcore_kyc_entries', JSON.stringify(kycEntries));
    } catch (e) {}
  }, [kycEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('medcore_referrals', JSON.stringify(referrals));
    } catch (e) {}
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('medcore_active_currency', activeCurrency);
  }, [activeCurrency]);

  useEffect(() => {
    localStorage.setItem('medcore_dunning_reminder', dunningReminderOption);
  }, [dunningReminderOption]);

  const handleApproveKyc = (index) => {
    setKycEntries(prev => prev.map((entry, idx) => {
      if (idx === index) {
        return { ...entry, state: 'Verified', progress: '100% Onboarded' };
      }
      return entry;
    }));
  };

  const handleRecallKyc = (index) => {
    setKycEntries(prev => prev.map((entry, idx) => {
      if (idx === index) {
        return { ...entry, state: 'Pending Approval', progress: '50% Setup Pending' };
      }
      return entry;
    }));
  };

  const handleApproveReferral = (index) => {
    setReferrals(prev => prev.map((ref, idx) => {
      if (idx === index) {
        return { ...ref, status: 'Paying' };
      }
      return ref;
    }));
  };

  const handleRecallReferral = (index) => {
    setReferrals(prev => prev.map((ref, idx) => {
      if (idx === index) {
        return { ...ref, status: 'Pending Approval' };
      }
      return ref;
    }));
  };

  const handleEditHospSubmit = (e) => {
    e.preventDefault();
    if (editingHospId && onUpdateHospital) {
      onUpdateHospital(editingHospId, {
        name: editHospName,
        code: editHospCode.toUpperCase(),
        tier: editHospTier,
        contactEmail: editHospEmail
      });
      setEditingHospId(null);
    }
  };

  const handleEditBranchSubmit = (e) => {
    e.preventDefault();
    if (editingBranchId && onUpdateBranch) {
      onUpdateBranch(editingBranchId, {
        name: editBranchName,
        city: editBranchCity,
        bedsTotal: Number(editBranchBeds)
      });
      setEditingBranchId(null);
    }
  };

  const handleEditAdminSubmit = (e) => {
    e.preventDefault();
    if (editingAdminId && onUpdateBranchAdmin) {
      const br = branches.find(b => b.id === editAdminBranchId);
      onUpdateBranchAdmin(editingAdminId, {
        name: editAdminName,
        email: editAdminEmail,
        branchId: editAdminBranchId,
        branchName: br ? br.name : 'Unknown Branch',
        permissions: editAdminPerms
      });
      setEditingAdminId(null);
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminBranchId) return;
    const br = branches.find(b => b.id === adminBranchId);
    onAddBranchAdmin({
      name: adminName,
      branchId: adminBranchId,
      branchName: br ? br.name : 'Unknown Branch',
      status: 'Active',
      email: adminEmail,
      permissions: adminPerms
    });
    setAdminName('');
    setAdminEmail('');
    setAdminBranchId('');
    setShowAdminModal(false);
  };

  const handleHospSubmit = (e) => {
    e.preventDefault();
    if (!hospName || !hospCode || !hospEmail) return;
    onAddHospital({
      name: hospName,
      code: hospCode.toUpperCase(),
      tier: hospTier,
      isActive: true,
      contactEmail: hospEmail
    });
    setHospName('');
    setHospCode('');
    setHospEmail('');
    setShowHospModal(false);
  };

  const handleBranchSubmit = (e) => {
    e.preventDefault();
    if (!branchHospId || !branchName || !branchCity) return;
    onAddBranch({
      hospitalId: branchHospId,
      name: branchName,
      city: branchCity,
      bedsTotal: Number(branchBeds)
    });
    setBranchName('');
    setBranchCity('');
    setBranchBeds(30);
    setBranchHospId('');
    setShowBranchModal(false);
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    onTriggerGlobalBroadcast(broadcastMessage);
    setBroadcastMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleBackupClick = () => {
    setBackupLoading(true);
    onTriggerSystemBackup();
    setTimeout(() => {
      setBackupLoading(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Super Admin Top Context Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-sans">Super Administrator Command</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans">Control global licensing tiers, provision hospital nodes, manage tickets logs, and monitor structural audit records.</p>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowHospModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Provision Hospital
          </button>
          <button
            onClick={() => setShowBranchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-350" />
            Launch Branch Node
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hospitals Enrolled</span>
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{hospitals.length} Tenants</div>
          <p className="text-[10px] text-slate-505 mt-1">Active nodes: {hospitals.filter(h => h.isActive).length}</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Branch Nodes</span>
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{branches.length} Locations</div>
          <p className="text-[10px] text-slate-505 mt-1">Average capacity: 32 beds / Node</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tech Tickets</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.status === 'Open').length} Pending
          </div>
          <p className="text-[10px] text-slate-550 mt-1">SLA compliant resolution rating</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Security trails</span>
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">✔ SECURE</div>
          <p className="text-[10px] text-slate-505 mt-1">Last activity entry: 1 minute ago</p>
        </div>
      </div>

      {/* Structural Sub-Tabs for Super Admin in Pop Left Navigation Block */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6 w-full">
        {/* Left Navigation Block Section */}
        <div className={`transition-all duration-305 shrink-0 ${isNavCollapsed ? 'lg:w-16 w-full' : 'lg:w-64 w-full'} lg:sticky lg:top-4 w-full`}>
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              {!isNavCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Super Admin Menu</span>}
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
                { id: 'dashboard', label: 'Dashboard Metrics', icon: LayoutDashboard },
                { id: 'hospitals', label: 'Manage Hospitals', badge: hospitals.length, icon: ShieldCheck },
                { id: 'rbac', label: 'Branch Admins & RBAC', badge: branchAdmins.length, icon: KeyRound },
                { id: 'directory', label: 'Global Case Directory', badge: doctors.length + patients.length, icon: Users },
                { id: 'tickets', label: 'Support Tickets', badge: tickets.filter(t => t.status === 'Open').length, icon: ShieldAlert },
                { id: 'compliance', label: 'Security & Compliance', icon: Shield },
                { id: 'subscriptions', label: 'Subscription Master', icon: CreditCard },
                { id: 'platform', label: 'Platform & KYC Control', icon: Settings },
                { id: 'cloud', label: 'Cloud Snapshots', icon: Database }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
                          <span className="px-1.5 py-0.5 text-[9px] bg-indigo-600 text-white font-mono rounded-full font-bold animate-pulse">
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
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Broadcast Alert Trigger */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest bg-rose-500 text-white font-extrabold uppercase rounded">
                System Announcement
              </span>
              <h2 className="text-xl font-bold tracking-tight">Post Global Announcement</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                Sends a high-priority advisory notification visible across all user dashboard portals instantly.
              </p>

              <form onSubmit={handleBroadcastSubmit} className="space-y-3 pt-2 font-sans">
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder="Enter system broadcast message here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-hidden text-slate-200"
                />
                
                <button
                  type="submit"
                  id="btn-deploy-broadcast"
                  className="w-full bg-rose-650 hover:bg-rose-705 text-white font-bold tracking-wider text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Live Announcement
                </button>

                {broadcastSuccess && (
                  <div className="text-center font-bold text-xs text-emerald-455 animate-bounce mt-2">
                    📢 Global Announcement Published!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Tenant Licensing Tiers Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-mono">Tenant Licensing Tiers</h3>
                <button
                  type="button"
                  onClick={() => setShowAddLicense(!showAddLicense)}
                  className="text-xs flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddLicense ? 'Hide Form' : 'Add License'}
                </button>
              </div>

              {/* Add form */}
              {showAddLicense && (
                <form onSubmit={handleAddLicenseSubmit} className="p-3 bg-slate-50 border border-indigo-100 rounded-xl space-y-3 animate-fade-in text-xs">
                  <span className="font-bold text-slate-800 text-xs block font-sans">New Tier Details</span>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Type</label>
                      <input
                        type="text"
                        value={newLicName}
                        onChange={(e) => setNewLicName(e.target.value)}
                        placeholder="e.g. Premium Tier"
                        className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                      <input
                        type="text"
                        value={newLicDesc}
                        onChange={(e) => setNewLicDesc(e.target.value)}
                        placeholder="e.g. Unlimited EHR data prescriptions"
                        className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price ($)</label>
                        <input
                          type="number"
                          value={newLicPrice}
                          onChange={(e) => setNewLicPrice(e.target.value)}
                          placeholder="e.g. 199"
                          className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                          min="0"
                          step="any"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billing Cycle</label>
                        <input
                          type="text"
                          value={newLicDuration}
                          onChange={(e) => setNewLicDuration(e.target.value)}
                          placeholder="e.g. month, week, year, quarter"
                          className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLicense(false)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white font-semibold hover:bg-indigo-700 rounded transition cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Licenses List */}
              <div className="space-y-3 mt-4 max-h-[350px] overflow-y-auto pr-1">
                {licenses.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    No licensing tiers configured.
                  </div>
                ) : (
                  licenses.map((lic) => {
                    const isEditing = editingLicId === lic.id;
                    
                    const getBillingCycleShort = (dur) => {
                      if (!dur) return 'Mo';
                      const lowered = dur.toLowerCase();
                      if (lowered === 'week' || lowered === 'weekly') return 'Wk';
                      if (lowered === 'month' || lowered === 'monthly') return 'Mo';
                      if (lowered === 'year' || lowered === 'yearly') return 'Yr';
                      return dur.length > 5 ? dur.slice(0, 3) + '.' : dur;
                    };

                    const getBillingCycleLong = (dur) => {
                      if (!dur) return 'Monthly';
                      const lowered = dur.toLowerCase();
                      if (lowered === 'week') return 'Weekly';
                      if (lowered === 'month') return 'Monthly';
                      if (lowered === 'year') return 'Yearly';
                      return dur;
                    };

                    const billingCycleLabel = getBillingCycleShort(lic.duration);
                    const durationFullLabel = getBillingCycleLong(lic.duration);

                    if (isEditing) {
                      return (
                        <div key={lic.id} className="p-3 bg-slate-50 border border-indigo-250 rounded-xl space-y-2 animate-fade-in text-xs">
                          <span className="font-bold text-indigo-700 text-xs block font-sans">Edit Licensing Tier</span>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">License Type</label>
                            <input
                              type="text"
                              value={editLicName}
                              onChange={(e) => setEditLicName(e.target.value)}
                              className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                            <input
                              type="text"
                              value={editLicDesc}
                              onChange={(e) => setEditLicDesc(e.target.value)}
                              className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Price ($)</label>
                              <input
                                type="number"
                                value={editLicPrice}
                                onChange={(e) => setEditLicPrice(e.target.value)}
                                className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Billing Cycle</label>
                              <input
                                type="text"
                                value={editLicDuration}
                                onChange={(e) => setEditLicDuration(e.target.value)}
                                placeholder="e.g. month"
                                className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingLicId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditLicense(lic.id)}
                              className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-semibold hover:bg-emerald-700 rounded transition cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const isDeleting = deletingLicId === lic.id;

                    if (isDeleting) {
                      return (
                        <div key={lic.id} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex justify-between items-center text-xs animate-fade-in">
                          <div className="space-y-0.5">
                            <span className="font-bold text-rose-800 block font-sans">Delete "{lic.name}"?</span>
                            <span className="text-rose-500 text-[11px]">This licensing tier will be permanently removed.</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDeletingLicId(null)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteLicense(lic.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={lic.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs hover:border-slate-350 transition group">
                        <div className="space-y-0.5 max-w-[65%]">
                          <span className="font-bold text-slate-850 block truncate font-sans">{lic.name}</span>
                          <span className="text-slate-500 block truncate" title={lic.description}>{lic.description || 'No description provided'}</span>
                          <span className="inline-block text-[10px] px-1.5 py-0.2 bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium rounded-full mt-1 capitalize font-sans">
                            {durationFullLabel}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <strong className="text-slate-800 text-sm font-mono">${(Number(lic.price) || 0).toLocaleString()}/{billingCycleLabel}</strong>
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(lic)}
                              title="Edit tier"
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLicenseClick(lic.id)}
                              title="Delete tier"
                              className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Real-time Global Systems Dashboard Charts - Creative Mobile-Responsive Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6" id="super-admin-live-ops-dashboard">
          {/* Chart 1: Live SaaS Operations Bandwidth & Network Queries (Area Chart) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Live Operational Bandwidth & API Query Latency</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full bg-slate-50/40 border border-slate-150 rounded-lg p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveTraffic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  <Area type="monotone" dataKey="bandwidth" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBandwidth)" name="API Requests Rate (req/m)" />
                  <Area type="monotone" dataKey="transactions" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTransactions)" name="Payload Latency (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Live SLA incident level (Bar Chart) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Incident Support Tickets Load</h4>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveSlaDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {liveSlaDistribution.map((entry, index) => {
                      const colors = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[11px] space-y-1 text-slate-650 font-semibold">
              <div className="flex justify-between">
                <span>Total Active Tickets:</span>
                <span className="font-mono text-slate-800">{tickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Urgent Escalate Ratio:</span>
                <span className="font-mono text-rose-600">
                  {Math.round((liveSlaDistribution.find(i=>i.name==='Escalated')?.value || 0) / (tickets.length || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart 3: Live Hospital Load Share balancing (Pie Chart) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="pb-2 border-b border-slate-100 mb-2">
              <h4 className="text-sm font-bold text-slate-800">Hospital Load Balance Ratio</h4>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const COLORS = [
                        '#10b981', // emerald
                        '#3b82f6', // blue
                        '#6366f1', // indigo
                        '#ec4899', // pink
                        '#f59e0b', // amber
                        '#8b5cf6', // violet
                        '#14b8a6', // teal
                        '#f43f5e', // rose
                      ];
                      return hospitals.map((h, idx) => ({
                        name: h.name,
                        value: liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20,
                        color: COLORS[idx % COLORS.length]
                      }));
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(() => {
                      const COLORS = [
                        '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#f43f5e'
                      ];
                      return hospitals.map((h, idx) => (
                        <Cell key={`cell-${h.id}`} fill={COLORS[idx % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">
                  {hospitals.reduce((acc, h) => acc + (liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20), 0)}
                </span>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Total Load</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-around text-[10px] font-bold text-slate-600 px-2 border-t border-slate-100 pt-3">
              {(() => {
                const COLORS = [
                  '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#f43f5e'
                ];
                return hospitals.map((h, idx) => (
                  <div key={h.id} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate max-w-[80px]">{h.name.split(' ')[0]} ({liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20})</span>
                  </div>
                ));
              })()}
              {hospitals.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">No registered hospitals</span>
              )}
            </div>
          </div>
        </div>
            </>
          )}

      {activeTab === 'hospitals' && (() => {
        const filteredHospitals = hospitals.filter(h => {
          const matchesText = h.name.toLowerCase().includes(hospFilterText.toLowerCase()) || 
            h.code.toLowerCase().includes(hospFilterText.toLowerCase()) || 
            h.contactEmail.toLowerCase().includes(hospFilterText.toLowerCase());
          
          const matchesTier = hospFilterTier === 'All' || 
            h.tier === hospFilterTier || 
            (h.tier && hospFilterTier.toLowerCase().includes(h.tier.toLowerCase())) ||
            (hospFilterTier && h.tier && h.tier.toLowerCase().includes(hospFilterTier.toLowerCase()));
            
          return matchesText && matchesTier;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-205 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Hospital Tenants</span>
              <button
                onClick={() => setShowHospModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-800"
              >
                + Provision Hospital
              </button>
            </div>

            {/* Hospital Filter Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Filter By:
              </span>
              <input
                type="text"
                placeholder="Search hospital name or code..."
                value={hospFilterText}
                onChange={(e) => setHospFilterText(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:outline-none"
              />
              <select
                value={hospFilterTier}
                onChange={(e) => setHospFilterTier(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Tiers</option>
                {licenses && licenses.length > 0 ? (
                  licenses.map((lic) => (
                    <option key={lic.id} value={lic.name}>{lic.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                  </>
                )}
              </select>
              {(hospFilterText !== '' || hospFilterTier !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setHospFilterText(''); setHospFilterTier('All'); }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-sm text-slate-705">
              <table className="w-full">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Hospital Identity</th>
                    <th className="px-5 py-3 text-center font-semibold">Node Code</th>
                    <th className="px-5 py-3 text-center font-semibold">Plan Tier</th>
                    <th className="px-5 py-3 text-center font-semibold">Branches Count</th>
                    <th className="px-5 py-3 text-center font-semibold">Service state</th>
                    <th className="px-5 py-3 text-right font-semibold">Licensing Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredHospitals.map((hosp) => {
                    const isExpanded = !!expandedHospIds[hosp.id];
                    const hospBranches = branches.filter(b => b.hospitalId === hosp.id);

                    return (
                      <React.Fragment key={hosp.id}>
                        <tr className="hover:bg-slate-50/50 border-b border-slate-100">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleHospExpand(hosp.id)}
                                className="mt-1 p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                title="Toggle Branch Nodes"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              <div>
                                <span className="font-bold text-slate-900 block">{hosp.name}</span>
                                <span className="text-xs text-slate-500 font-mono block">Contact: {hosp.contactEmail} • Joined: {hosp.joinedDate}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center font-mono font-semibold text-indigo-650">{hosp.code}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                              hosp.tier === 'Enterprise' ? 'bg-indigo-50 border-indigo-205 text-indigo-705 font-bold' :
                              hosp.tier === 'Standard' ? 'bg-teal-50 border-teal-205 text-teal-705' :
                              'bg-slate-50 border-slate-205 text-slate-705'
                            }`}>
                              {hosp.tier}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center font-bold">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-mono">
                              {hospBranches.length}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-0.5 text-xs rounded-md ${
                              hosp.isActive ? 'bg-emerald-100 text-emerald-805 font-semibold' : 'bg-rose-105 text-rose-805 font-semibold'
                            }`}>
                              {hosp.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onToggleHospitalState(hosp.id)}
                                className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md cursor-pointer border transition-colors ${
                                  hosp.isActive 
                                    ? 'bg-amber-50 border-amber-250 text-amber-700 hover:bg-amber-100' 
                                    : 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                                }`}
                                title={hosp.isActive ? 'Suspend Block' : 'Reinstate Node'}
                              >
                                {hosp.isActive ? 'Suspend' : 'Reinstate'}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingHospId(hosp.id);
                                  setEditHospName(hosp.name);
                                  setEditHospCode(hosp.code);
                                  setEditHospTier(hosp.tier);
                                  setEditHospEmail(hosp.contactEmail);
                                }}
                                className="p-1.5 text-slate-605 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-md bg-white cursor-pointer"
                                title="Edit Tenant Node"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (onDeleteHospital) {
                                    onDeleteHospital(hosp.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 hover:border-transparent rounded-md cursor-pointer"
                                title="Delete Tenant Node"
                              >
                                <Plus className="w-3.5 h-3.5 rotate-45" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded child branches drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={6} className="px-6 py-4 border-b border-indigo-50">
                              <div className="space-y-3 font-sans max-w-5xl">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinic Child Nodes for {hosp.name}</h4>
                                    <p className="text-[10px] text-slate-500">Regional locations, clinics, and emergency triages integrated under this main contract.</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setBranchHospId(hosp.id);
                                      setBranchName('');
                                      setBranchCity('');
                                      setBranchBeds(25);
                                      setShowBranchModal(true);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md hover:bg-indigo-700 cursor-pointer"
                                  >
                                    + Launch New Child Clinic
                                  </button>
                                </div>

                                {hospBranches.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic py-2">No clinic nodes launched under this host hospital yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {hospBranches.map(br => (
                                      <div key={br.id} className="bg-white border border-slate-150 p-3 rounded-xl shadow-3xs flex flex-col justify-between">
                                        <div>
                                          <div className="flex items-start justify-between">
                                            <strong className="text-slate-900 text-xs font-bold block truncate max-w-[180px]">{br.name}</strong>
                                            <span className="text-[9px] font-mono uppercase bg-indigo-50 border border-indigo-105 text-indigo-707 px-1.5 py-0.5 rounded font-bold">
                                              CLI-NODE
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">City: <strong>{br.city}</strong></span>
                                          <span className="text-[10px] text-slate-550 block font-sans">Enrolled bed capacity: <strong>{br.bedsTotal || 30} Beds</strong></span>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100">
                                          <button
                                            onClick={() => {
                                              setEditingBranchId(br.id);
                                              setEditBranchName(br.name);
                                              setEditBranchCity(br.city);
                                              setEditBranchBeds(br.bedsTotal || 30);
                                            }}
                                            className="px-2 py-1 text-[9px] font-bold border border-slate-205 text-slate-600 rounded bg-white hover:bg-slate-50 cursor-pointer"
                                          >
                                            Modify Node
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (onDeleteBranch) {
                                                onDeleteBranch(br.id);
                                              }
                                            }}
                                            className="px-2 py-1 text-[9px] font-bold text-rose-600 border border-rose-100 hover:bg-rose-50 hover:border-rose-200 rounded cursor-pointer"
                                          >
                                            Decommission
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filteredHospitals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No hospital nodes match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {activeTab === 'rbac' && (() => {
        const filteredAdmins = branchAdmins.filter(adm => {
          const matchesText = adm.name.toLowerCase().includes(rbacFilterText.toLowerCase()) || 
            adm.email.toLowerCase().includes(rbacFilterText.toLowerCase()) || 
            adm.branchName.toLowerCase().includes(rbacFilterText.toLowerCase());
          const matchesStatus = rbacFilterStatus === 'All' || adm.status === rbacFilterStatus;
          return matchesText && matchesStatus;
        });

        return (
          <div className="space-y-4 font-sans">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block font-sans">Branch Administrators</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Manage localized branch administrator accounts and permissions.</p>
                </div>
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 font-bold hover:bg-indigo-700 text-white text-xs rounded-lg cursor-pointer"
                >
                  + Appoint Branch Admin
                </button>
              </div>

              {/* RBAC Filter Bar */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  Filter By:
                </span>
                <input
                  type="text"
                  placeholder="Search admin name, email, or branch..."
                  value={rbacFilterText}
                  onChange={(e) => setRbacFilterText(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:outline-none"
                />
                <select
                  value={rbacFilterStatus}
                  onChange={(e) => setRbacFilterStatus(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {(rbacFilterText !== '' || rbacFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setRbacFilterText(''); setRbacFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="overflow-x-auto text-sm text-slate-705">
                <table className="w-full">
                  <thead className="bg-slate-100 text-xs text-slate-550 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Administrator Name</th>
                      <th className="px-5 py-3 text-left font-semibold">Hospital Tenants</th>
                      <th className="px-5 py-3 text-left font-semibold">Scoped Permissions Role</th>
                      <th className="px-5 py-3 text-center font-semibold">Identity Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Access control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/50 font-sans">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-750 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {adm.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{adm.name}</span>
                              <span className="text-xs text-slate-500 font-mono block">{adm.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 italic text-slate-800 font-medium font-sans">{adm.branchName}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {adm.permissions.map((p, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-205 text-slate-600 text-[10px] font-medium rounded-md font-sans">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                            adm.status === 'Active' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' : 
                            adm.status === 'Pending' ? 'bg-amber-50 text-amber-850 border border-amber-250 animate-pulse' :
                            'bg-rose-50 text-rose-805 border border-rose-250'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          <div className="flex justify-end items-center gap-2">
                            {adm.status === 'Pending' ? (
                              <button
                                onClick={() => onToggleBranchAdminStatus(adm.id)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer border border-emerald-600 shadow-sm inline-block whitespace-nowrap"
                              >
                                Approve Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleBranchAdminStatus(adm.id)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                                  adm.status === 'Active' ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                {adm.status === 'Active' ? 'Log out' : 'Authorize key'}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingAdminId(adm.id);
                                setEditAdminName(adm.name);
                                setEditAdminEmail(adm.email);
                                setEditAdminBranchId(adm.branchId);
                                setEditAdminPerms(adm.permissions || []);
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 border border-slate-205 rounded-lg bg-white cursor-pointer flex items-center gap-1 text-xs font-bold"
                              title="Update Credentials & Permissions"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onDeleteBranchAdmin) {
                                  onDeleteBranchAdmin(adm.id);
                                }
                              }}
                              className="p-1.5 px-2 text-rose-600 hover:text-rose-805 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                              title="Delete request or active registry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdmins.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                          No branch administrators match the current filters.
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

      {activeTab === 'directory' && (() => {
        const filteredDoctors = doctors.filter(doc => {
          const matchesText = doc.name.toLowerCase().includes(docFilterText.toLowerCase()) || 
            doc.specialty.toLowerCase().includes(docFilterText.toLowerCase());
          const matchesState = docFilterState === 'All' || doc.availability === docFilterState;
          return matchesText && matchesState;
        });

        const filteredPatients = patients.filter(pat => {
          const matchesText = pat.name.toLowerCase().includes(patFilterText.toLowerCase()) || 
            pat.phone.toLowerCase().includes(patFilterText.toLowerCase());
          const matchesState = patFilterState === 'All' || pat.status === patFilterState;
          return matchesText && matchesState;
        });

        return (
          <div className="space-y-4 animate-fade-in font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctors Global Directory */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Physicians & Consult Specialists Directory</span>
                    <p className="text-[10px] text-slate-500 font-mono">Macro operational rosters across all clinical child nodes</p>
                  </div>

                  {/* Doctor local filter bar */}
                  <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap gap-2 items-center text-xs">
                    <Filter className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter doctor or specialty..."
                      value={docFilterText}
                      onChange={(e) => setDocFilterText(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none flex-1 min-w-[120px]"
                    />
                    <select
                      value={docFilterState}
                      onChange={(e) => setDocFilterState(e.target.value)}
                      className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                    >
                      <option value="All">All statuses</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>

                  <div className="max-h-[350px] overflow-auto text-xs font-sans">
                    <table className="w-full">
                      <thead className="bg-slate-100 stroke-slate-205 text-[10px] uppercase font-mono tracking-wider text-slate-505">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Specialist</th>
                          <th className="px-4 py-2 text-left font-semibold">Medical specialty</th>
                          <th className="px-4 py-2 text-center font-semibold">Service state</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredDoctors.map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 font-sans">
                            <td className="px-4 py-3 font-bold text-slate-850 font-sans">{doc.name}</td>
                            <td className="px-4 py-3 font-semibold text-indigo-650 font-sans">{doc.specialty}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                doc.availability === 'On Duty' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' :
                                doc.availability === 'Emergency' ? 'bg-amber-50 text-amber-805 border border-amber-250' :
                                'bg-slate-50 text-slate-500 border border-slate-200'
                              }`}>
                                {doc.availability}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredDoctors.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-6 text-slate-400">No doctors match current filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Patients Active Cases */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Active Diagnosed Patient Register</span>
                    <p className="text-[10px] text-slate-500 font-mono">Consolidated demographic indexes spanning all clinical divisions</p>
                  </div>

                  {/* Patient local filter bar */}
                  <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap gap-2 items-center text-xs">
                    <Filter className="w-3.5 h-3.5 text-rose-550 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter patient name or phone..."
                      value={patFilterText}
                      onChange={(e) => setPatFilterText(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none flex-1 min-w-[120px]"
                    />
                    <select
                      value={patFilterState}
                      onChange={(e) => setPatFilterState(e.target.value)}
                      className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                    >
                      <option value="All">All states</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  <div className="max-h-[350px] overflow-auto text-xs">
                    <table className="w-full">
                      <thead className="bg-slate-100 text-[10px] uppercase font-mono tracking-wider text-slate-505">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Patient Case Profile</th>
                          <th className="px-4 py-2 text-center font-semibold">Blood Variant</th>
                          <th className="px-4 py-2 text-right font-semibold">Admit state</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-sans">
                        {filteredPatients.map(pat => (
                          <tr key={pat.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-855 block">{pat.name}</span>
                              <span className="text-[10px] text-slate-505 font-mono block">Age: {pat.age}y • Contact: {pat.phone}</span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-rose-600 font-mono">{pat.bloodGroup}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                pat.status === 'Inpatient' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans' :
                                pat.status === 'Discharged' ? 'bg-slate-50 text-slate-500 border border-slate-200 font-sans' :
                                'bg-emerald-50 text-emerald-800 border border-emerald-250 font-sans'
                              }`}>
                                {pat.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-6 text-slate-400">No patients match current filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'tickets' && (() => {
        const filteredTickets = tickets.filter(tkt => {
          const matchesPriority = ticketFilterPriority === 'All' || tkt.priority === ticketFilterPriority;
          const matchesStatus = ticketFilterStatus === 'All' || tkt.status === ticketFilterStatus;
          return matchesPriority && matchesStatus;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs font-sans">
            <div className="p-4 border-b border-slate-205 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Global Support Ticket Logs</span>
            </div>

            {/* Support Ticket Filters */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-650" />
                Filter By:
              </span>
              <select
                value={ticketFilterPriority}
                onChange={(e) => setTicketFilterPriority(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={ticketFilterStatus}
                onChange={(e) => setTicketFilterStatus(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
              {(ticketFilterPriority !== 'All' || ticketFilterStatus !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setTicketFilterPriority('All'); setTicketFilterStatus('All'); }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-150">
              {filteredTickets.map(tkt => (
                <div key={tkt.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 font-sans">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-450 border border-slate-200 px-1.5 py-0.5 rounded">
                        #{tkt.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-sans">{tkt.subject}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        tkt.priority === 'High' ? 'bg-rose-105 text-rose-805 border border-rose-200' :
                        tkt.priority === 'Medium' ? 'bg-amber-105 text-amber-805 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {tkt.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-655 pt-1 leading-relaxed font-sans">{tkt.description}</p>
                    
                    <div className="text-[11px] text-slate-500 font-mono">
                      Node: <strong className="text-slate-800">{tkt.hospitalName}</strong> | Authored By: {tkt.raisedBy} | Created: {tkt.createdDate}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {tkt.status === 'Open' ? (
                      <button
                        onClick={() => onResolveTicket(tkt.id)}
                        className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-xs text-emerald-750 bg-emerald-50 font-bold rounded-lg border border-emerald-150 inline-block font-sans">
                        Resolved ✔
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-sans">
                  No support tickets match the current filters.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'compliance' && (() => {
        const processedLogs = auditLogs.map(log => ({
          ...log,
          displayUserType: log.userType || log.actor || 'Super Admin',
          displayIp: log.ip || '192.168.2.14'
        }));

        const filteredLogs = processedLogs.filter(log => {
          const matchesUser = auditFilterUser === 'All' || log.displayUserType === auditFilterUser;
          return matchesUser;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs font-sans">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Global Audit Activity Ledger Trail</span>
            </div>

            {/* Compliance Filter Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-650" />
                Filter By Persona:
              </span>
              <select
                value={auditFilterUser}
                onChange={(e) => setAuditFilterUser(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Personas</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Branch Admin">Branch Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Staff">Staff</option>
                <option value="Patient">Patient</option>
              </select>
              {auditFilterUser !== 'All' && (
                <button
                  type="button"
                  onClick={() => setAuditFilterUser('All')}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-sm text-slate-705">
              <table className="w-full">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Audit Timestamp</th>
                    <th className="px-5 py-3 text-left font-semibold">Origin Persona Role</th>
                    <th className="px-5 py-3 text-left font-semibold">Operation Executed</th>
                    <th className="px-5 py-3 text-right font-semibold">Source IP Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-55/50 font-sans">
                      <td className="px-5 py-3 font-mono text-slate-450">{log.timestamp}</td>
                      <td className="px-5 py-3 font-bold text-slate-800 font-sans">{log.displayUserType}</td>
                      <td className="px-5 py-3 font-sans italic text-slate-655 font-sans">"{log.action}"</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-450">{log.displayIp}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs font-sans">
                        No audit activities match the selected persona.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {activeTab === 'cloud' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {/* Backups Action */}
            <div className="bg-white border border-slate-250 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-wider bg-slate-900 text-teal-400 font-bold uppercase rounded inline-block">
                  AWS Clustered backups
                </span>
                <h2 className="text-base font-bold text-slate-850 font-sans">System Cloud database Snapshot</h2>
                <p className="text-xs text-slate-505 leading-relaxed font-sans">
                  Generates a point-in-time snapshot database state containing licensing counts, billing ledgers, medications lists, and telehealth queues. Compliant with HIPAA standards.
                </p>
              </div>

              <div className="pt-6 font-sans">
                <button
                  disabled={backupLoading}
                  onClick={handleBackupClick}
                  className="w-full bg-slate-900 border border-slate-850 text-teal-400 hover:bg-slate-800 font-extrabold font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${backupLoading ? 'animate-spin' : ''}`} />
                  {backupLoading ? 'EXECUTING Snapshot ARCHIVE...' : 'TRIGGER FULL SYSTEM SNAPSHOT DATA BACKUP'}
                </button>

                {backupSuccess && (
                  <div className="text-center font-bold text-xs text-emerald-650 mt-2 font-sans">
                    ✔ AWS S3 redundant snapshot synced and validated! Code: BACKUP-SHA56
                  </div>
                )}
              </div>
            </div>

            {/* Backup metadata statistics */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between font-sans">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-455 pb-2 border-b border-slate-205 font-mono">Archive Snapshot Specifications</h3>
                
                <div className="text-xs space-y-2.5 mt-4 text-slate-705">
                  <div className="flex justify-between">
                    <span>HIPAA Guidelines checked:</span>
                    <strong className="text-emerald-600 font-bold">PASSED ✔</strong>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span>S3 Sharding nodes count:</span>
                    <strong className="font-mono">3 Redundant Regions</strong>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span>Encryption level:</span>
                    <strong className="font-mono">AES-256 System-Locked</strong>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono mt-4 block">
                Redundant copies: US-EAST-1, EU-WEST-1, AP-NORTHEAST-1
              </span>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Subscription & Billing Management UI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Stats */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Monthly Recurring Revenue</span>
              {(() => {
                const dynamicMRR = (hospitals || []).filter(h => h.isActive).reduce((sum, h) => {
                  const tierLower = (h.tier || '').toLowerCase();
                  const matchedLic = (licenses || []).find(lic => {
                    const licNameLower = (lic.name || '').toLowerCase();
                    return tierLower === licNameLower ||
                           licNameLower.includes(tierLower) ||
                           tierLower.includes(licNameLower);
                  });
                  return sum + (matchedLic ? (Number(matchedLic.price) || 0) : 450);
                }, 0) + 45000;

                const projectedARR = dynamicMRR * 12;

                return (
                  <>
                    <h3 className="text-2xl font-black text-slate-800 mt-1 font-mono">
                      ${dynamicMRR.toLocaleString()}{' '}
                      <span className="text-xs text-emerald-500 font-semibold">+12% MoM</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-2">
                       ARR Projection: ${projectedARR.toLocaleString()} | Churn Rate: 1.2%
                    </p>
                  </>
                );
              })()}
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Usage-Based Commission Fees</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-1 font-mono">3.5% / SMS</h3>
              <p className="text-[10px] text-slate-500 mt-2">Aggregated third-party gateway fee margin set to +1% profit</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Referral Rewards Disbursed</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">$3,400 <span className="text-xs text-slate-450 font-normal">this Q</span></h3>
              <p className="text-[10px] text-slate-500 mt-2">Eligible: 8 active affiliate hospital referrers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Configuration Dashboard */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">SaaS Plan Tier Enforcements</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded uppercase font-bold">
                  {licenses && licenses.length > 0 ? "Dynamic Enforcement Config" : "None Active"}
                </span>
              </div>
              <div className="space-y-3">
                {(() => {
                  const displayPlans = (licenses || []).map((lic) => {
                    // Calculate active count among hospitals
                    const activeCount = hospitals ? hospitals.filter(h => {
                      const tierLower = (h.tier || '').toLowerCase();
                      const licNameLower = (lic.name || '').toLowerCase();
                      return tierLower === licNameLower || 
                             licNameLower.includes(tierLower) || 
                             tierLower.includes(licNameLower);
                    }).length : 0;

                    let docs = '5';
                    let patients = '500';
                    let storage = '10 GB';

                    const price = Number(lic.price) || 0;
                    const nameL = (lic.name || '').toLowerCase();

                    if (nameL.includes('enterprise') || price >= 1000) {
                      docs = 'Unlimited';
                      patients = 'Unlimited';
                      storage = '1 TB';
                    } else if (nameL.includes('standard') || nameL.includes('pro') || price >= 199) {
                      docs = '20';
                      patients = '2,000';
                      storage = '50 GB';
                    } else {
                      docs = '5';
                      patients = '500';
                      storage = '10 GB';
                    }

                    if (nameL.includes('basic') || price < 100) {
                      docs = '5';
                      patients = '500';
                      storage = '10 GB';
                    }

                    const billingCycleVal = lic.duration || 'month';

                    return {
                      id: lic.id,
                      name: lic.name,
                      cost: price,
                      docs,
                      patients,
                      storage,
                      active: activeCount,
                      duration: billingCycleVal
                    };
                  });

                  if (displayPlans.length === 0) {
                    return (
                      <div className="py-6 text-center text-slate-400 font-sans border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <span className="text-xs font-semibold block">No active plan tier enforcements.</span>
                        <span className="text-[10px] text-slate-400">All tenant licensing tiers are empty.</span>
                      </div>
                    );
                  }

                  return displayPlans.map((p, idx) => (
                    <div key={p.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition duration-150 hover:bg-slate-100/50">
                      <div>
                        <strong className="text-slate-900 font-bold block">{p.name}</strong>
                        <span className="text-slate-500 font-sans block mt-0.5">Max Doctors: <strong className="text-indigo-600">{p.docs}</strong> • Max Patients: <strong className="text-indigo-650">{p.patients}</strong> • Storage: <strong className="text-slate-600">{p.storage}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 block">${p.cost}/{p.duration}</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold">{p.active} Tenants Active</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Promo Code & Campaign Manager */}
              <div className="pt-4 border-t border-slate-150 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Active Promotion Codes & Campaigns</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-indigo-50/50 border border-indigo-105 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span className="font-mono text-indigo-700 font-extrabold pb-0.5">LAUNCH20</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <span className="text-[11px] text-slate-505">20% Discount for Mountain hospitals. Validated 4 times.</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 border border-indigo-105 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span className="font-mono text-indigo-700 font-extrabold pb-0.5">HEALTHY30</span>
                      <span className="text-slate-450">Expired</span>
                    </div>
                    <span className="text-[11px] text-slate-505">30% Flat off. Extended trial period for early nodes.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Finance Control Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Dunning & Renewal Automation Configurations</h3>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-705">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Payment Failure Dunning Engine Flow</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-805">
                      <strong className="block text-xs font-mono font-extrabold pb-0.5">Day 1</strong>
                      First Warning Email
                    </div>
                    <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-900">
                      <strong className="block text-xs font-mono font-extrabold pb-0.5">Day 7</strong>
                      Second Attempt SMS
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-805">
                      <strong className="block text-xs font-mono font-extrabold pb-0.5">Day 14</strong>
                      Node Auto-Suspended
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono pb-1">Automated Reminders</span>
                    <select
                      value={dunningReminderOption}
                      onChange={(e) => setDunningReminderOption(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-none"
                    >
                      <option value="Send 7 days before expiry">Send 7 days before expiry</option>
                      <option value="Send 3 days before expiry">Send 3 days before expiry</option>
                      <option value="Manual Dispatch Only">Manual Dispatch Only</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono pb-1">Settlement Currencies</span>
                    <div className="flex gap-1.5 pt-1.5">
                      {['USD ($)', 'INR (₹)', 'EUR (€)', 'GBP (£)'].map((curr, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveCurrency(curr)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded select-none transition-all cursor-pointer border ${
                            curr === activeCurrency 
                              ? 'bg-indigo-600 text-white border-indigo-650 font-bold shadow-xs' 
                              : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-705'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Referral Tracker Affiliate system */}
                <div className="pt-4 border-t border-slate-150 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">B2B Referral Registry</h4>
                  <div className="space-y-1.5">
                    {referrals.map((ref, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <div>
                          <span className="font-semibold block">{ref.referrer} ➜ {ref.referred}</span>
                          <span className="text-[10px] text-slate-505">Assigned Commission Payout: <strong>{ref.commission}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            ref.status === 'Paying' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' : 'bg-amber-50 text-amber-850 border border-amber-250 animate-pulse'
                          }`}>
                            {ref.status}
                          </span>
                          <div className="flex gap-1">
                            {ref.status === 'Pending Approval' ? (
                              <button
                                type="button"
                                onClick={() => handleApproveReferral(idx)}
                                className="px-1.5 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer transition-all shadow-2xs whitespace-nowrap"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRecallReferral(idx)}
                                className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-250 text-rose-650 hover:bg-rose-50 rounded cursor-pointer transition-all whitespace-nowrap"
                              >
                                Recall
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Platform controls, KYC and legal compliance trackers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Document Verification & KYC approval workflows */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Hospital KYC document Verification</h3>
                  <p className="text-xs text-slate-455 font-sans">Approve, decline and inspect license agreements and regulatory certifications of onboarded facilities.</p>
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-mono bg-indigo-100 text-indigo-707 font-bold tracking-wider rounded">6 Facility Audits</span>
              </div>

              <div className="space-y-3">
                {kycEntries.map((kyc, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3">
                    <div className="space-y-1">
                      <strong className="text-slate-900 font-bold block">{kyc.name}</strong>
                      <span className="text-slate-450 block text-[10px] font-sans">Compliance Files: <strong>{kyc.docs.join(', ')}</strong></span>
                      <span className="inline-block text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider bg-slate-205 text-slate-700 rounded-full font-sans">{kyc.progress}</span>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${kyc.state === 'Verified' ? 'bg-emerald-50 text-emerald-805 border border-emerald-202' : kyc.state === 'Pending Approval' ? 'bg-amber-50 text-amber-805 border border-amber-202' : 'bg-rose-50 text-rose-805 border border-rose-202'}`}>
                        Status: {kyc.state}
                      </span>
                      <div className="flex gap-1.5 self-end">
                        <button
                          type="button"
                          onClick={() => handleApproveKyc(i)}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer transition-all ${
                            kyc.state === 'Verified' 
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                          disabled={kyc.state === 'Verified'}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecallKyc(i)}
                          className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-250 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-all"
                        >
                          Recall
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Flags Block */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Global feature Flags per subscription Plan</h3>
              </div>

              <div className="space-y-3 font-sans text-xs">
                {[
                  { name: 'Telemedicine Video Cons.', flag: 'TELEMED_CONS_GLOBAL_STATE', desc: 'Allow online virtual portal consultas. On for Pro/Enterprise.', active: true },
                  { name: 'E-Prescription Auto AI suggestions', flag: 'AI_CLINICAL_DECISION_SUPPORT', desc: 'Predict drug-allergy interactions. Enterprise only.', active: true },
                  { name: 'Regional SMS Blast alerts', flag: 'SMS_AUTO_ROSTER_ALERT', desc: 'Trigger MSG91 triggers on schedule. On for all.', active: false }
                ].map((f, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-805 font-semibold block">{f.name}</strong>
                      <span className={`w-3.5 h-3.5 rounded-full ${f.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <span className="font-mono text-[9px] text-indigo-600 block">{f.flag}</span>
                    <p className="text-[10px] text-slate-450 mt-1 font-sans">{f.desc}</p>
                    <button className="text-[9px] font-semibold text-indigo-707 hover:underline pt-1 cursor-pointer">Toggle Flag State</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Super Admin Roles Panels */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Super Admin Administrative Team</h3>
                  <p className="text-xs text-slate-505 font-sans">Invite, assign roles, or suspend sub-level platform admin credentials.</p>
                </div>
                <button className="px-2 py-1 bg-slate-900 text-white rounded cursor-pointer font-bold text-[10px]">+ Invite Admin</button>
              </div>

              <div className="divide-y divide-slate-150">
                {[
                  { name: 'Vismay Patil', role: 'Main Super Admin', mail: 'vismaypatil20@gmail.com', logs: 'Managed licensing parameters 4 mins ago' },
                  { name: 'Shlok P.', role: 'Finance Admin', mail: 'shlokpatil7076@gmail.com', logs: 'Approved mountainside hospital billing invoice' },
                  { name: 'Raj Patil', role: 'Support Specialist', mail: 'rajpatil8837@gmail.com', logs: 'Resolved tech desk ticket #T-104' },
                  { name: 'Sarah Jenkins', role: 'Legal & Compliance Auditor', mail: 'sarah.c@medcore.com', logs: 'Updated DPDP Acts template terms to v3.0' }
                ].map((team, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className="font-bold text-slate-850 block">{team.name} ({team.role})</span>
                      <span className="text-[10px] text-slate-505 block">{team.mail}</span>
                      <span className="text-[10px] text-indigo-655 italic font-mono block mt-0.5">✔ {team.logs}</span>
                    </div>
                    <select className="text-[10px] bg-white border border-slate-200 p-1 rounded font-semibold cursor-pointer focus:outline-none">
                      <option>Active Status</option>
                      <option>On Leave</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Systems diagnostics logger */}
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xs text-white space-y-4 font-sans">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Live Node Health & API Crash Logs</h3>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-505"></span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2 border border-slate-850 rounded">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Server Load</span>
                  <strong className="text-emerald-500 text-sm">34.2%</strong>
                </div>
                <div className="bg-slate-950 p-2 border border-slate-850 rounded">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Free RAM</span>
                  <strong className="text-emerald-500 text-sm">6.1 GB</strong>
                </div>
                <div className="bg-slate-950 p-2 border border-slate-850 rounded">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">DB Uptime</span>
                  <strong className="text-teal-400 text-sm">99.99%</strong>
                </div>
              </div>

              {/* simulated logs terminal */}
              <div className="bg-slate-950 p-3 rounded border border-slate-850 font-mono text-[9px] space-y-1.5 h-36 overflow-y-auto text-slate-350">
                <p className="text-slate-450">[2026-05-25 10:13:22] - INF - AWS Sharding clusters reporting normal latency indices.</p>
                <p className="text-emerald-500">[2026-05-25 10:15:00] - MSG - Firestore rules loaded and verified. Permissive sandbox unlocked.</p>
                <p className="text-amber-500">[2026-05-25 10:17:11] - WRN - SMS Twilio endpoint responded code 103 (mock API bypass active).</p>
                <p className="text-slate-450">[2026-05-25 10:20:05] - INF - DB maintenance cron successfully executed. 0 stale sessions purged.</p>
                <p className="text-rose-500">[2026-05-25 10:25:12] - ERR - Bed Release timer expired for Bed #302. Successfully dispatched broadcast.</p>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Hospital Provision Modal */}
      {showHospModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Provision New Hospital Node</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Launches a separate multi-tenant node, isolates database rows, and authorizes administrator licensing keys.</p>
            </div>

            <form onSubmit={handleHospSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Hospital Legal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mount Sinai Wellness Care"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 focus:outline-hidden rounded-lg font-sans text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Tenant Code Key</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MSW-CARE"
                    value={hospCode}
                    onChange={(e) => setHospCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-505 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1">Pricing Licensing Tier</label>
                  <select
                    value={hospTier}
                    onChange={(e) => setHospTier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg font-medium text-slate-800"
                  >
                    {licenses && licenses.length > 0 ? (
                      licenses.map((lic) => (
                        <option key={lic.id} value={lic.name}>{lic.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Basic">Basic Tier Plan</option>
                        <option value="Standard">Standard Tier</option>
                        <option value="Enterprise">Enterprise License</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-mono">Contact Administrator Email</label>
                <input
                  required
                  type="email"
                  placeholder="abc@gmail.com"
                  value={hospEmail}
                  onChange={(e) => setHospEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-550 focus:outline-hidden rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowHospModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-hospital-provision"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Provision Tenant Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Node Launcher Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Launch Branch Node location</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Registers a physical branch clinic under an outstanding tenant, maps default wards, and triggers bed registries.</p>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-sans">Align Parent Hospital</label>
                <select
                  required
                  value={branchHospId}
                  onChange={(e) => setBranchHospId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-355 focus:border-indigo-500 rounded-lg font-bold text-slate-850"
                >
                  <option value="">-- Choose Hospital Tenant --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} (Code: {h.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Branch Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mount Sinai - Central Chicago"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 focus:outline-hidden rounded-lg font-sans text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Clinic City</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Chicago"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 font-sans">Wards Bed capacity</label>
                  <input
                    required
                    type="number"
                    min={5}
                    value={branchBeds}
                    onChange={(e) => setBranchBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer animate-fade-in"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-branch-launcher"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Launch Clinic Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appoint Branch Admin RBAC Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Appoint Branch Admin</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Authorizes a clinical administrative user under a child node and assigns RBAC permissions.</p>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Align Target Branch</label>
                <select
                  required
                  value={adminBranchId}
                  onChange={(e) => setAdminBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg font-bold text-slate-800"
                >
                  <option value="">-- Choose Branch Node --</option>
                  {branches.map(br => (
                    <option key={br.id} value={br.id}>{br.name} ({br.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Administrator Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Robert Carter"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-505 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Primary Email Credentials</label>
                <input
                  required
                  type="email"
                  placeholder="abc@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-355 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Select Policy Scopes</label>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto p-2 border border-slate-205 rounded-lg bg-slate-50 text-[11px] text-slate-750">
                  {['Billing Management', 'Bed Lifecycle Control', 'Staff Scheduling', 'Inventory Dispatch', 'Pathology Diagnostic Signing'].map(pScope => (
                    <label key={pScope} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adminPerms.includes(pScope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdminPerms([...adminPerms, pScope]);
                          } else {
                            setAdminPerms(adminPerms.filter(p => p !== pScope));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{pScope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-admin-rbac"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Edit Hospital Modal */}
      {editingHospId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Modify Hospital Registry</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Update name, code identifier, or pricing licensing tiers for this host node.</p>
            </div>

            <form onSubmit={handleEditHospSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Hospital Legal Name</label>
                <input
                  required
                  type="text"
                  value={editHospName}
                  onChange={(e) => setEditHospName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Tenant Code Key</label>
                  <input
                    required
                    type="text"
                    value={editHospCode}
                    onChange={(e) => setEditHospCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-505 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-sans">Pricing plan Tier</label>
                  <select
                    value={editHospTier}
                    onChange={(e) => setEditHospTier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-355 rounded-lg text-slate-800"
                  >
                    {licenses && licenses.length > 0 ? (
                      licenses.map((lic) => (
                        <option key={lic.id} value={lic.name}>{lic.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Basic">Basic Tier Plan</option>
                        <option value="Standard">Standard Tier</option>
                        <option value="Enterprise">Enterprise License</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-mono">Contact Administrator Email</label>
                <input
                  required
                  type="email"
                  value={editHospEmail}
                  onChange={(e) => setEditHospEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingHospId(null)}
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

      {/* 2. Edit Clinic Branch Modal */}
      {editingBranchId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Modify Clinic Location</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Modify regional physical address, facility description, and base bed volumes.</p>
            </div>

            <form onSubmit={handleEditBranchSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Branch Facility Name</label>
                <input
                  required
                  type="text"
                  value={editBranchName}
                  onChange={(e) => setEditBranchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800 font-sans font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Operating City</label>
                <input
                  required
                  type="text"
                  value={editBranchCity}
                  onChange={(e) => setEditBranchCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 font-mono">Enrolled Beds Capacity</label>
                <input
                  required
                  type="number"
                  value={editBranchBeds}
                  onChange={(e) => setEditBranchBeds(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingBranchId(null)}
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

      {/* 3. Edit Branch Admin Modal */}
      {editingAdminId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Modify Branch Admin Credentials</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Re-allocate administrative personnel, change target child branch, or alter RBAC scope permissions.</p>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Assign Target Branch Location</label>
                <select
                  required
                  value={editAdminBranchId}
                  onChange={(e) => setEditAdminBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg font-bold text-slate-800"
                >
                  <option value="">-- Choose Branch Node --</option>
                  {branches.map(br => (
                    <option key={br.id} value={br.id}>{br.name} ({br.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Administrator Full Name</label>
                <input
                  required
                  type="text"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider pb-1">Credential Email</label>
                <input
                  required
                  type="email"
                  value={editAdminEmail}
                  onChange={(e) => setEditAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-355 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider pb-1">Select Active Policy Scopes</label>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto p-2 border border-slate-205 rounded-lg bg-slate-50 text-[11px] text-slate-750">
                  {['Billing Management', 'Bed Lifecycle Control', 'Staff Scheduling', 'Inventory Dispatch', 'Pathology Diagnostic Signing'].map(pScope => (
                    <label key={pScope} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editAdminPerms.includes(pScope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditAdminPerms([...editAdminPerms, pScope]);
                          } else {
                            setEditAdminPerms(editAdminPerms.filter(p => p !== pScope));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{pScope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingAdminId(null)}
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
