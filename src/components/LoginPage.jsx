/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, ShieldCheck, Building, Key, AlertCircle, ArrowRight, ArrowLeft,
  Activity, Heart, Users, ShieldAlert, Laptop, Eye, EyeOff, Sparkles, CheckCircle2,
  Phone, UserCheck, HelpCircle, X, ChevronRight, CheckCircle, Sun, Moon
} from 'lucide-react';

const GATEWAYS = {
  super_admin: {
    name: 'Super Admin',
    roleLabel: 'Global System Controller',
    desc: 'Centralized cloud infrastructure control & HIPAA audit logs.',
    icon: ShieldCheck,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-150',
    hoverClass: 'hover:border-indigo-300 hover:bg-slate-50'
  },
  branch_admin: {
    name: 'Branch Admin',
    roleLabel: 'Ward & Finance Administrator',
    desc: 'Manage departments, staff rosters, and financial operations.',
    icon: Building,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-150',
    hoverClass: 'hover:border-emerald-300 hover:bg-slate-50'
  },
  doctor: {
    name: 'Doctor Portal',
    roleLabel: 'EHR Specialist & Consulting Physician',
    desc: 'Patient care charts, digital lab tracking, and electronic prescriptions.',
    icon: Heart,
    colorClass: 'text-teal-600 bg-teal-50 border-teal-150',
    hoverClass: 'hover:border-teal-300 hover:bg-slate-50'
  },
  staff: {
    name: 'Clinical Staff / Nurse',
    roleLabel: 'Ward Caretaker & Nursing Attendant',
    desc: 'Manage bedside vitals charting, fluids monitor, and drug dispensers.',
    icon: Activity,
    colorClass: 'text-sky-600 bg-sky-50 border-sky-150',
    hoverClass: 'hover:border-sky-305 hover:bg-slate-50'
  },
  staff_admin: {
    name: 'Staff Admin',
    roleLabel: 'Lead Ward & Nurse Administrator',
    desc: 'Oversee nursing rosters, shift allocations, compliance audits, and staff metrics.',
    icon: UserCheck,
    colorClass: 'text-blue-605 bg-blue-50 border-blue-150',
    hoverClass: 'hover:border-blue-300 hover:bg-slate-50'
  },
  patient: {
    name: 'Patient Portal',
    roleLabel: 'Patient & Family Health Hub',
    desc: 'Secure scheduling, clinical billing invoices, and consult history.',
    icon: Users,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-150',
    hoverClass: 'hover:border-rose-300 hover:bg-slate-55'
  }
};

