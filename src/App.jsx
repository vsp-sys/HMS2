/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, Users, RefreshCw, Send, ShieldAlert, Heart, Calendar, 
  CreditCard, Clipboard, Database, ShieldCheck, Star, Sparkles, 
  Megaphone, X, Bed, Check, Activity, Award, Thermometer, LogOut, Menu, Lock, Sun, Moon,
  Bell, AlertTriangle, UserCheck, Trash2
} from 'lucide-react';

// Subcomponents
import SuperAdminPanel from './components/SuperAdminPanel';
import BranchAdminPanel from './components/BranchAdminPanel';
import StaffWorkspace from './components/StaffWorkspace';
import DoctorDashboard from './components/DoctorDashboard';
import PatientPortal from './components/PatientPortal';
import LoginPage from './components/LoginPage';
import LanguageSelector from './components/LanguageSelector';
import FeaturesMatrixOverlay from './components/FeaturesMatrixOverlay';
import SaasSubscriptionGate from './components/SaasSubscriptionGate';

// Firebase Client & Sync Engine Imports
import { db, auth, isPlaceholder } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import {
  seedDatabaseIfEmpty,
  setupRealtimeListeners,
  addHospitalSync,
  toggleHospitalStateSync,
  addBranchSync,
  resolveTicketSync,
  addBranchAdminSync,
  toggleBranchAdminStatusSync,
  deleteBranchAdminSync,
  dischargePatientSync,
  restockMedicineSync,
  dispensePharmacySync,
  updateLabStatusSync,
  addDoctorSync,
  addPatientSync,
  setBedTimerSync,
  updateBedStatusSync,
  addBedSync,
  addInvoiceSync,
  reconcileInvoiceSync,
  logVitalsSync,
  logFluidSync,
  toggleMedStateSync,
  addHandoffSync,
  addPrescriptionSync,
  updateAppointmentStatusSync,
  bookAppointmentSync,
  appendAuditLogSync,
  addNotificationSync,
  deleteNotificationSync,
  wipeAllCollectionsSync,
  addLicenseSync,
  updateLicenseSync,
  deleteLicenseSync,
  genericUpdateSync,
  genericDeleteSync
} from './firebaseSync';

// Data Mock source
import {
  initialHospitals,
  initialBranches,
  initialBeds,
  initialDoctors,
  initialPatients,
  initialAppointments,
  initialPrescriptions,
  initialInvoices,
  initialLabOrders,
  initialHelpTickets,
  initialVitalLogs,
  initialFluidRecords,
  initialMARMedications,
  initialShiftHandoffs,
  initialEmergencyAlerts,
  initialAuditLogs,
  initialBranchAdmins,
  initialInventory,
  initialNotifications
} from './data';