export default function LoginPage({ 
  onLoginSuccess, 
  branchAdmins = [], 
  branches = [], 
  patients = [],
  doctors = [],
  onRegisterBranchAdmin,
  onRegisterPatient,
  initialRole = null,
  theme = 'light',
  onToggleTheme
}) {
  const [selectedRole, setSelectedRole] = useState(initialRole || null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    setSelectedRole(initialRole || null);
  }, [initialRole]);

  useEffect(() => {
    // Reset view specific modes and clear fields
    setAuthMode('login');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    // Clear registration fields
    setPatientName('');
    setPatientPhone('');
    setPatientBloodGroup('O+');
    setPatientAddress('');
    setAdminName('');
    setAdminBranchId('');
    setAdminHospitalAddress('');
    setAdminPhone('');
  }, [selectedRole]);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Patient Registration fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [patientAddress, setPatientAddress] = useState('');

  // Branch Admin Registration fields
  const [adminName, setAdminName] = useState('');
  const [adminBranchId, setAdminBranchId] = useState(''); // Hospital Name with Branch
  const [adminHospitalAddress, setAdminHospitalAddress] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Reset helper
  const handleReset = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setSuccess('');
    setAuthMode('login');
    setSelectedRole(null);
  };

  // Main submission router
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailTrimmed = email.trim().toLowerCase();

    // REGISTER MODE HANDLER
    if (authMode === 'register') {
      if (selectedRole === 'patient') {
        if (!patientName.trim() || !patientPhone.trim() || !patientAddress.trim() || !emailTrimmed || !password) {
          setError('Please fill in all Patient Portal registration fields.');
          return;
        }

        const duplicatePatient = patients.find(p => p.email?.toLowerCase() === emailTrimmed);
        if (duplicatePatient) {
          setError('Access Conflict: A patient profile with this email address is already registered.');
          return;
        }

        setLoading(true);
        setTimeout(() => {
          onRegisterPatient({
            name: patientName.trim(),
            phone: patientPhone.trim(),
            bloodGroup: patientBloodGroup,
            address: patientAddress.trim(),
            email: emailTrimmed,
            password: password
          });
          setLoading(false);
          setSuccess('Patient registration successful! Please log in with your credentials.');
          setAuthMode('login');
          // Clear registration sensitive states but hold email
          setPassword('');
        }, 1000);
        return;
      }

      if (selectedRole === 'branch_admin') {
        if (!adminName.trim() || !adminBranchId.trim() || !adminHospitalAddress.trim() || !adminPhone.trim() || !emailTrimmed || !password) {
          setError('Please fill in all Administrator registration fields.');
          return;
        }

        // Check for duplicate branch admin email
        const duplicateAdmin = branchAdmins.find(adm => adm.email?.toLowerCase() === emailTrimmed);
        if (duplicateAdmin) {
          setError('Access Conflict: An administrator account with this email is already registered.');
          return;
        }

        setLoading(true);
        setTimeout(() => {
          const chosenBranch = branches.find(b => 
            b.name.toLowerCase().includes(adminBranchId.toLowerCase())
          ) || { id: `br-${Date.now()}`, name: adminBranchId.trim() };

          onRegisterBranchAdmin({
            name: adminName.trim(),
            phone: adminPhone.trim(),
            password: password,
            hospitalName: adminBranchId.trim(),
            branchName: chosenBranch.name,
            branchId: chosenBranch.id,
            hospitalAddress: adminHospitalAddress.trim(),
            email: emailTrimmed
          });
          setLoading(false);
          setSuccess('Operations Admin registration transmitted! Pending Super Admin authorization audit. You can log in once approved.');
          setAuthMode('login');
          setPassword('');
        }, 1000);
        return;
      }
    }

    // LOGIN MODE HANDLER
    if (!email || !password) {
      setError('EHR authentication requires both a secure email identity and credential password.');
      return;
    }

    // 1. Super Admin Authorization
    if (selectedRole === 'super_admin') {
      if (emailTrimmed === 'supmin20@gmail.com' && password === 'supmin@hms20') {
        setLoading(true);
        setSuccess('Super Admin cryptographic signature validated. Initializing Core Nodes...');
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess('super_admin', null);
        }, 850);
      } else {
        setError('Access Denied: Invalid credentials for Super Admin Identity.');
      }
      return;
    }

    // 2. Doctor Portal Enrollment Check
    if (selectedRole === 'doctor') {
      const matchedDoc = doctors.find(
        doc => (doc.email?.toLowerCase() === emailTrimmed) && 
               doc.password === password && 
               (doc.profession === 'doctor' || !doc.profession)
      );

      const isDefault = emailTrimmed === 'doctor@gmail.com' && password === 'doctor123';

      if (matchedDoc || isDefault) {
        setLoading(true);
        setSuccess('Provider identification verified. Authorizing Physician Portal...');
        setTimeout(() => {
          setLoading(false);
          const userPayload = matchedDoc || { id: 'doc-1', name: 'Dr. Evelyn Martinez', specialty: 'Cardiology' };
          onLoginSuccess('doctor', userPayload);
        }, 850);
      } else {
        setError('Access Denied: Incorrect doctor email address or password.');
      }
      return;
    }

    // 3. Nurse & Clinical Staff Check
    if (selectedRole === 'staff') {
      const matchedStaff = doctors.find(
        doc => (doc.email?.toLowerCase() === emailTrimmed) && 
               doc.password === password && 
               (doc.profession === 'nurse' || doc.profession === 'staff')
      );

      const isDefault = emailTrimmed === 'nurse@gmail.com' && password === 'nurse123';

      if (matchedStaff || isDefault) {
        setLoading(true);
        setSuccess('Staff clearance checked. Initializing clinical dashboard...');
        setTimeout(() => {
          setLoading(false);
          const userPayload = matchedStaff || { id: 'nurse-1', name: 'Nurse Sarah Jenkins, RN' };
          onLoginSuccess('staff', userPayload);
        }, 850);
      } else {
        setError('Access Denied: Incorrect staff email address or password.');
      }
      return;
    }

    // 3.5. Staff Admin Check
    if (selectedRole === 'staff_admin') {
      const matchedStaffAdmin = doctors.find(
        doc => (doc.email?.toLowerCase() === emailTrimmed) && 
               doc.password === password && 
               (doc.role === 'staff_admin' || doc.profession === 'staff_admin')
      );

      const isDefault = emailTrimmed === 'staffadmin@gmail.com' && password === 'staff123';

      if (matchedStaffAdmin || isDefault) {
        setLoading(true);
        setSuccess('Staff Administrator clearance validated. Initializing operations hub...');
        setTimeout(() => {
          setLoading(false);
          const userPayload = matchedStaffAdmin || { id: 'staffadmin-1', name: 'Dr. Jane Vance, Chief Nursing Officer', role: 'staff_admin' };
          onLoginSuccess('staff_admin', userPayload);
        }, 850);
      } else {
        setError('Access Denied: Incorrect staff administrator email address or password. (For testing use: staffadmin@gmail.com / staff123)');
      }
      return;
    }

    // 4. Branch Admin check
    if (selectedRole === 'branch_admin') {
      const matchedAdmin = branchAdmins.find(
        adm => (adm.email?.toLowerCase() === emailTrimmed) && 
               adm.password === password
      );

      const isDefault = emailTrimmed === 'branchops@gmail.com' && password === 'branch123';

      if (matchedAdmin || isDefault) {
        const adminObj = matchedAdmin || { id: 'adm-1', branchId: 'br-1', status: 'Active' };
        if (adminObj.status === 'Active') {
          setLoading(true);
          setSuccess('Branch Operations Admin authenticated. Syncing ward databases...');
          setTimeout(() => {
            setLoading(false);
            onLoginSuccess('branch_admin', { role: 'branch_admin', adminId: adminObj.id, branchId: adminObj.branchId });
          }, 850);
        } else if (adminObj.status === 'Pending') {
          setError('Access Pending: Registration is awaiting approval authorization check from Super Admin.');
        } else {
          setError('Access Denied: This administrator account is set to INACTIVE.');
        }
      } else {
        setError('Access Denied: Incorrect administrator email address or password.');
      }
      return;
    }

    // 5. Patient Portal Authenticated Sign In
    if (selectedRole === 'patient') {
      const matchedPatient = patients.find(
        p => p.email?.toLowerCase() === emailTrimmed
      );

      if (matchedPatient) {
        // Enforce password authentication check
        if (matchedPatient.password && matchedPatient.password !== password) {
          setError('Access Denied: Incorrect password credential.');
          return;
        }

        setLoading(true);
        setSuccess(`Patient identity verified: ${matchedPatient.name}. Accessing Patient Portal...`);
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess('patient', { role: 'patient', patientId: matchedPatient.id });
        }, 850);
      } else {
        setError('Access Denied: Invalid email address or credentials for Patient Portal. Click register above if you need a new account.');
      }
      return;
    }

    setError('Access Denied: Unsupported entry point configured.');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300 relative">
      
      {/* BRAND HEADER SEGMENT */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white block shadow-sm">
            <Laptop className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white leading-tight">Medcore HMS Portal</h2>
          </div>
        </div>
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* CORE VIEW MODULE */}
      {selectedRole === null ? (
        
        /* 1. SELECTABLE CLINICAL ROLE DEPLOYER */
        <div className="p-6 space-y-4 bg-slate-50/50">
          <div className="text-center pb-2">
            <h2 className="text-sm font-black text-slate-850 tracking-tight">Role Base Selection</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Please identify your clinical access role to connect safely.</p>
          </div>

          <div className="space-y-2">
            {Object.keys(GATEWAYS).map((roleKey) => {
              const current = GATEWAYS[roleKey];
              const NodeIcon = current.icon;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={`w-full p-3 border border-slate-200 bg-white hover:border-blue-300 rounded-xl transition-all flex items-start gap-3 text-left hover:shadow-xs group cursor-pointer ${current.hoverClass}`}
                  id={`role-btn-${roleKey}`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 ${current.colorClass} group-hover:scale-105 transition-all shadow-xs`}>
                    <NodeIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate leading-none">
                        {current.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-450 block truncate font-sans font-medium mt-1">
                      {current.roleLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      ) : (

        /* 2. ROLE-SPECIFIC LOGIN DISPLAY INTERFACES */
        <div className="p-6 space-y-4 bg-slate-50/50 animate-fade-in">
          
          {/* HEADER BACK NAVIGATION BUTTON */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Roles Menu</span>
            </button>

            {/* TOGGLE LOGIN / REGISTER MODAL FOR SYSTEM ELIGIBLE ROLES (PATIENT AND BRANCH ADMIN ONLY) */}
            {(selectedRole === 'patient' || selectedRole === 'branch_admin') && (
              <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); setSuccess(''); }}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="border-b border-slate-200 pb-3 mt-1 text-center sm:text-left">
            {GATEWAYS[selectedRole].badge && (
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-150 rounded uppercase pb-2">
                {GATEWAYS[selectedRole].badge}
              </span>
            )}
            <h3 className="text-sm font-black text-slate-850 mt-0.5">
              {GATEWAYS[selectedRole].name} Portal 
            </h3>
            <p className="text-[11px] text-slate-555 mt-0.5 leading-normal">
              {authMode === 'register' ? 'Set up a new secure healthcare clinical account.' : GATEWAYS[selectedRole].desc}
            </p>
          </div>

          {/* DYNAMIC ERROR / SUCCESS DIRECTIVES */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-fadeIn" id="login-error-msg">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-805 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* REGISTER MODE DYNAMIC EXTRA FIELDS */}
            {authMode === 'register' && selectedRole === 'patient' && (
              <div className="space-y-3 animate-fade-in">
                {/* Patient Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient Name</label>
                  <input
                    required
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-rose-500 rounded-xl text-slate-900 font-medium animate-fade-in"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+1 (555) 019-9231"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-rose-500 rounded-xl text-slate-900 font-mono animate-fade-in"
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood group</label>
                  <select
                    value={patientBloodGroup}
                    onChange={(e) => setPatientBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-rose-500 rounded-xl text-slate-905 font-semibold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <input
                    required
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="E.g. 742 Evergreen Terrace, Springfield"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-rose-500 rounded-xl text-slate-900 font-medium animate-fade-in"
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && selectedRole === 'branch_admin' && (
              <div className="space-y-3 animate-fade-in">
                {/* Admin Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Name</label>
                  <input
                    required
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter administrator name"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-emerald-500 rounded-xl text-slate-900 font-medium animate-fade-in"
                  />
                </div>

                {/* Hospital Name with Branch */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Name with Branch</label>
                  <input
                    required
                    type="text"
                    value={adminBranchId}
                    onChange={(e) => setAdminBranchId(e.target.value)}
                    placeholder="E.g. Mayo Clinic - Downtown Ward"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-emerald-500 rounded-xl text-slate-900 font-semibold animate-fade-in"
                  />
                </div>

                {/* Hospital Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Address</label>
                  <input
                    required
                    type="text"
                    value={adminHospitalAddress}
                    onChange={(e) => setAdminHospitalAddress(e.target.value)}
                    placeholder="E.g. 200 First St SW, Rochester, MN"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-emerald-500 rounded-xl text-slate-900 font-medium animate-fade-in"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+1 (555) 301-4499"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-emerald-500 rounded-xl text-slate-900 font-mono animate-fade-in"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BASE/STANDARD FIELDS: EMAIL ID & PASSWORD */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-medium"
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 focus:outline-hidden focus:border-indigo-600 rounded-xl text-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* BUTTON ACTION */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              {loading 
                ? 'Validating credentials...' 
                : authMode === 'register' 
                  ? 'Sign Up & Register' 
                  : 'Log in'}
            </button>
          </form>


        </div>
      )}
    </div>
  );
}