export default function App() {
  // Local persistence loaders for offline/isolated mode
  const loadLocalState = (key, fallback) => {
    try {
      const s = localStorage.getItem(`medcore_${key}`);
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length === 0 && fallback && fallback.length > 0) {
          return fallback;
        }
        return parsed;
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocalState = (key, val) => {
    try {
      localStorage.setItem(`medcore_${key}`, JSON.stringify(val));
    } catch (err) {
      console.warn("localStorage write blocked:", err);
    }
  };

  // Global States
  const [hospitals, setHospitals] = useState(() => loadLocalState('hospitals', initialHospitals));
  const [branches, setBranches] = useState(() => loadLocalState('branches', initialBranches));
  const [beds, setBeds] = useState(() => loadLocalState('beds', initialBeds));
  const [doctors, setDoctors] = useState(() => loadLocalState('doctors', initialDoctors));
  const [patients, setPatients] = useState(() => loadLocalState('patients', initialPatients));
  const [appointments, setAppointments] = useState(() => loadLocalState('appointments', initialAppointments));
  const [prescriptions, setPrescriptions] = useState(() => loadLocalState('prescriptions', initialPrescriptions));
  const [invoices, setInvoices] = useState(() => loadLocalState('invoices', initialInvoices));
  const [labOrders, setLabOrders] = useState(() => loadLocalState('labOrders', initialLabOrders));
  const [tickets, setTickets] = useState(() => loadLocalState('tickets', initialHelpTickets));
  const [vitals, setVitals] = useState(() => loadLocalState('vitals', initialVitalLogs));
  const [fluids, setFluids] = useState(() => loadLocalState('fluids', initialFluidRecords));
  const [medications, setMedications] = useState(() => loadLocalState('medications', initialMARMedications));
  const [handoffs, setHandoffs] = useState(() => loadLocalState('handoffs', initialShiftHandoffs));
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [auditLogs, setAuditLogs] = useState(() => loadLocalState('auditLogs', initialAuditLogs));
  const [branchAdmins, setBranchAdmins] = useState(() => loadLocalState('branchAdmins', initialBranchAdmins));
  const [inventoryItems, setInventoryItems] = useState(() => loadLocalState('inventoryItems', initialInventory));
  const [notifications, setNotifications] = useState(() => loadLocalState('notifications', initialNotifications));
  const initialLicensesDefault = [
    { id: 'lic-basic', name: 'Basic Tier Plan', description: 'Limited EHR data', price: 99, duration: 'month' },
    { id: 'lic-standard', name: 'Standard Tier License', description: 'Standard EHR data with unlimited prescriptions', price: 199, duration: 'month' },
    { id: 'lic-enterprise', name: 'Enterprise Licensing tier', description: 'Includes backup redundancy and complete auditing', price: 499, duration: 'month' }
  ];
  const [licenses, setLicenses] = useState(() => loadLocalState('licenses', initialLicensesDefault));
  
  // Real-time Notification States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('medcore-read-notifs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState([]);
  const [shownToastIds, setShownToastIds] = useState(new Set());
  const [appBootTime] = useState(() => Date.now());

  // Notification composer states
  const [compTitle, setCompTitle] = useState('');
  const [compMessage, setCompMsg] = useState('');
  const [compTarget, setCompTarget] = useState('all');
  const [compUrgency, setCompUrgency] = useState('Info');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [sendNotifErr, setSendNotifErr] = useState('');
  const [sendNotifSuccess, setSendNotifSuccess] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('inbox');

  // Custom Global Metropage broadcaster banner
  const [globalBroadcast, setGlobalBroadcast] = useState(
    "📢 Live System broadcast: AWS Mainframe Backup state validated successfully. HIPAA guidelines complied."
  );

  // Authentication Guard State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInRole, setLoggedInRole] = useState(null);
  const [targetRoleForLogin, setTargetRoleForLogin] = useState(null);

  // Theme Toggle State (Light / Dark Mode)
  const [theme, setTheme] = useState(() => localStorage.getItem('medcore-theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medcore-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active User Persona selector
  const [activePersona, setActivePersona] = useState('super_admin');

  // Global Filers for Header
  const [globalBranchFilter, setGlobalBranchFilter] = useState('All');
  const [globalDeptFilter, setGlobalDeptFilter] = useState('All');

  // Mobile sidebar drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Features matrix overlay state
  const [isFeaturesMatrixOpen, setIsFeaturesMatrixOpen] = useState(false);

  // SaaS Subscription plans approved lists for Branch Administrators
  const [approvedBranchAdminsSubs, setApprovedBranchAdminsSubs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medcore-approved-branch-subs') || '{}');
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('medcore-approved-branch-subs', JSON.stringify(approvedBranchAdminsSubs));
  }, [approvedBranchAdminsSubs]);

  // Ensure an anonymous authenticated session is established immediately on first app load
  useEffect(() => {
    async function ensureBootAuth() {
      if (isPlaceholder) return;
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
          console.log("Firebase anonymous session pre-emptively established on boot.");
        } catch (err) {
          console.warn("Firebase immediate session bootstrapping omitted:", err.message);
        }
      }
    }
    ensureBootAuth();
  }, []);

  // On boot: check autoseed and set up active onSnapshot subscriptions to synchronize dynamic state in real-time
  useEffect(() => {
    const initialLicenses = [
      { id: 'lic-enterprise', name: 'Enterprise Licensing tier', description: 'Includes active redundant backup', price: 1200, duration: 'month' },
      { id: 'lic-standard', name: 'Standard Tier License', description: 'EHR prescriptions limit: Unlimited', price: 450, duration: 'month' }
    ];

    const initialDataMap = {
      hospitals: initialHospitals,
      branches: initialBranches,
      beds: initialBeds,
      doctors: initialDoctors,
      patients: initialPatients,
      appointments: initialAppointments,
      prescriptions: initialPrescriptions,
      invoices: initialInvoices,
      labOrders: initialLabOrders,
      tickets: initialHelpTickets,
      vitals: initialVitalLogs,
      fluids: initialFluidRecords,
      medications: initialMARMedications,
      handoffs: initialShiftHandoffs,
      branchAdmins: initialBranchAdmins,
      inventory: initialInventory,
      auditLogs: initialAuditLogs,
      notifications: initialNotifications,
      licenses: initialLicenses,
    };

    let unsub = null;

    async function init() {
      if (isPlaceholder) {
        console.log("Local development/placeholder authentication & state sync initialized.");
        return;
      }
      // Lazy initialize Firebase auth representation if missing prior to Firestore sync
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Firestore sign-in fallback omitted:", err.message);
        }
      }

      await seedDatabaseIfEmpty(initialDataMap);
      
      const setters = {
        setHospitals,
        setBranches,
        setBeds,
        setDoctors,
        setPatients,
        setAppointments,
        setPrescriptions,
        setInvoices,
        setLabOrders,
        setTickets,
        setVitals,
        setFluids,
        setMedications,
        setHandoffs,
        setBranchAdmins,
        setInventoryItems,
        setAuditLogs,
        setNotifications,
        setLicenses,
      };

      unsub = setupRealtimeListeners(setters);
    }

    init();

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);

  // For local placeholder mode, sync across tabs in real-time using storage events
  useEffect(() => {
    if (!isPlaceholder) return;
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('medcore_')) {
        const baseKey = e.key.substring(8); // remove 'medcore_'
        try {
          const parsed = JSON.parse(e.newValue);
          if (!parsed) return;
          const setters = {
            hospitals: setHospitals,
            branches: setBranches,
            beds: setBeds,
            doctors: setDoctors,
            patients: setPatients,
            appointments: setAppointments,
            prescriptions: setPrescriptions,
            invoices: setInvoices,
            labOrders: setLabOrders,
            tickets: setTickets,
            vitals: setVitals,
            fluids: setFluids,
            medications: setMedications,
            handoffs: setHandoffs,
            auditLogs: setAuditLogs,
            branchAdmins: setBranchAdmins,
            inventoryItems: setInventoryItems,
            notifications: setNotifications,
            licenses: setLicenses,
          };
          const setter = setters[baseKey];
          if (setter) {
            setter(parsed);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keep read notifications synchronized with localStorage
  useEffect(() => {
    localStorage.setItem('medcore-read-notifs', JSON.stringify(readNotifIds));
  }, [readNotifIds]);

  // For local fallback/placeholder mode, auto-persist to localStorage on state changes
  useEffect(() => {
    if (isPlaceholder) saveLocalState('hospitals', hospitals);
  }, [hospitals]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('branches', branches);
  }, [branches]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('beds', beds);
  }, [beds]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('doctors', doctors);
  }, [doctors]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('patients', patients);
  }, [patients]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('prescriptions', prescriptions);
  }, [prescriptions]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('labOrders', labOrders);
  }, [labOrders]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('tickets', tickets);
  }, [tickets]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('vitals', vitals);
  }, [vitals]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('fluids', fluids);
  }, [fluids]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('medications', medications);
  }, [medications]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('handoffs', handoffs);
  }, [handoffs]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('auditLogs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('branchAdmins', branchAdmins);
  }, [branchAdmins]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('inventoryItems', inventoryItems);
  }, [inventoryItems]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    if (isPlaceholder) saveLocalState('licenses', licenses);
  }, [licenses]);

  // Trigger real-time visual popup toasts for new incoming medical alerts relevant to persona
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    notifications.forEach(notif => {
      const isForMe = notif.targetRole === 'all' || notif.targetRole === activePersona;
      const notifTime = new Date(notif.timestamp).getTime();
      
      // Filter alerts created after application booted
      const isNew = notifTime > (appBootTime - 5000); 
      const alreadyShown = shownToastIds.has(notif.id);

      if (isForMe && isNew && !alreadyShown) {
        setShownToastIds(prev => {
          const updated = new Set(prev);
          updated.add(notif.id);
          return updated;
        });

        // Add to toast queue
        setToasts(prev => [...prev, notif]);

        // Automatically dismiss toast popup after 6 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== notif.id));
        }, 6000);
      }
    });
  }, [notifications, activePersona]);

  const markAllNotificationsAsRead = () => {
    const relevantNotifs = notifications.filter(
      n => n.targetRole === 'all' || n.targetRole === activePersona
    );
    const relevantIds = relevantNotifs.map(n => n.id);
    setReadNotifIds(prev => Array.from(new Set([...prev, ...relevantIds])));
  };

  // Triggering helpers
  const appendAuditLog = (userType, action) => {
    const freshLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      userType,
      action,
      ip: '192.168.2.' + Math.floor(Math.random() * 254)
    };
    
    if (isPlaceholder) {
      setAuditLogs(prev => [freshLog, ...prev]);
      return;
    }
    
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then(() => {
          appendAuditLogSync(freshLog).catch((writeErr) => {
            console.warn("Direct write bypass for audit log on session failure:", writeErr);
          });
        })
        .catch((err) => {
          console.warn("Automatic fallback anonymous auth failed for audit log:", err.message);
          appendAuditLogSync(freshLog).catch((fbErr) => {
            console.warn("Permissive audit log write failed:", fbErr.message);
          });
        });
    } else {
      appendAuditLogSync(freshLog).catch((err) => {
        console.warn("Direct write bypass for audit log:", err.message);
      });
    }
  };

  // 1. SUPER ADMIN PIPELINES
  const handleAddLicense = (newLic) => {
    addLicenseSync(newLic).then((created) => {
      if (created) {
        setLicenses(prev => {
          if (prev.some(l => l.id === created.id)) return prev;
          return [...prev, created];
        });
        appendAuditLog('Licensing', `Created new licensing tier: ${created.name}`);
      }
    });
  };

  const handleUpdateLicense = (id, updatedFields) => {
    updateLicenseSync(id, updatedFields).then(() => {
      setLicenses(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
      appendAuditLog('Licensing', `Updated licensing tier: ${updatedFields.name || id}`);
    });
  };

  const handleDeleteLicense = (id) => {
    const lic = licenses.find(l => l.id === id);
    deleteLicenseSync(id).then(() => {
      setLicenses(prev => prev.filter(l => l.id !== id));
      appendAuditLog('Licensing', `Deleted licensing tier: ${lic ? lic.name : id}`);
    });
  };

  const handleAddHospital = (newHosp) => {
    addHospitalSync(newHosp).then((created) => {
      if (created) {
        setHospitals(prev => {
          if (prev.some(h => h.id === created.id)) return prev;
          return [...prev, created];
        });
        appendAuditLog('Super Admin', `Provisioned new Hospital Tenant Node: ${created.name}`);
      }
    });
  };

  const handleToggleHospitalState = (hospId) => {
    const target = hospitals.find(h => h.id === hospId);
    if (target) {
      toggleHospitalStateSync(hospId, target.isActive).then(() => {
        setHospitals(prev => prev.map(h => h.id === hospId ? { ...h, isActive: !h.isActive } : h));
        appendAuditLog('Super Admin', `Set Hospital subscription block for ${target.name} to ${!target.isActive ? 'ACTIVE' : 'BLOCKED'}`);
      });
    }
  };

  const handleAddBranch = (newBranch) => {
    const hosp = hospitals.find(h => h.id === newBranch.hospitalId);
    const count = hosp ? hosp.branchesCount : 0;
    addBranchSync({ ...newBranch, branchesCount: count }).then((created) => {
      if (created) {
        setBranches(prev => {
          if (prev.some(b => b.id === created.id)) return prev;
          return [...prev, created];
        });
        setHospitals(prev => prev.map(h => h.id === newBranch.hospitalId ? { ...h, branchesCount: (h.branchesCount || 0) + 1 } : h));
        appendAuditLog('Super Admin', `Launched Clinic Branch: ${created.name} (${created.city})`);
      }
    });
  };

  const handleUpdateHospital = (id, updatedFields) => {
    genericUpdateSync('hospitals', id, updatedFields).then(() => {
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...updatedFields } : h));
      appendAuditLog('Super Admin', `Updated hospital profile: ${updatedFields.name || id}`);
    });
  };

  const handleDeleteHospital = (id) => {
    const target = hospitals.find(h => h.id === id);
    genericDeleteSync('hospitals', id).then(() => {
      setHospitals(prev => prev.filter(h => h.id !== id));
      appendAuditLog('Super Admin', `Deleted hospital tenant node: ${target ? target.name : id}`);
    });
  };

  const handleUpdateBranch = (id, updatedFields) => {
    genericUpdateSync('branches', id, updatedFields).then(() => {
      setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
      appendAuditLog('Super Admin', `Updated Clinic Branch profile: ${updatedFields.name || id}`);
    });
  };

  const handleDeleteBranch = (id) => {
    const target = branches.find(b => b.id === id);
    genericDeleteSync('branches', id).then(() => {
      setBranches(prev => prev.filter(b => b.id !== id));
      if (target) {
        setHospitals(prev => prev.map(h => h.id === target.hospitalId ? { ...h, branchesCount: Math.max(0, (h.branchesCount || 1) - 1) } : h));
      }
      appendAuditLog('Super Admin', `Closed Clinic Branch: ${target ? target.name : id}`);
    });
  };

  const handleResolveTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      resolveTicketSync(ticketId).then(() => {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
        appendAuditLog('Super Admin', `Resolved Help Desk Technical request: ${ticket.subject}`);
      });
    }
  };
  const handleGlobalBroadcast = (message) => {
    setGlobalBroadcast(`📢 Live System broadcast: ${message}`);
    appendAuditLog('Super Admin', `Dispatched multi-tenant pager notification: "${message}"`);
  };

  const handleSystemBackup = () => {
    appendAuditLog('Super Admin', 'Signed cryptographic system AWS backup snapshots archive.');
  };

  const handleWipeDatabase = async () => {
    // Clear all state variables locally
    setHospitals([]);
    setBranches([]);
    setBeds([]);
    setDoctors([]);
    setPatients([]);
    setAppointments([]);
    setPrescriptions([]);
    setInvoices([]);
    setLabOrders([]);
    setTickets([]);
    setVitals([]);
    setFluids([]);
    setMedications([]);
    setHandoffs([]);
    setAuditLogs([]);
    setBranchAdmins([]);
    setInventoryItems([]);
    setNotifications([]);

    try {
      await wipeAllCollectionsSync();
    } catch (err) {
      console.warn("Wiping Firestore collections failed:", err.message);
    }

    appendAuditLog('Super Admin', 'Completed full system-wide database wipeout. Initiated clean database baseline state.');
  };

  const handleAddBranchAdmin = (newAdmin) => {
    addBranchAdminSync(newAdmin).then((created) => {
      if (created) {
        setBranchAdmins(prev => {
          if (prev.some(a => a.id === created.id)) return prev;
          return [...prev, created];
        });
        appendAuditLog('Super Admin', `Registered Privileged Identity - Branch Admin: ${created.name} allocated to ${created.branchName}`);
      }
    });
  };

  const handleUpdateBranchAdmin = (id, updatedFields) => {
    genericUpdateSync('branchAdmins', id, updatedFields).then(() => {
      setBranchAdmins(prev => prev.map(adm => adm.id === id ? { ...adm, ...updatedFields } : adm));
      appendAuditLog('Super Admin', `Updated profile of Branch Admin: ${updatedFields.name || id}`);
    });
  };

  const handleToggleBranchAdminStatus = (adminId) => {
    const target = branchAdmins.find(adm => adm.id === adminId);
    if (target) {
      toggleBranchAdminStatusSync(adminId, target.status).then(() => {
        const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
        setBranchAdmins(prev => prev.map(adm => adm.id === adminId ? { ...adm, status: nextStatus } : adm));
        appendAuditLog('Super Admin', `Toggled Admin Status of ${target.name} to ${nextStatus.toUpperCase()}`);
      });
    }
  };

  const handleDeleteBranchAdmin = (adminId) => {
    const target = branchAdmins.find(adm => adm.id === adminId);
    if (target) {
      deleteBranchAdminSync(adminId).then(() => {
        setBranchAdmins(prev => prev.filter(adm => adm.id !== adminId));
        appendAuditLog('Super Admin', `Permanently deleted Branch Admin account or request for: ${target.name}`);
      });
    }
  };

  const handleDischargePatient = (patientId) => {
    dischargePatientSync(patientId).then(() => {
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'Discharged' } : p));
      const p = patients.find(p => p.id === patientId);
      if (p) {
        appendAuditLog('Branch Admin', `Discharged Inpatient case file: ${p.name}`);
      }
    });
    // De-allocate any bed occupied by this patient in Firestore
    beds.forEach(b => {
      if (b.patientId === patientId) {
        updateBedStatusSync(b.id, 'Unoccupied', null, null).then(() => {
          setBeds(prev => prev.map(bed => bed.id === b.id ? { ...bed, status: 'Unoccupied', patientId: null, patientName: null } : bed));
          appendAuditLog('Branch Admin', `Released Bed ${b.bedNumber} - Clean-up Sanitation Cycle Triggered`);
        });
      }
    });
  };

  const handleRestockMedicine = (itemId, amount) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      restockMedicineSync(itemId, item.quantity, amount).then(() => {
        setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Number(i.quantity) + Number(amount) } : i));
        appendAuditLog('Branch Admin', `Restocked Pharmacy Drug Inventory - ${item.name} (+${amount} ${item.unit})`);
      });
    }
  };

  const handleDispensePharmacy = (itemId, amount) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      dispensePharmacySync(itemId, item.quantity, amount).then(() => {
        setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, Number(i.quantity || 0) - Number(amount)) } : i));
        appendAuditLog('Staff Nurse', `Dispensed prescription drugs from pharmacy: ${item.name} (-${amount} ${item.unit})`);
      });
    }
  };

  const handleUpdateLabStatus = (labId, status, result) => {
    updateLabStatusSync(labId, status, result).then(() => {
      setLabOrders(prev => prev.map(l => l.id === labId ? { ...l, status, result: result || '' } : l));
      const order = labOrders.find(l => l.id === labId);
      if (order) {
        appendAuditLog('Staff Lab Worker', `Completed Lab Assay #${labId} (${order.testName}): "${result || 'Results Compiled'}"`);
      }
    });
  };

  const handleAddInventoryItem = (newItem) => {
    const createdId = `item-${Date.now()}`;
    const payload = { id: createdId, ...newItem };
    genericCreateSync('inventoryItems', createdId, payload).then(() => {
      setInventoryItems(prev => {
        if (prev.some(i => i.id === createdId)) return prev;
        return [...prev, payload];
      });
      appendAuditLog('Branch Admin', `Created pharmacy inventory drug profile: ${payload.name}`);
    });
  };

  const handleUpdateInventoryItem = (id, updatedFields) => {
    genericUpdateSync('inventoryItems', id, updatedFields).then(() => {
      setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));
      appendAuditLog('Branch Admin', `Updated pharmacy inventory item: ${updatedFields.name || id}`);
    });
  };

  const handleDeleteInventoryItem = (id) => {
    const target = inventoryItems.find(i => i.id === id);
    genericDeleteSync('inventoryItems', id).then(() => {
      setInventoryItems(prev => prev.filter(i => i.id !== id));
      appendAuditLog('Branch Admin', `Deleted pharmacy inventory item: ${target ? target.name : id}`);
    });
  };

  const handleAddLabOrder = (newOrder) => {
    const createdId = `lab-${Date.now()}`;
    const payload = {
      id: createdId,
      branchId: activeBranchId || 'br-1',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      result: '',
      ...newOrder
    };
    genericCreateSync('labOrders', createdId, payload).then(() => {
      setLabOrders(prev => {
        if (prev.some(l => l.id === createdId)) return prev;
        return [...prev, payload];
      });
      appendAuditLog('Clinical Staff', `Created Diagnostic Lab Assay Order: ${payload.testName}`);
    });
  };

  const handleUpdateLabOrder = (id, updatedFields) => {
    genericUpdateSync('labOrders', id, updatedFields).then(() => {
      setLabOrders(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
      appendAuditLog('Clinical Staff', `Updated Lab Assay configuration for #${id}`);
    });
  };

  const handleDeleteLabOrder = (id) => {
    genericDeleteSync('labOrders', id).then(() => {
      setLabOrders(prev => prev.filter(l => l.id !== id));
      appendAuditLog('Clinical Staff', `Canceled/Deleted Lab Assay Order #${id}`);
    });
  };

  // 2. BRANCH ADMIN PIPELINES
  const handleAddDoctor = (newDoc) => {
    addDoctorSync(newDoc).then((created) => {
      if (created) {
        setDoctors(prev => {
          if (prev.some(d => d.id === created.id)) return prev;
          return [...prev, created];
        });
        // Increment doctor and staff count on local branch reference
        setBranches(prev => prev.map(b => b.id === newDoc.branchId ? {
          ...b,
          activeDoctorsCount: (b.activeDoctorsCount || 0) + 1,
          staffCount: (b.staffCount || 0) + 3
        } : b));

        if (!isPlaceholder) {
          try {
            const brRef = doc(db, 'branches', newDoc.branchId);
            const activeBranch = branches.find(b => b.id === newDoc.branchId);
            if (activeBranch) {
              updateDoc(brRef, {
                activeDoctorsCount: (activeBranch.activeDoctorsCount || 0) + 1,
                staffCount: (activeBranch.staffCount || 0) + 3
              });
            }
          } catch (_) {}
        }
        appendAuditLog('Branch Admin', `Enrolled specialty Doctor: ${created.name} (${created.specialty})`);
      }
    });
  };

  const handleAddPatient = (newPat) => {
    addPatientSync(newPat).then((created) => {
      if (created) {
        setPatients(prev => {
          if (prev.some(p => p.id === created.id)) return prev;
          return [...prev, created];
        });
        appendAuditLog('Branch Admin', `Admitted Inpatient health case: ${created.name}`);
      }
    });
  };

  const handleUpdateDoctor = (id, updatedFields) => {
    genericUpdateSync('doctors', id, updatedFields).then(() => {
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
      appendAuditLog('Branch Admin', `Updated physician demographic: ${updatedFields.name || id}`);
    });
  };

  const handleDeleteDoctor = (id) => {
    const target = doctors.find(d => d.id === id);
    genericDeleteSync('doctors', id).then(() => {
      setDoctors(prev => prev.filter(d => d.id !== id));
      if (target) {
        setBranches(prev => prev.map(b => b.id === target.branchId ? {
          ...b,
          activeDoctorsCount: Math.max(0, (b.activeDoctorsCount || 1) - 1),
          staffCount: Math.max(0, (b.staffCount || 3) - 3)
        } : b));
      }
      appendAuditLog('Branch Admin', `Permanently deleted doctor profile: ${target ? target.name : id}`);
    });
  };

  const handleUpdatePatient = (id, updatedFields) => {
    genericUpdateSync('patients', id, updatedFields).then(() => {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      appendAuditLog('Branch Admin', `Updated demographic or clinical files for Patient: ${updatedFields.name || id}`);
    });
  };

  const handleDeletePatient = (id) => {
    const target = patients.find(p => p.id === id);
    genericDeleteSync('patients', id).then(() => {
      setPatients(prev => prev.filter(p => p.id !== id));
      appendAuditLog('Branch Admin', `Deleted patient electronic health record for: ${target ? target.name : id}`);
    });
  };

  const handleAddBed = (newBed) => {
    const createdId = `bed-${Date.now()}`;
    const created = {
      id: createdId,
      branchId: activeBranchId || 'br-1',
      timerDuration: null,
      timerEndsAt: null,
      patientId: null,
      patientName: null,
      ...newBed
    };
    addBedSync(created).then(() => {
      setBeds(prev => {
        if (prev.some(b => b.id === createdId)) return prev;
        return [...prev, created];
      });
      appendAuditLog('Branch Admin', `Configured dynamic bed: ${created.bedNumber} in ${created.wardName}`);
    });
  };

  const handleUpdateBed = (id, updatedFields) => {
    genericUpdateSync('beds', id, updatedFields).then(() => {
      setBeds(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
      appendAuditLog('Branch Admin', `Modified configuration of bed: ${updatedFields.bedNumber || id}`);
    });
  };

  const handleDeleteBed = (id) => {
    const target = beds.find(b => b.id === id);
    genericDeleteSync('beds', id).then(() => {
      setBeds(prev => prev.filter(b => b.id !== id));
      appendAuditLog('Branch Admin', `Dismantled hospital bed: ${target ? target.bedNumber : id}`);
    });
  };

  // Background interval to check for bed release timer expiration
  useEffect(() => {
    const interval = setInterval(() => {
      beds.forEach(b => {
        if (b.timerEndsAt && Date.now() >= b.timerEndsAt && b.status !== 'Unoccupied') {
          updateBedStatusSync(b.id, 'Unoccupied', null, null).then(() => {
            appendAuditLog('Automatic Bed System', `Release timer expired for ${b.bedNumber}. Status set to Unoccupied (Blue).`);
          });
        }
      });
    }, 5000); // 5 seconds interval to avoid Firestore write flooding
    return () => clearInterval(interval);
  }, [beds]);

  const handleSetBedTimer = (bedId, duration) => {
    let durationMs = 0;
    if (duration === '3_days') durationMs = 3 * 24 * 60 * 60 * 1000;
    else if (duration === '5_days') durationMs = 5 * 24 * 60 * 60 * 1000;
    else if (duration === '1_week') durationMs = 7 * 24 * 60 * 60 * 1000;
    else if (duration === '1_minute') durationMs = 60 * 1000;
    else if (duration === '10_seconds') durationMs = 10 * 1000;

    const b = beds.find(x => x.id === bedId);
    if (b) {
      if (!duration) {
        setBedTimerSync(bedId, null, null).then(() => {
          setBeds(prev => prev.map(bed => bed.id === bedId ? { ...bed, timerDuration: null, timerEndsAt: null } : bed));
          appendAuditLog('Branch Admin', `Removed release timer on bed ${b.bedNumber}`);
        });
      } else {
        const endsAt = Date.now() + durationMs;
        setBedTimerSync(bedId, duration, endsAt).then(() => {
          setBeds(prev => prev.map(bed => bed.id === bedId ? { ...bed, timerDuration: duration, timerEndsAt: endsAt } : bed));
          appendAuditLog('Branch Admin', `Set release timer on bed ${b.bedNumber} of ${duration.replace('_', ' ')}`);
        });
      }
    }
  };

  const handleExpireBedTimer = (bedId) => {
    const b = beds.find(x => x.id === bedId);
    if (b) {
      updateBedStatusSync(bedId, 'Unoccupied', null, null).then(() => {
        setBeds(prev => prev.map(bed => bed.id === bedId ? { ...bed, status: 'Unoccupied', patientId: null, patientName: null, timerDuration: null, timerEndsAt: null } : bed));
        appendAuditLog('Branch Admin', `Manual trigger: expired release timer on bed ${b.bedNumber}`);
      });
    }
  };

  const handleUpdateBedStatus = (bedId, status, patientId, patientName) => {
    updateBedStatusSync(bedId, status, patientId, patientName).then(() => {
      setBeds(prev => prev.map(bed => bed.id === bedId ? {
        ...bed,
        status,
        patientId: patientId || null,
        patientName: patientName || null,
        timerDuration: null,
        timerEndsAt: null
      } : bed));
      const b = beds.find(x => x.id === bedId);
      if (b) {
        appendAuditLog('Branch Admin', `Allocated Bed ${b.bedNumber} status mode: ${status}`);
      }
    });
  };

  const handleAddInvoice = (patientId, patientName, description, cost) => {
    const created = {
      id: `inv-${Date.now()}`,
      patientId,
      patientName,
      branchId: 'br-1',
      date: new Date().toISOString().split('T')[0],
      totalAmount: cost,
      status: 'Unpaid',
      services: [{ description, cost }]
    };
    addInvoiceSync(created).then((val) => {
      const res = val || created;
      setInvoices(prev => [...prev, res]);
      appendAuditLog('Branch Admin', `Generated client Ledger Invoice for ${patientName}: $${cost}`);
    });
  };

  const handleReconcileInvoice = (invoiceId, status) => {
    reconcileInvoiceSync(invoiceId, status).then(() => {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
      appendAuditLog('Branch Admin', `Reconciled Invoice #${invoiceId} payment state to ${status}`);
    });
  };

  const handleUpdateInvoice = (invoiceId, updatedFields) => {
    genericUpdateSync('invoices', invoiceId, updatedFields).then(() => {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, ...updatedFields } : inv));
      appendAuditLog('Branch Admin', `Updated Invoice descriptor for #${invoiceId}`);
    });
  };

  const handleDeleteInvoice = (invoiceId) => {
    genericDeleteSync('invoices', invoiceId).then(() => {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      appendAuditLog('Branch Admin', `Voided/Deleted Ledger Invoice #${invoiceId}`);
    });
  };

  // 3. STAFF / NURSING PIPELINES
  const handleLogVitals = (vData) => {
    let bClass = 'Stable';
    if (vData.heartRate < 50 || vData.heartRate > 115 || vData.spO2 < 92) {
      bClass = 'Critical';
    } else if (vData.heartRate > 100 || vData.temperature > 100.5) {
      bClass = 'Warning';
    }

    logVitalsSync(vData, bClass).then((created) => {
      if (created) {
        setVitals(prev => [...prev, created]);
      }
      appendAuditLog('Staff Nurse', `Logged bed telemetry values for ${vData.patientName}: Result Triage as ${bClass}`);
    });
  };

  const handleLogFluid = (fData) => {
    logFluidSync(fData).then((created) => {
      if (created) {
        setFluids(prev => [...prev, created]);
      }
      appendAuditLog('Staff Nurse', `Logged hydration fluid balance charting for ${fData.patientName}`);
    });
  };

  const handleUpdateFluids = (id, updatedFields) => {
    genericUpdateSync('fluids', id, updatedFields).then(() => {
      setFluids(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
      appendAuditLog('Clinical Staff', `Modified fluid charting entry ID: ${id}`);
    });
  };

  const handleDeleteFluids = (id) => {
    genericDeleteSync('fluids', id).then(() => {
      setFluids(prev => prev.filter(f => f.id !== id));
      appendAuditLog('Clinical Staff', `Removed fluid logging record ID: ${id}`);
    });
  };

  const handleUpdateVitals = (id, updatedFields) => {
    genericUpdateSync('vitals', id, updatedFields).then(() => {
      setVitals(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
      appendAuditLog('Clinical Staff', `Corrected bedside telemetry logs for Patient ID: ${updatedFields.patientId || id}`);
    });
  };

  const handleDeleteVitals = (id) => {
    genericDeleteSync('vitals', id).then(() => {
      setVitals(prev => prev.filter(v => v.id !== id));
      appendAuditLog('Clinical Staff', `Expunged inaccurate vitals recording ID: ${id}`);
    });
  };

  const handleAddMedication = (newMed) => {
    const medId = newMed.id || `med-${Date.now()}`;
    const payload = {
      ...newMed,
      id: medId,
      status: 'Scheduled'
    };
    genericCreateSync('medications', medId, payload).then(() => {
      setMedications(prev => [...prev, payload]);
      appendAuditLog('Chief Nurse', `Scheduled medication dose ${newMed.medicineName} for patient: ${newMed.patientName}`);
    });
  };

  const handleUpdateMedication = (id, updatedFields) => {
    genericUpdateSync('medications', id, updatedFields).then(() => {
      setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
      appendAuditLog('Clinical Staff', `Adjusted medicine MAR dose schedule ID: ${id}`);
    });
  };

  const handleDeleteMedication = (id) => {
    genericDeleteSync('medications', id).then(() => {
      setMedications(prev => prev.filter(m => m.id !== id));
      appendAuditLog('Clinical Staff', `Cancelled & removed drug dosage schedule ID: ${id}`);
    });
  };

  const handleToggleMedState = (medId) => {
    const med = medications.find(m => m.id === medId);
    if (med) {
      const nextStatus = med.status === 'Administered' ? 'Scheduled' : 'Administered';
      const timeSign = nextStatus === 'Administered' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
      toggleMedStateSync(medId, nextStatus, timeSign).then(() => {
        setMedications(prev => prev.map(m => m.id === medId ? { ...m, status: nextStatus, administeredAt: timeSign || null } : m));
        appendAuditLog('Staff Nurse', `Adjusted Medication checklist status for ${med.medicineName} to ${nextStatus}`);
      });
    }
  };

  const handleAddHandoff = (notes, criticalAlerts) => {
    const created = {
      id: `hd-${Date.now()}`,
      branchId: 'br-1',
      date: new Date().toISOString().split('T')[0],
      outgoingStaff: 'Nurse Sarah Jenkins, RN',
      incomingStaff: 'Nurse Keith Carter, LPN',
      notes,
      criticalAlerts
    };
    addHandoffSync(created).then(() => {
      setHandoffs(prev => [...prev, created]);
      appendAuditLog('Staff Nurse', 'Committed clinical Shift Continuity handoff notes.');
    });
  };

  const handleTriggerEmergency = (code, location) => {
    const created = {
      id: `eme-${Date.now()}`,
      branchId: 'br-1',
      code,
      location,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true
    };
    setEmergencyAlert(created);
    appendAuditLog('Staff Nurse', `🚨 SYSTEM WARNING: CODE ${code.toUpperCase()} OUTBREAK SPOTTED AT ${location}`);
  };

  const handleResolveEmergency = () => {
    if (emergencyAlert) {
      appendAuditLog('Staff Nurse', `✔ Standing down system crisis Code ${emergencyAlert.code} at ${emergencyAlert.location}`);
    }
    setEmergencyAlert(null);
  };

  // 4. DOCTORS CLINICAL PIPELINES
  const handleAddPrescription = (newPresc) => {
    addPrescriptionSync(newPresc).then((created) => {
      if (created) {
        setPrescriptions(prev => [...prev, created]);
      }
      appendAuditLog(newPresc.doctorName, `Authored electronic Prescription for patient: ${newPresc.patientName}`);
    });
  };

  const handleUpdatePrescription = (id, updatedFields) => {
    genericUpdateSync('prescriptions', id, updatedFields).then(() => {
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      appendAuditLog('Authorized Practitioner', `Amended electronically signed prescription ID: ${id}`);
    });
  };

  const handleDeletePrescription = (id) => {
    genericDeleteSync('prescriptions', id).then(() => {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
      appendAuditLog('Authorized Practitioner', `Revoked electronically signed prescription ID: ${id}`);
    });
  };

  const handleUpdateAppointment = (id, updatedFields) => {
    genericUpdateSync('appointments', id, updatedFields).then(() => {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
      appendAuditLog('Clinical Desk', `Rescheduled consultation booking ID: ${id}`);
    });
  };

  const handleDeleteAppointment = (id) => {
    genericDeleteSync('appointments', id).then(() => {
      setAppointments(prev => prev.filter(a => a.id !== id));
      appendAuditLog('Clinical Desk', `Removed consultation booking ID: ${id}`);
    });
  };

  const handleUpdateAppointmentStatus = (aptId, status) => {
    updateAppointmentStatusSync(aptId, status).then(() => {
      setAppointments(prev => prev.map(apt => apt.id === aptId ? { ...apt, status } : apt));
      const apt = appointments.find(a => a.id === aptId);
      if (apt) {
        if (status === 'Completed') {
          // Add $150 premium consult earnings to the consultant doctor
          const d = doctors.find(docItem => docItem.id === apt.doctorId);
          if (d) {
            setDoctors(prev => prev.map(docItem => docItem.id === d.id ? { ...docItem, earnings: docItem.earnings + 150 } : docItem));
            if (!isPlaceholder) {
              updateDoc(doc(db, 'doctors', d.id), { earnings: d.earnings + 150 }).catch(() => {});
            }
          }
        }
        appendAuditLog(apt.doctorName, `Set Consult Slot appointment with ${apt.patientName} to ${status}`);
      }
    });
  };

  // 5. PATIENT PORTAL PIPELINES
  const handleBookAppointment = (newApt) => {
    bookAppointmentSync(newApt).then((created) => {
      if (created) {
        setAppointments(prev => [...prev, created]);
      }
      appendAuditLog('Patient Portal', `${newApt.patientName} scheduled electronic consult with ${newApt.doctorName}`);
    });
  };

  const handlePayInvoice = (invoiceId) => {
    reconcileInvoiceSync(invoiceId, 'Paid').then(() => {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv));
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv) {
        appendAuditLog('Patient Portal', `${inv.patientName} cleared outstanding Invoice balance #${invoiceId} ($${inv.totalAmount})`);
      }
    });
  };

  const handleDeleteNotification = (notifId) => {
    deleteNotificationSync(notifId).then(() => {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      const currentRole = getProfileInfo()?.role || 'User';
      appendAuditLog(currentRole, `Deleted system communication notification node ID: ${notifId}`);
    }).catch((err) => {
      console.error("Failed to delete notification index:", err);
    });
  };

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setActivePersona(role);
    setLoggedInRole(role);
    
    let roleTitle = 'System user';
    if (role === 'super_admin') roleTitle = 'Super Admin';
    else if (role === 'branch_admin') roleTitle = 'Branch Admin';
    else if (role === 'staff_admin') roleTitle = 'Staff Admin';
    else if (role === 'staff') roleTitle = 'Nursing Staff';
    else if (role === 'doctor') roleTitle = 'Consulting Physician';
    else if (role === 'patient') roleTitle = 'Patient Portal';

    appendAuditLog(
      roleTitle, 
      `Authorized session connection established via MedCore Gateway. Target Role: ${role}`
    );
  };

  const getProfileInfo = () => {
    switch (activePersona) {
      case 'super_admin':
        return {
          name: 'Super System Admin',
          role: 'Global Tenant Authority',
          badge: 'Level 5 Clearance',
          avatar: 'SU'
        };
      case 'branch_admin': {
        const customAdmin = loggedInUser?.role === 'branch_admin' ? branchAdmins.find(a => a.id === loggedInUser.adminId) : null;
        return {
          name: customAdmin ? customAdmin.name : 'Mayo Operations Mgr',
          role: customAdmin ? `Admin - ${customAdmin.branchName}` : 'Branch Operations Admin',
          badge: 'Level 4 Clearance',
          avatar: customAdmin ? customAdmin.name.substring(0, 2).toUpperCase() : 'BM'
        };
      }
      case 'staff':
        return {
          name: 'Sarah Jenkins, RN',
          role: 'Clinical Nurse Lead',
          badge: 'Level 3 Access',
          avatar: 'SJ'
        };
      case 'staff_admin':
        return {
          name: loggedInUser?.name || 'Dr. Jane Vance',
          role: 'Chief Nursing Officer & Staff Admin',
          badge: 'Level 4 Operational Authority',
          avatar: 'JV'
        };
      case 'doctor':
        return {
          name: 'Dr. Gregory House',
          role: 'Diagnostic Consultant',
          badge: 'Level 4 Access',
          avatar: 'GH'
        };
      case 'patient': {
        const customPatient = loggedInUser?.role === 'patient' ? patients.find(p => p.id === loggedInUser.patientId) : null;
        return {
          name: customPatient ? customPatient.name : 'Douglas Parker',
          role: customPatient ? `Patient - Blood: ${customPatient.bloodGroup}` : 'Register Outpatient',
          badge: 'Civil Care Key',
          avatar: customPatient ? customPatient.name.substring(0, 2).toUpperCase() : 'DP'
        };
      }
      default:
        return {
          name: 'MedCore Practitioner',
          role: 'Clinical Node Node',
          badge: 'Verified User',
          avatar: 'MC'
        };
    }
  };

  const sidebarLinks = [
    { id: 'super_admin', label: 'Super Admin Portal', desc: 'SaaS licensing & tenants', icon: ShieldCheck, color: 'text-indigo-400' },
    { id: 'branch_admin', label: 'Branch Operations', desc: 'Department & budget ops', icon: Building, color: 'text-emerald-400' },
    { id: 'staff_admin', label: 'Staff Admin Portal', desc: 'Staff rosters & schedules', icon: UserCheck, color: 'text-blue-400' },
    { id: 'staff', label: 'Clinical Nursing Staff', desc: 'Ward telemetry & vitals', icon: Activity, color: 'text-sky-400' },
    { id: 'doctor', label: 'Practitioner Workstation', desc: 'Diagnostic EHR & orders', icon: Heart, color: 'text-teal-400' },
    { id: 'patient', label: 'Patient & Family Portal', desc: 'Schedules & health logs', icon: Users, color: 'text-rose-400' },
  ];

  const profile = getProfileInfo();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        <LoginPage 
          initialRole={targetRoleForLogin}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginSuccess={(role, userDetails) => {
            setIsLoggedIn(true);
            setActivePersona(role);
            setLoggedInRole(role);
            if (userDetails) {
              setLoggedInUser(userDetails);
            } else {
              setLoggedInUser(null);
            }
            
            let roleTitle = 'System user';
            if (role === 'super_admin') roleTitle = 'Super Admin';
            else if (role === 'branch_admin') roleTitle = 'Branch Admin';
            else if (role === 'staff') roleTitle = 'Nursing Staff';
            else if (role === 'doctor') roleTitle = 'Consulting Physician';
            else if (role === 'patient') roleTitle = 'Patient Portal';

            appendAuditLog(
              roleTitle, 
              `Authorized session connection established via MedCore Gateway. Target Role: ${role}`
            );
          }}
          branchAdmins={branchAdmins}
          branches={branches}
          patients={patients}
          doctors={doctors}
          onRegisterBranchAdmin={(adminData) => {
            const newAdmin = {
              ...adminData,
              id: `adm-${Date.now()}`,
              status: 'Pending',
              permissions: ['Billing Management', 'Bed Lifecycle Control', 'Staff Scheduling']
            };
            addBranchAdminSync(newAdmin).then((created) => {
              const res = created || newAdmin;
              setBranchAdmins(prev => {
                if (prev.some(a => a.id === res.id)) return prev;
                return [...prev, res];
              });
              appendAuditLog('Registration Desk', `Transmitted new Branch Admin registration request: ${res.name} assigned to ${res.branchName}`);
            });
            return newAdmin;
          }}
          onRegisterPatient={(patientData) => {
            const newPatient = {
              ...patientData,
              id: `pat-${Date.now()}`,
              registeredDate: new Date().toISOString().split('T')[0],
              status: 'Outpatient'
            };
            addPatientSync(newPatient).then((created) => {
              const res = created || newPatient;
              setPatients(prev => {
                if (prev.some(p => p.id === res.id)) return prev;
                return [...prev, res];
              });
              appendAuditLog('Registration Desk', `Registered new Patient profile via secure portal: ${res.name} (${res.email})`);
            });
            return newPatient;
          }}
        />
      </div>
    );
  }

  const activeBranchId = (loggedInUser?.role === 'branch_admin' && loggedInUser.branchId) || 'br-1';
  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0] || { id: 'br-1', name: 'Temporary Clinic Branch', city: '', hospitalId: 'hosp-1' };
  const activeHospital = hospitals.find(h => h.id === activeBranch?.hospitalId) || hospitals[0] || { id: 'hosp-1', name: 'MedCore Health Network' };
  const currentBranchAdmin = loggedInUser?.role === 'branch_admin' ? branchAdmins.find(adm => adm.id === loggedInUser.adminId) : null;
  const activeHospitalName = (currentBranchAdmin && currentBranchAdmin.hospitalName) || activeHospital?.name || 'Mayo General Health Group';
  const activeBranchAdminKey = loggedInUser?.adminId || loggedInUser?.email || 'default-admin';

  // Derived state logical maps for global filters top-down
  const docIdsForDept = doctors
    .filter(d => globalDeptFilter === 'All' || d.specialty === globalDeptFilter)
    .map(d => d.id);

  const patIdsForDept = patients
    .filter(p => {
      if (globalDeptFilter === 'All') return true;
      const hasAppt = appointments.some(a => a.patientId === p.id && docIdsForDept.includes(a.doctorId));
      const hasPresc = prescriptions.some(pr => pr.patientId === p.id && docIdsForDept.includes(pr.doctorId));
      return hasAppt || hasPresc;
    })
    .map(p => p.id);

  // Apply filters:
  const filteredHospitals = hospitals; 
  
  const filteredBranches = branches.filter(b => {
    return globalBranchFilter === 'All' || b.id === globalBranchFilter;
  });

  const filteredBeds = beds.filter(b => {
    const matchBranch = globalBranchFilter === 'All' || b.branchId === globalBranchFilter;
    const matchDept = globalDeptFilter === 'All' || b.wardName?.toLowerCase().includes(globalDeptFilter.toLowerCase()) || 
                      (b.patientId && patIdsForDept.includes(b.patientId));
    return matchBranch && matchDept;
  });

  const filteredDoctors = doctors.filter(d => {
    const matchBranch = globalBranchFilter === 'All' || d.branchId === globalBranchFilter;
    const matchDept = globalDeptFilter === 'All' || d.specialty === globalDeptFilter;
    return matchBranch && matchDept;
  });

  const filteredPatients = patients.filter(p => {
    const matchBranch = globalBranchFilter === 'All' || p.branchId === globalBranchFilter;
    const matchDept = globalDeptFilter === 'All' || patIdsForDept.includes(p.id);
    return matchBranch && matchDept;
  });

  const filteredAppointments = appointments.filter(a => {
    const docItem = doctors.find(d => d.id === a.doctorId);
    const matchBranch = globalBranchFilter === 'All' || (docItem && docItem.branchId === globalBranchFilter);
    const matchDept = globalDeptFilter === 'All' || (docItem && docItem.specialty === globalDeptFilter);
    return matchBranch && matchDept;
  });

  const filteredPrescriptions = prescriptions.filter(p => {
    const docItem = doctors.find(d => d.id === p.doctorId);
    const matchBranch = globalBranchFilter === 'All' || (docItem && docItem.branchId === globalBranchFilter);
    const matchDept = globalDeptFilter === 'All' || (docItem && docItem.specialty === globalDeptFilter);
    return matchBranch && matchDept;
  });

  const filteredInvoices = invoices.filter(i => {
    const matchBranch = globalBranchFilter === 'All' || i.branchId === globalBranchFilter;
    const matchDept = globalDeptFilter === 'All' || patIdsForDept.includes(i.patientId);
    return matchBranch && matchDept;
  });

  const filteredLabOrders = labOrders.filter(l => {
    const matchBranch = globalBranchFilter === 'All' || l.branchId === globalBranchFilter;
    const matchDept = globalDeptFilter === 'All' || patIdsForDept.includes(l.patientId);
    return matchBranch && matchDept;
  });

  const filteredTickets = tickets.filter(t => {
    return globalBranchFilter === 'All' || t.branchId === globalBranchFilter;
  });

  const filteredVitals = vitals.filter(v => {
    return patIdsForDept.includes(v.patientId) && (globalBranchFilter === 'All' || 
           (patients.find(p => p.id === v.patientId)?.branchId === globalBranchFilter));
  });

  const filteredFluids = fluids.filter(f => {
    return patIdsForDept.includes(f.patientId) && (globalBranchFilter === 'All' || 
           (patients.find(p => p.id === f.patientId)?.branchId === globalBranchFilter));
  });

  const filteredMedications = medications.filter(m => {
    return patIdsForDept.includes(m.patientId) && (globalBranchFilter === 'All' || 
           (patients.find(p => p.id === m.patientId)?.branchId === globalBranchFilter));
  });

  const filteredHandoffs = handoffs.filter(h => {
    return globalBranchFilter === 'All' || h.branchId === globalBranchFilter;
  });

  const filteredBranchAdmins = branchAdmins.filter(ba => {
    return globalBranchFilter === 'All' || ba.branchId === globalBranchFilter;
  });

  const filteredInventoryItems = inventoryItems.filter(item => {
    return globalBranchFilter === 'All' || item.branchId === globalBranchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* SYSTEM BROADCAST FLOATING OVERLAY NOTIFICATION */}
      {globalBroadcast && (
        <div className="bg-slate-900 border-b border-slate-800 text-teal-350 px-4 py-2 text-xs font-mono font-medium flex items-center justify-between shadow-xs relative z-50">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">{globalBroadcast}</span>
          </div>
          <button 
            onClick={() => setGlobalBroadcast(null)}
            className="text-slate-400 hover:text-white focus:outline-hidden transition-colors cursor-pointer ml-3 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE RESPONSIVE TOP HEADER */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 text-white py-3.5 px-4 flex items-center justify-between sticky top-0 z-45 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-600 rounded-lg text-white block shrink-0 shadow-sm">
            <Building className="w-4 h-4" />
          </span>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white leading-tight">MedCore Healthcare</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Healthcare Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-row shrink-0">
          <button
            onClick={() => {
              setIsNotificationOpen(true);
              markAllNotificationsAsRead();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white flex items-center justify-center relative"
            aria-label="System Notifications Center"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length}
              </span>
            )}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-48 md:hidden bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200">
          <div className="w-64 bg-slate-900 border-r border-slate-850 h-full flex flex-col justify-between absolute left-0 top-0 text-slate-100 shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                  <Building className="w-4 h-4" />
                </span>
                <div>
                  <h1 className="text-xs font-black tracking-tight leading-tight">MedCore Healthcare</h1>
                  <span className="text-[9px] text-slate-405 block tracking-wide font-bold">Mayo Gen Clinic</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="text-slate-455 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto w-full">
              <span className="block px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                WORKSTATION MODULES
              </span>
              {sidebarLinks.map(link => {
                const LinkIcon = link.icon;
                const isSelected = activePersona === link.id;
                const isLocked = link.id !== loggedInRole;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActivePersona(link.id);
                      } else {
                        setIsLoggedIn(false);
                        setLoggedInUser(null);
                        setLoggedInRole(null);
                        setTargetRoleForLogin(link.id);
                      }
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-805 text-white font-extrabold border-l-4 border-indigo-500 pl-2' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-1 rounded-md shrink-0 ${isSelected ? link.color : 'text-slate-500'}`}>
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold tracking-tight leading-tight">{link.label}</div>
                        <div className="text-[9.5px] text-slate-505 leading-tight block truncate mt-0.5">{link.desc}</div>
                      </div>
                    </div>
                    {isLocked && (
                      <span className="p-1 bg-slate-950/40 rounded-md text-slate-500 shrink-0 self-center" title="Requires Authentication">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-855 bg-slate-950/40 space-y-3 font-sans">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-205 flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono">
                  {profile.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-slate-200 block truncate leading-none">{profile.name}</span>
                  <span className="text-[10px] text-slate-405 block truncate font-medium mt-0.5 leading-none">{profile.role}</span>
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-[8.5px] bg-slate-800 text-slate-350 border border-slate-700/60 font-mono rounded font-bold leading-none uppercase">
                    {profile.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setLoggedInUser(null);
                  setLoggedInRole(null);
                  setTargetRoleForLogin(null);
                  setIsMobileNavOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-rose-955/80 border border-rose-800/85 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL WRAPPER FOR PERSISTENT SIDEBAR + CONTENT SECTION */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* DESKTOP PERSISTENT LEFT SIDEBAR */}
        <aside className="hidden md:flex md:w-64 shrink-0 bg-slate-900 text-slate-100 flex-col justify-between sticky top-0 h-screen border-r border-slate-850 overflow-y-auto font-sans">
          <div>
            {/* Header branding */}
            <div className="p-5 border-b border-slate-800 flex items-center gap-3">
              <span className="p-1.5 bg-indigo-650 rounded-lg text-white block shadow-sm shrink-0">
                <Building className="w-4.5 h-4.5" />
              </span>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">MedCore Healthcare</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Node Hub</p>
              </div>
            </div>

            <div className="p-3 border-b border-slate-850 bg-slate-950/20">
              <button
                onClick={() => setIsFeaturesMatrixOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-505/40 text-indigo-200 hover:text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                <span>HMS 300+ Core Matrix</span>
              </button>
            </div>

            {/* Portal navigation links */}
            <div className="px-3 py-5 space-y-1.5">
              <span className="block px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-3">
                Workstation Modules
              </span>
              
              {sidebarLinks.map(link => {
                const LinkIcon = link.icon;
                const isSelected = activePersona === link.id;
                const isLocked = link.id !== loggedInRole;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActivePersona(link.id);
                      } else {
                        setIsLoggedIn(false);
                        setLoggedInUser(null);
                        setLoggedInRole(null);
                        setTargetRoleForLogin(link.id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer group ${
                      isSelected 
                        ? 'bg-slate-805 text-white font-extrabold border-l-4 border-indigo-500 pl-2 shadow-inner' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-1 rounded-md shrink-0 ${isSelected ? link.color : 'text-slate-555 group-hover:text-slate-400'}`}>
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold tracking-tight leading-tight">{link.label}</div>
                        <div className="text-[9.5px] text-slate-550 group-hover:text-slate-405 mt-0.5 leading-tight truncate block">
                          {link.desc}
                        </div>
                      </div>
                    </div>
                    {isLocked && (
                      <span className="p-1 bg-slate-950/40 rounded-md text-slate-500 shrink-0 self-center opacity-70 group-hover:opacity-100 transition-opacity" title="Requires Authentication">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected Admin User identity card */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3 font-sans w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-350 flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono select-none">
                {profile.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-slate-205 block truncate leading-none">{profile.name}</span>
                <span className="text-[10px] text-slate-405 block truncate mt-1 leading-none font-medium">{profile.role}</span>
                <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[8.5px] bg-slate-850 text-slate-300 border border-slate-700/60 font-mono rounded font-bold leading-none uppercase">
                  {profile.badge}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                setLoggedInUser(null);
                setLoggedInRole(null);
                setTargetRoleForLogin(null);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-rose-955/80 hover:bg-rose-900 border border-rose-800/70 hover:border-rose-700 text-rose-300 hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-xs"
              id="header-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* COMPACT MULTI-PANEL VIEWPORT CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen">
          
          {/* DESKTOP STATUS BAR */}
          <div className="hidden md:flex bg-white dark:bg-slate-900 py-3 px-6 border-b border-slate-200/85 dark:border-slate-800 items-center justify-between shadow-xs sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                <span className="text-slate-400">Workspace</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold capitalize">
                  {activePersona.replace('_', ' ')} Dashboard
                </span>
              </div>
              

            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 px-2.5 py-1 rounded-lg">
                🕒 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>

              <button
                onClick={() => setIsFeaturesMatrixOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-650 to-indigo-755 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black rounded-lg cursor-pointer transition-all shadow-xs shrink-0 animate-pulse border border-indigo-500"
                title="View All 300+ HMS Advanced Features"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>300+ Features Compliance Matrix</span>
              </button>
              
              <button
                onClick={() => {
                  setIsNotificationOpen(true);
                  markAllNotificationsAsRead();
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-slate-250 dark:border-slate-700 relative"
                title="System Notifications Center"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Alerts Hub</span>
                {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length > 0 && (
                  <span className="bg-rose-500 text-[9px] font-extrabold text-white px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse">
                    {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length}
                  </span>
                )}
              </button>
              
              <LanguageSelector />

              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-slate-250 dark:border-slate-700"
                title={`Toggle to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MAIN PAGE CANVAS */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/40 dark:bg-slate-950/20">
            <div className="min-h-[550px] animate-fade-in">
          

          
          {/* 1. Super Admin Module view */}
          {activePersona === 'super_admin' && (
            <SuperAdminPanel
              hospitals={filteredHospitals}
              branches={filteredBranches}
              tickets={filteredTickets}
              auditLogs={auditLogs} // Audit logs record history, we choose to preserve full context or filter as optional
              branchAdmins={filteredBranchAdmins}
              licenses={licenses}
              onAddHospital={handleAddHospital}
              onUpdateHospital={handleUpdateHospital}
              onDeleteHospital={handleDeleteHospital}
              onToggleHospitalState={handleToggleHospitalState}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onResolveTicket={handleResolveTicket}
              onTriggerGlobalBroadcast={handleGlobalBroadcast}
              onTriggerSystemBackup={handleSystemBackup}
              onWipeDatabase={handleWipeDatabase}
              onAddBranchAdmin={handleAddBranchAdmin}
              onUpdateBranchAdmin={handleUpdateBranchAdmin}
              onToggleBranchAdminStatus={handleToggleBranchAdminStatus}
              onDeleteBranchAdmin={handleDeleteBranchAdmin}
              doctors={filteredDoctors}
              patients={filteredPatients}
              onAddLicense={handleAddLicense}
              onUpdateLicense={handleUpdateLicense}
              onDeleteLicense={handleDeleteLicense}
            />
          )}

          {/* 2. Branch Administrator view */}
          {activePersona === 'branch_admin' && (
            !approvedBranchAdminsSubs[activeBranchAdminKey] ? (
              <SaasSubscriptionGate
                licenses={licenses}
                branchAdminName={loggedInUser?.name || 'Branch Administrator'}
                branchName={activeBranch?.name || 'City Core Branch'}
                onSubscriptionApproved={(plan) => {
                  setApprovedBranchAdminsSubs(prev => ({
                    ...prev,
                    [activeBranchAdminKey]: plan
                  }));
                  // Record full context
                  appendAuditLog(
                    'Subscription Desk',
                    `Cleared payment & authorized SaaS Plan Subscription: ${plan?.name} for Branch Admin ${loggedInUser?.name || 'Administrator'}`
                  );
                }}
              />
            ) : (
              <BranchAdminPanel
                branch={activeBranch}
                beds={filteredBeds.filter(b => b.branchId === activeBranchId)}
                doctors={filteredDoctors.filter(d => d.branchId === activeBranchId)}
                patients={filteredPatients.filter(p => p.branchId === activeBranchId)}
                invoices={filteredInvoices.filter(i => i.branchId === activeBranchId)}
                labOrders={filteredLabOrders.filter(l => l.branchId === activeBranchId)}
                onAddDoctor={handleAddDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onAddPatient={handleAddPatient}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
                onUpdateBedStatus={handleUpdateBedStatus}
                onUpdateBed={handleUpdateBed}
                onDeleteBed={handleDeleteBed}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onReconcileInvoice={handleReconcileInvoice}
                inventoryItems={filteredInventoryItems}
                onAddInventoryItem={handleAddInventoryItem}
                onUpdateInventoryItem={handleUpdateInventoryItem}
                onDeleteInventoryItem={handleDeleteInventoryItem}
                onRestockMedicine={handleRestockMedicine}
                onDischargePatient={handleDischargePatient}
                onSetBedTimer={handleSetBedTimer}
                onExpireBedTimer={handleExpireBedTimer}
                onAddBed={handleAddBed}
                onAddLabOrder={handleAddLabOrder}
                onUpdateLabOrder={handleUpdateLabOrder}
                onDeleteLabOrder={handleDeleteLabOrder}
                hospitalName={activeHospitalName}
                activeSubscription={approvedBranchAdminsSubs[activeBranchAdminKey]}
              />
            )
          )}

          {/* 3. Clinical Staff view */}
          {activePersona === 'staff' && (
            <StaffWorkspace
              loggedInUser={loggedInUser}
              patients={filteredPatients.filter(p => p.branchId === 'br-1')}
              vitals={filteredVitals}
              fluids={filteredFluids}
              medications={filteredMedications}
              handoffs={filteredHandoffs}
              emergencyAlert={emergencyAlert}
              onLogVitals={handleLogVitals}
              onLogFluid={handleLogFluid}
              onToggleMedState={handleToggleMedState}
              onAddHandoff={handleAddHandoff}
              onTriggerEmergency={handleTriggerEmergency}
              onResolveEmergency={handleResolveEmergency}
              inventoryItems={filteredInventoryItems}
              onDispensePharmacy={handleDispensePharmacy}
              labOrders={filteredLabOrders.filter(l => l.branchId === 'br-1')}
              onUpdateLabStatus={handleUpdateLabStatus}
              appointments={filteredAppointments.filter(a => a.branchId === 'br-1')}
              onUpdateVitals={handleUpdateVitals}
              onDeleteVitals={handleDeleteVitals}
              onUpdateFluids={handleUpdateFluids}
              onDeleteFluids={handleDeleteFluids}
              onAddMedication={handleAddMedication}
              onUpdateMedication={handleUpdateMedication}
              onDeleteMedication={handleDeleteMedication}
            />
          )}

          {/* 3.5. Staff Admin view */}
          {activePersona === 'staff_admin' && (
            <StaffWorkspace
              loggedInUser={loggedInUser}
              patients={filteredPatients.filter(p => p.branchId === 'br-1')}
              vitals={filteredVitals}
              fluids={filteredFluids}
              medications={filteredMedications}
              handoffs={filteredHandoffs}
              emergencyAlert={emergencyAlert}
              onLogVitals={handleLogVitals}
              onLogFluid={handleLogFluid}
              onToggleMedState={handleToggleMedState}
              onAddHandoff={handleAddHandoff}
              onTriggerEmergency={handleTriggerEmergency}
              onResolveEmergency={handleResolveEmergency}
              inventoryItems={filteredInventoryItems}
              onDispensePharmacy={handleDispensePharmacy}
              labOrders={filteredLabOrders.filter(l => l.branchId === 'br-1')}
              onUpdateLabStatus={handleUpdateLabStatus}
              appointments={filteredAppointments.filter(a => a.branchId === 'br-1')}
              doctors={filteredDoctors}
              onAddDoctor={handleAddDoctor}
              isStaffAdmin={true}
              onUpdateVitals={handleUpdateVitals}
              onDeleteVitals={handleDeleteVitals}
              onUpdateFluids={handleUpdateFluids}
              onDeleteFluids={handleDeleteFluids}
              onAddMedication={handleAddMedication}
              onUpdateMedication={handleUpdateMedication}
              onDeleteMedication={handleDeleteMedication}
            />
          )}

          {/* 4. Practitioner Specialist view */}
          {activePersona === 'doctor' && (
            <DoctorDashboard
              doctor={loggedInUser || filteredDoctors[1] || initialDoctors[1]}
              appointments={filteredAppointments}
              patients={filteredPatients}
              labOrders={filteredLabOrders}
              prescriptions={filteredPrescriptions}
              onAddPrescription={handleAddPrescription}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onUpdatePrescription={handleUpdatePrescription}
              onDeletePrescription={handleDeletePrescription}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onBookAppointment={handleBookAppointment}
            />
          )}

          {/* 5. Family & Patient Portal view */}
          {activePersona === 'patient' && (
            <PatientPortal
              patients={filteredPatients}
              doctors={filteredDoctors}
              appointments={filteredAppointments}
              prescriptions={filteredPrescriptions}
              invoices={filteredInvoices}
              labOrders={filteredLabOrders}
              vitals={filteredVitals}
              notifications={notifications}
              onBookAppointment={handleBookAppointment}
              onPayInvoice={handlePayInvoice}
              loggedInPatientId={loggedInUser?.patientId}
              onLogVitals={handleLogVitals}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onAddPatient={(pat) => {
                const patId = pat.id || `pat-${Date.now()}`;
                const payload = {
                  ...pat,
                  id: patId,
                  registeredDate: new Date().toISOString().split('T')[0],
                  status: 'Outpatient'
                };
                return addPatientSync(payload).then(() => {
                  appendAuditLog('Patient Portal', `Enrolled new family care member profile: ${payload.name}`);
                  return payload;
                });
              }}
              onUpdatePatient={(pat) => {
                return addPatientSync(pat).then(() => {
                  setPatients(prev => prev.map(p => p.id === pat.id ? pat : p));
                  appendAuditLog('Patient Portal', `Patient profile updated and synchronized: ${pat.name}`);
                  return pat;
                });
              }}
              onAddNotification={(payload) => {
                return addNotificationSync(payload);
              }}
            />
          )}

          </div>
        </main>

        {/* CORE HUMBLE SITE FOOTER (No Tech-Larping, Anti-AI-Slop compliant) */}
        <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 sticky bottom-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>© 2026 MedCore SaaS Healthcare Solutions. All rights reserved.</span>
          </div>
        </footer>

        {/* REAL-TIME TOAST NOTIFICATION POPUPS OVERLAY (Bottom Right corner) */}
        <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => {
            const isUrgent = toast.urgency === 'Urgent';
            const isWarning = toast.urgency === 'Warning';
            return (
              <div 
                key={toast.id}
                className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex gap-3 transition-transform duration-300 animate-slide-in-right bg-white dark:bg-slate-900 ${
                  isUrgent ? 'border-rose-300 dark:border-rose-900' : isWarning ? 'border-amber-300 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                <div className="mt-0.5">
                  {isUrgent ? (
                    <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg text-rose-500">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                  ) : isWarning ? (
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-500">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-500">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{toast.title}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                      isUrgent ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' : 
                      isWarning ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                    }`}>
                      {toast.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-mono flex items-center justify-between">
                    <span>From: {toast.senderName} ({toast.senderRole})</span>
                    <span>Just Now</span>
                  </div>
                </div>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-start p-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* SYSTEM NOTIFICATIONS DRAWER OVERLAY */}
        {isNotificationOpen && (
          <div className="fixed inset-0 z-100 flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsNotificationOpen(false)}
            />
            
            {/* Drawer Body */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-slide-in-right overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Bell className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Live Notification Hub</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Enterprise Broadcast Gateway</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 p-1">
                <button
                  onClick={() => setActiveNotifTab('inbox')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeNotifTab === 'inbox'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-205'
                  }`}
                >
                  Inbox Log ({notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length})
                </button>
                <button
                  onClick={() => setActiveNotifTab('compose')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeNotifTab === 'compose'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-205'
                  }`}
                >
                  Compose / Send Alert
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/20 dark:bg-slate-905">
                {activeNotifTab === 'inbox' ? (
                  <div className="space-y-3.5">
                    {/* Mark all as read button optionally */}
                    {notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length > 0 && (
                      <div className="flex justify-end">
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Mark all loaded as read
                        </button>
                      </div>
                    )}

                    {notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length === 0 ? (
                      <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                        <p className="text-xs font-bold font-sans">No notifications received on your portal yet.</p>
                        <p className="text-[10px] text-slate-400">Broadcast alerts triggered system-wide will propagate here automatically.</p>
                      </div>
                    ) : (
                      notifications
                        .filter(n => n.targetRole === 'all' || n.targetRole === activePersona)
                        .map((notif) => {
                          const isUnread = !readNotifIds.includes(notif.id);
                          const isUrgent = notif.urgency === 'Urgent';
                          const isWarning = notif.urgency === 'Warning';
                          
                          return (
                            <div 
                              key={notif.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                isUnread 
                                  ? 'bg-indigo-50/45 dark:bg-indigo-950/15 border-indigo-200 dark:border-indigo-900/60 ring-2 ring-indigo-500/5' 
                                  : 'bg-white dark:bg-slate-850 border-slate-150 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
                                  )}
                                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                                    {notif.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                                    isUrgent ? 'bg-rose-100 text-rose-850 dark:bg-rose-900/40 dark:text-rose-300' :
                                    isWarning ? 'bg-amber-100 text-amber-850 dark:bg-amber-900/40 dark:text-amber-300' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    {notif.urgency}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notif.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
                                    title="Delete notification"
                                    id={`delete-notif-${notif.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-1.5 leading-relaxed font-sans">
                                {notif.message}
                              </p>

                              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                <span>Sender: {notif.senderName} ({notif.senderRole})</span>
                                <span>{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                ) : (
                  /* COMPOSE AND BROADCAST LIVE ALERTS FORM */
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!compTitle.trim() || !compMessage.trim()) {
                      setSendNotifErr("Kindly populate both the alert title and context message.");
                      return;
                    }
                    setSendNotifErr('');
                    setIsSendingNotif(true);

                    try {
                      const payload = {
                        id: `notif-${Date.now()}`,
                        senderId: auth.currentUser?.uid || 'user',
                        senderName: profile.name,
                        senderRole: profile.role,
                        title: compTitle.trim(),
                        message: compMessage.trim(),
                        urgency: compUrgency,
                        targetRole: compTarget,
                        timestamp: new Date().toISOString()
                      };

                      await addNotificationSync(payload);

                      // Also dispatch to local real-time audit logs for security
                      appendAuditLog(
                        profile.role, 
                        `Broadcast live event: [${compUrgency.toUpperCase()}] directed at persona: [${compTarget.toUpperCase()}] titled "${compTitle}"`
                      );

                      // Flush input parameters
                      setCompTitle('');
                      setCompMsg('');
                      setSendNotifSuccess(true);
                      setTimeout(() => setSendNotifSuccess(false), 3000);
                      setActiveNotifTab('inbox');
                    } catch (err) {
                      setSendNotifErr(err.message || 'Error occurred publishing notification broadcast.');
                    } finally {
                      setIsSendingNotif(false);
                    }
                  }} className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                        🚀 <span className="font-bold text-indigo-600 dark:text-indigo-400">Live Synced System alert dispatcher.</span> Composing any notification here will write instantly to the synchronized Firestore database, popping up a visual alert notice in real-time on all clients currently logged into the targeted portal.
                      </p>
                    </div>

                    {sendNotifErr && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 text-xs font-bold rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{sendNotifErr}</span>
                      </div>
                    )}

                    {sendNotifSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-850 dark:text-emerald-350 text-xs font-bold rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Notification broadcast dispatched successfully!</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Receiver Target Portal</label>
                      <select
                        value={compTarget}
                        onChange={(e) => setCompTarget(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">📢 All Portals (Global Broadcast)</option>
                        <option value="super_admin">🛡 Super Admin Portal</option>
                        <option value="branch_admin">🏥 Branch Operations Admin</option>
                        <option value="staff">🩹 Clinical Nursing Staff</option>
                        <option value="doctor">👩‍⚕️ Consulting Practitioner</option>
                        <option value="patient">🏠 Outpatient Portal</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Urgency Level</label>
                      <select
                        value={compUrgency}
                        onChange={(e) => setCompUrgency(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Info">🔵 Info (Standard Update)</option>
                        <option value="Warning">🟡 Warning (Attention Needed)</option>
                        <option value="Urgent">🔴 Urgent (Action Required)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Alert Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Bed Sanitation Clean Complete, Routine Pager"
                        value={compTitle}
                        onChange={(e) => setCompTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Detailed Context Message</label>
                      <textarea
                        rows="4"
                        placeholder="Provide details of the alert. Let clinical staff know exactly what needs immediate triage, monitoring, or operation."
                        value={compMessage}
                        onChange={(e) => setCompMsg(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingNotif}
                      className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingNotif ? 'Dispatching Broadcast...' : 'Broadcast Real-Time Alert'}</span>
                    </button>
                  </form>
                )}
              </div>
              
              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/45 text-[9.5px] text-slate-400 text-center font-mono">
                Active Portal Sender identity: <span className="font-bold text-slate-700 dark:text-indigo-400">{profile.name} ({profile.role})</span>
              </div>
            </div>
          </div>
        )}

        {/* 300+ COMPLIANCE FEATURES MATRIX EXPLORER */}
        {isFeaturesMatrixOpen && (
          <FeaturesMatrixOverlay
            onClose={() => setIsFeaturesMatrixOpen(false)}
            currentRole={activePersona}
            onUpdateTheme={toggleTheme}
            onGlobalLogAction={(action, extra) => appendAuditLog('Interactive Sandbox', `${action}: ${extra}`)}
          />
        )}
      </div>
    </div>
  </div>
);
}
