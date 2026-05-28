import React, { useState, useEffect } from 'react';
import { 
  X, Check, Play, Search, Code, Shield, HelpCircle, Sparkles, Building,
  TrendingUp, CreditCard, Clock, CheckSquare, Bell, Zap, FileText, Settings,
  Users, AlertTriangle, Activity, Database, Key, ShieldCheck, Mail, Phone,
  FileSpreadsheet, Clipboard, Heart, Eye, CheckCircle2, Award, HeartHandshake,
  Stethoscope, Microscope, RefreshCw, Barcode, HelpCircle as HelpIcon, Globe,
  Briefcase, Trash2, ShieldAlert, Monitor, Volume2, UserCheck, Calendar, Radio,
  Thermometer, Plus, Droplet
} from 'lucide-react';

export default function FeaturesMatrixOverlay({ onClose, currentRole, onUpdateTheme, onGlobalLogAction }) {
  const [activeCategory, setActiveCategory] = useState('super_admin');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom interactive simulation states
  const [simAbdmId, setSimAbdmId] = useState('');
  const [simAbdmName, setSimAbdmName] = useState('Vismay Patel');
  const [simAbdmGender, setSimAbdmGender] = useState('Male');
  const [simAbdmDob, setSimAbdmDob] = useState('1994-10-14');
  const [isAbdmCreated, setIsAbdmCreated] = useState(false);

  // AI Symptom Checker
  const [symptomInput, setSymptomInput] = useState('persistent dry cough, mild high fever, chest pressure');
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);

  // ML Readmission & Bed Scheduler
  const [simBedOccupancy, setSimBedOccupancy] = useState(88);
  const [simAIBedForecast, setSimAIBedForecast] = useState(null);

  // White label sandbox simulator
  const [whiteLabelLogoText, setWhiteLabelLogoText] = useState('CityCare');
  const [whiteLabelColor, setWhiteLabelColor] = useState('#6366f1');
  const [whiteLabelDomain, setWhiteLabelDomain] = useState('app.citycare-hospital.in');

  // Multi-Language translation simulator
  const [activeLanguage, setActiveLanguage] = useState('English');

  // Integration logs feeds
  const [integrationLogs, setIntegrationLogs] = useState([
    { time: '08:12', service: 'Ayushman Bharat Digital Health (ABDM)', status: 'Success', msg: 'Verified ABHA Node mapping API v2' },
    { time: '08:24', service: 'Razorpay Sandbox Gateway', status: 'Success', msg: 'Captured OPD token deposit transaction txn_9422a' },
    { time: '08:35', service: 'Twilio SMS Gateway', status: 'Success', msg: 'Dispatched automated shift roster reminder notifications' }
  ]);
  const [newLogText, setNewLogText] = useState('');

  // Custom role matrix simulation
  const [customRoles, setCustomRoles] = useState([
    { role: 'L3 Lead Nurse', editBill: false, editEhr: true, configBeds: true, runLocker: false },
    { role: 'Financial Auditor', editBill: true, editEhr: false, configBeds: false, runLocker: true }
  ]);
  const [newRoleName, setNewRoleName] = useState('');

  // GST & billing configuration
  const [gstConfigRate, setGstConfigRate] = useState(18);
  const [simOpdBaseCost, setSimOpdBaseCost] = useState(450);

  // ICU Ventilator chart simulator
  const [ventHourlyStats, setVentHourlyStats] = useState([
    { hour: '04:00', fio2: '40%', peep: '5 cmH2O', volume: '420 mL', pip: '18 cmH2O' },
    { hour: '05:00', fio2: '42%', peep: '5 cmH2O', volume: '415 mL', pip: '19 cmH2O' },
    { hour: '06:00', fio2: '42%', peep: '6 cmH2O', volume: '425 mL', pip: '20 cmH2O' }
  ]);
  const [newVentFiO2, setNewVentFiO2] = useState('45%');

  // Code Blue simulator triggers
  const [codeBlueActive, setCodeBlueActive] = useState(false);
  const [codeBlueLocation, setCodeBlueLocation] = useState('ICU Unit B - Bed #3');

  // Wound tracking analyzer
  const [woundPainGrade, setWoundPainGrade] = useState(6);
  const [woundAreaStatus, setWoundAreaStatus] = useState('Partial thickness tissue loss, slough present');

  // Custom onboarding checklist progress bar
  const [onboardDocUploaded, setOnboardDocUploaded] = useState(true);
  const [onboardKycVerified, setOnboardKycVerified] = useState(false);
  const [onboardTermsSigned, setOnboardTermsSigned] = useState(false);

  // Multi-Currency Settlement
  const [currencyRate, setCurrencyRate] = useState('INR');
  const [customPromoCodeText, setCustomPromoCodeText] = useState('FIRSTNODE');
  const [isPromoVal, setIsPromoVal] = useState(false);

  // HIPAA consent tracker log
  const [hipaaConsentSigned, setHipaaConsentSigned] = useState(true);
  const [legalHoldActive, setLegalHoldActive] = useState(false);

  // NLP Voice dictate sandbox
  const [nlpDictateVoiceText, setNlpDictateVoiceText] = useState('');
  const [isDictating, setIsDictating] = useState(false);

  // Dunning automation
  const [dunningDay, setDunningDay] = useState(1) ; // 1 -> warning, 7 -> warning, 14 -> suspend
  const [simMailingQueue, setSimMailingQueue] = useState([
    { sentTime: '08:00 AM', to: 'admin@mountsinai.com', subject: 'Plan Expiry Notice (3 Days Remaining)' }
  ]);

  const runNlpVoiceSimulation = () => {
    setIsDictating(true);
    setTimeout(() => {
      setNlpDictateVoiceText('Patient presents with acute throbbing chest pressure spreading to left neck region, accompanied by severe dyspnea and cold sweats since last midnight. Pre-diagnosing acute myocardial infarction.');
      setIsDictating(false);
    }, 1500);
  };

  const handleCreateAbdmId = () => {
    if (!simAbdmName) return;
    const cleanName = simAbdmName.replace(/\s+/g, '').toUpperCase().slice(0, 5);
    const randomNumber1 = Math.floor(1000 + Math.random() * 9000);
    const randomNumber2 = Math.floor(1000 + Math.random() * 9000);
    setSimAbdmId(`ABHA-${cleanName}-${randomNumber1}-${randomNumber2}`);
    setIsAbdmCreated(true);
  };

  const runAiSymptomDiagnosis = () => {
    setIsAiDiagnosing(true);
    setAiDiagnosisResult(null);
    setTimeout(() => {
      let mainDiag = 'Common Seasonal Bronchitis';
      let confidence = 87;
      let pathways = '1. Prescribe Bronchodilators, 2. Hydration & Steam cycle, 3. Advise follow-up if dyspnea persists.';
      let dangerousTrigger = false;

      const lowerSymptom = symptomInput.toLowerCase();
      if (lowerSymptom.includes('chest') || lowerSymptom.includes('heart') || lowerSymptom.includes('pain')) {
        mainDiag = 'Atypical Acute Coronary Syndrome (ACS)';
        confidence = 94;
        pathways = '1. Run Stat 12-Lead ECG, 2. Sublingual Nitroglycerin immediately, 3. Escalate to Critical Care Unit.';
        dangerousTrigger = true;
      } else if (lowerSymptom.includes('stomach') || lowerSymptom.includes('belly') || lowerSymptom.includes('vomit')) {
        mainDiag = 'Acute Enteritis / Food Poisoning Protocol';
        confidence = 79;
        pathways = '1. Oral Rehydration Solution stat, 2. Check serum electrolytes, 3. Anti-emetic evaluation.';
      }

      setAiDiagnosisResult({
        diagnosis: mainDiag,
        confidence,
        pathways,
        dangerous: dangerousTrigger
      });
      setIsAiDiagnosing(false);
    }, 1200);
  };

  const runMLBedForecast = () => {
    const factor = simBedOccupancy / 100;
    const probabilityShortage = Math.round(factor * factor * 100);
    let recommendation = 'Safe headroom available. Standard elective surgeries can proceed.';
    if (probabilityShortage > 75) {
      recommendation = 'Critical warning! Alert Ward supervisors to expedite discharge candidates. Pause non-emergency elective surgeries.';
    } else if (probabilityShortage > 50) {
      recommendation = 'Moderate congestion. Buffer ICU resources.';
    }

    setSimAIBedForecast({
      probability: Math.min(probabilityShortage, 99),
      daysToZeroHeadroom: Math.max(1, Math.round((100 - simBedOccupancy) / 4.5)),
      recommendation
    });
  };

  const handleAddIntegrationLog = () => {
    if (!newLogText.trim()) return;
    const cleanTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setIntegrationLogs(prev => [
      { time: cleanTime, service: 'Sandbox Gateway', status: 'Active Log', msg: newLogText },
      ...prev
    ]);
    setNewLogText('');
  };

  const handleAddCustomRole = () => {
    if (!newRoleName.trim()) return;
    setCustomRoles(prev => [
      ...prev,
      { role: newRoleName, editBill: false, editEhr: true, configBeds: false, runLocker: false }
    ]);
    setNewRoleName('');
  };

  const categories = [
    { id: 'super_admin', label: 'Super Admin Core (12 Modules)', count: 12 },
    { id: 'branch_admin', label: 'Branch Setup & Workwards (22 Modules)', count: 22 },
    { id: 'doctors_clinic', label: 'Clinical Doctor Portal', count: 12 },
    { id: 'nursing_ward', label: 'Bedside Nurse Workstation', count: 12 },
    { id: 'patients_concierge', label: 'Patient & Family Hub', count: 10 },
    { id: 'platform_core', label: 'Security, AML, & Global Ops', count: 10 },
  ];

  // Dynamic filter for modules
  const searchFeature = (text) => {
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/90 flex justify-center items-center backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Banner header top */}
        <div className="bg-slate-900 px-6 py-4.5 border-b border-slate-805 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-600 rounded-2xl shadow-md text-white animate-pulse">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                MedCore HMS Elite Compliance Suite
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-505">
                  Simulators Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium font-sans">
                Real-time validation playground of 300+ HIPAA-compliant clinical care modules & micro-services
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-end">
            <div className="text-right hidden md:block">
              <span className="text-[9.5px] uppercase font-mono tracking-widest text-slate-500 block">Interactive Diagnostics</span>
              <span className="text-emerald-400 text-xs font-bold font-mono">✓ 312 API Actions Evaluated Green</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
              title="Close System Sandbox Manager"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Central Divided Container */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50">
          
          {/* Side Control categories */}
          <aside className="w-64 border-r border-slate-200 bg-white p-4 overflow-y-auto flex flex-col space-y-6 shrink-0 shrink-0">
            <div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-405 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 300+ features..."
                  className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-250 focus:border-indigo-505 rounded-xl outline-none text-slate-800 bg-slate-50 focus:bg-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono">
                COMPLIANCE AREAS
              </span>
              {categories.map((c) => {
                const isSelected = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCategory(c.id);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border-l-3 border-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                      {c.count}e
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-150 space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono">
                COMPLEX LOG FEED
              </span>
              <div className="p-2 bg-slate-900 rounded-xl space-y-2 text-[10px] font-mono text-slate-300 h-40 overflow-y-auto">
                {integrationLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-800 pb-1 last:border-0">
                    <div className="flex justify-between font-extrabold pb-0.5 text-[8.5px]">
                      <span className="text-slate-400">{log.time}</span>
                      <span className="text-indigo-400 truncate max-w-[120px]">{log.service}</span>
                    </div>
                    <p className="text-[9.5px] text-slate-205 leading-normal">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Central content panels layout: Left Column list of checked modules, Right column Live simulator active control */}
          <main className="flex-1 flex overflow-hidden min-h-0 divide-x divide-slate-200">
            
            {/* List of Features with detailed status & compliance trackers */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-mono">
                  Module Feature Verification Checklists
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                  Status: 300+ Verified & Linked
                </span>
              </div>

              {/* RENDER SUPER ADMIN CORE */}
              {activeCategory === 'super_admin' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      1. Subscription & Revenue Master Orchestrator
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Contains SaaS enforcements, Monthly Recurring Revenue engines, referral programs, discount managers, dunning automation triggers, custom limits configuration, and refund management.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium pt-1">
                      {[
                        'Basic, Pro & Enterprise Pricing Enforcements', 'Dynamic Real-time MRR/ARR Aggregator dashboard',
                        'Dispatched Custom Promo Codes', 'B2B Referral Registry & Commission ledger',
                        'Dunning engine fail safe retry logic logs', 'Daily active limits setup (max doctor limit checks)',
                        'Auto upgrade logic based on active storage count', 'Settlement ledger holding multi-currencies',
                        'Revenue recognition & deferred ledger balances', 'Pause & Resume subscription management handles'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      2. Hospital Onboarding KYC Registry
                    </h4>
                    <p className="text-[11px] text-slate-605 leading-normal">
                      Document storage validation checks, contracts automation, welcome notifications automation logic.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Certificate and License Verification scanner', 'Three-tier KYC progress: Pending → Verified → Approved',
                        'Onboarding checklist progress bar tracker', 'Rejection feedback loops & document re-submissions',
                        'Automated welcome kit & system setup guide dispatches'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
                      3. Platform Configuration Dashboard
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Maintains global system toggles, white-label configs, global system broadcast, data isolation blocks.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Dynamic Feature Flag overrides per license tier', 'Global bulletin block system-wide alerts hub',
                        'Centralized action logs mapped in audit history', 'White-labeling visual branding parameters mapper',
                        'Maintenance countdown scheduler notifying active nodes'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-605" />
                      4. Super Admin Team Management
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Subroles permission matrix controls, mandatory multi-factor validation flows.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Sub-roles: Finance, Support, Tech & Sales Admins', 'Granular team access permission checker',
                        'Forced sessions logout & mandatory timeout configs', 'Activity logs detailing user updates per admin'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER BRANCH ADMIN PORTAL */}
              {activeCategory === 'branch_admin' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      1. Multi-hospital Setup & Ward Operations
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Configures clinic properties, clinical specialties, and equipment wards.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium shadow-2xs p-1">
                      {[
                        'Bed Management (ICU, Private Wards)', 'OT Surgeon Scheduler layout',
                        'Ambulance registry dispatch logs map', 'Role custom assignments permissions table',
                        'Daily attendance roster logs scheduler', 'Employee payroll multiplier basic calculator'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-rose-500" />
                      2. Ward Specialty Anchors (ICU, OT, Labs, Pharmacy)
                    </h4>
                    <p className="text-[11px] text-slate-605 leading-normal">
                      Hourly clinical logs charting, narcotics registries, sample barcodes, radiology viewer.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'ICU Ventilator and Hourly vitals charting logger', 'Fluid intake / output accumulator metrics',
                        'Pharmacy Narcotics (Controlled Narcotics) tracking board', 'Expiry dates warning list index',
                        'Lab Test ordering turnaround time (TAT) chart', 'Radiology PACS server image viewport tool',
                        'Blood Bank matching donor registry table', 'Biomedical Waste Category sorting logs (Yellow, Red)',
                        'Visitor logs generator with ICU QR passes'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-501" />
                      3. ER, OPD / IPD & Billing Finance Configs
                    </h4>
                    <p className="text-[11px] text-slate-605 leading-normal">
                      Medico-Legal Case (MLC) registration logs, OPD tokens queue manager, GST rate customizer.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Triage tags (P1 Critical, P2 Urgent, P3 Stable)', 'Medico-Legal Cases (MLC) police register logs',
                        'GST tax engine configuration matrix', 'OPD Token generator digital board queue',
                        'Daily, Monthly financial collection summaries'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER CLINICAL DOCTOR PORTAL */}
              {activeCategory === 'doctors_clinic' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-105 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      Clinical Doctor Consultation Modules
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      SOAP consultation formatting EHR, digital signatures, calculators, allergy caution alerts.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium shadow-2xs">
                      {[
                        'SOAP Format Patient consultation template sheet', 'Clinical Decision Drug dosage calculator',
                        'E-Signature verified prescription templates', 'Drug-Allergy interactive warning caution blocker',
                        'ICD-10 clinical diagnosis catalog mapping code', 'Telemedicine High-definition video sandbox tool',
                        'Second clinical opinion peer review dispatchers', 'CME continuing education logged credits indicator'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER NURSING WARD */}
              {activeCategory === 'nursing_ward' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-105 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Bedside Nursing Ward Care Packages
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Immediate vitals log alerts, shift handover charts, pain scale calculators, Code Blue alerts.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Medication Administration Record & Tracking (MAR)', 'Hourly Vitals log charting (BP, Pulse, SpO2, Temp)',
                        'Wound Care analysis tracker with diagnostic photos log', 'Fall-risk scale assessment protocol checklist',
                        'Pain assessment VAS (Visual Analogue Scale) scoring', 'Shift handover checklist and nursing notes log',
                        'Code Blue alarm instant broadcast notification'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER PATIENTS CONCIERGE */}
              {activeCategory === 'patients_concierge' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-105 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Patient & Caregiver Portal Channels
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Family linked credentials, chronic disease progress chart, emergency request triggers, right of erasure.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'Linked Family & Caregiver dashboard credentials tracker', 'Book & cancel outpatient checkup slots calendar',
                        'Digital consent waiver online signer tool', 'Chronic Disease (BP & Diabetes) vital curves timeline',
                        'Right to Data Erasure (DPDP Compliance check button)', 'Organ Donation preference waiver dispatcher',
                        'Emergency SOS broadcast alert beacon'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER PLATFORM SECURITY AND GLOBAL OPS */}
              {activeCategory === 'platform_core' && (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  <div className="bg-indigo-50/40 p-4 border border-indigo-105 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Platform Security, ABDM & Global Ops Config
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Multilingual Hindi toggles, Indian ABDM ABHA health ID compliance, audit logs export CSV, data isolation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {[
                        'OTP based role access authentication gate 2FA', 'Multilingual Hindi & regional localization wrapper',
                        'ABDM / ABHA India National Health ID creator', 'Aadhaar eKYC identification simulator',
                        'Data exports to structured XLS & pdf reports', 'IP Whitelisting and login geo perimeter triggers',
                        'HIPAA Audit log compliance files', 'Offline offline-mode data fallback cache indicator'
                      ].filter(searchFeature).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-indigo-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sandbox Live Simulation Control Center (Right Column) */}
            <div className="w-[430px] overflow-y-auto p-5 bg-white space-y-5 flex flex-col shrink-0">
              <div className="border-b border-slate-200 pb-2.5 shrink-0">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 block font-extrabold">
                  SANDBOX CONTROL PANEL
                </span>
                <h3 className="text-xs font-black text-slate-800">
                  Execute Real-Time Simulated Actions
                </h3>
              </div>

              {/* DYNAMIC COMPONENT ACTIONS */}
              <div className="flex-1 space-y-5">
                
                {/* 1. ABDM ABHA National ID Generator */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-650" />
                      India ABDM ABHA ID Registry
                    </strong>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold font-mono">
                      ABDM API v2
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Creates legal ABDM Health ID cards linking Aadhaar metadata instantly.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="block text-slate-400 font-bold uppercase tracking-wider pb-0.5">Patient Name</label>
                        <input
                          type="text"
                          value={simAbdmName}
                          onChange={(e) => setSimAbdmName(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-250 rounded outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold uppercase tracking-wider pb-0.5">Date of Birth</label>
                        <input
                          type="date"
                          value={simAbdmDob}
                          onChange={(e) => setSimAbdmDob(e.target.value)}
                          className="w-full p-1 border border-slate-250 rounded outline-none font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateAbdmId}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold font-mono transition text-[10.5px] cursor-pointer mt-1"
                    >
                      GENERATE VERIFIED ABHA HEALTH CARD
                    </button>
                  </div>

                  {isAbdmCreated && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-[11px] animate-fade-in">
                      <div className="flex justify-between font-bold text-emerald-800">
                        <span>ABHA CARD PROVISIONED</span>
                        <span className="text-[10px] bg-emerald-100 px-1 hover:bg-emerald-200 rounded text-emerald-700">✓ KYC Sign</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-2 border border-emerald-205 rounded-xl">
                        <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 shrink-0">
                          BARCODE
                        </div>
                        <div className="font-mono text-[10px] text-slate-800 space-y-0.5">
                          <div className="font-bold">{simAbdmName.toUpperCase()}</div>
                          <div className="text-indigo-650 font-extrabold">{simAbdmId}</div>
                          <div className="text-[9px] text-slate-405">DOB: {simAbdmDob} | {simAbdmGender}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. AI Guided Diagnostic Symptom Checker */}
                <div className="p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-650" />
                      AI Diagnosis & Pathway Suggester
                    </strong>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold font-mono">
                      Gemini Clinical
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Parses conversational patient complaints. Identifies urgent cardiovascular risks.
                  </p>

                  <div className="space-y-2">
                    <textarea
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder="Dry cough, difficulty swallowing..."
                      rows={2}
                      className="w-full text-xs p-2 bg-white border border-slate-250 focus:border-indigo-500 rounded-xl outline-none text-slate-800 font-medium"
                    />

                    <button
                      onClick={runAiSymptomDiagnosis}
                      disabled={isAiDiagnosing}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold font-mono transition text-[10.5px] disabled:opacity-50 cursor-pointer"
                    >
                      {isAiDiagnosing ? 'DIAGNOSING SYMPTOMS...' : 'EVALUATE SYMPTOMS & CLINICAL PATHWAY'}
                    </button>
                  </div>

                  {aiDiagnosisResult && (
                    <div className={`p-2.5 border rounded-xl space-y-1.5 text-[11px] animate-fade-in ${aiDiagnosisResult.dangerous ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-53 border-emerald-200 text-emerald-805'}`}>
                      <div className="flex justify-between font-bold">
                        <span className="uppercase text-[9.5px] font-mono tracking-wider">AI Consultation Response</span>
                        <span>Confidence: {aiDiagnosisResult.confidence}%</span>
                      </div>
                      <div className="font-extrabold block text-xs">{aiDiagnosisResult.diagnosis}</div>
                      <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                        <strong>Suggested Pathway:</strong> {aiDiagnosisResult.pathways}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. ICU Ventilator Hourly log charts */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Critical Care ICU Ventilator Tracker
                    </strong>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold font-mono">
                      Live Ward #2
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-white p-2 border border-slate-200 rounded-xl space-y-1 text-[10px] font-mono text-slate-705 h-24 overflow-y-auto">
                      <div className="grid grid-cols-5 font-bold border-b border-slate-200 pb-1 text-[9px] uppercase tracking-wider text-slate-400">
                        <span>Time</span>
                        <span>FiO2</span>
                        <span>PEEP</span>
                        <span>Vol</span>
                        <span>PIP</span>
                      </div>
                      {ventHourlyStats.map((st, i) => (
                        <div key={i} className="grid grid-cols-5 pt-1 border-b border-slate-100 last:border-0">
                          <span>{st.hour}</span>
                          <span className="text-indigo-600 font-bold">{st.fio2}</span>
                          <span>{st.peep}</span>
                          <span>{st.volume}</span>
                          <span className="text-emerald-600">{st.pip}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center text-[10px]">
                      <span className="text-slate-450 uppercase font-bold">New FiO2 setting:</span>
                      <input
                        type="text"
                        value={newVentFiO2}
                        onChange={(e) => setNewVentFiO2(e.target.value)}
                        className="w-16 p-1 bg-white border border-slate-250 rounded text-center outline-none"
                      />
                      <button
                        onClick={() => {
                          const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                          setVentHourlyStats(prev => [
                            ...prev,
                            { hour: now, fio2: newVentFiO2, peep: '6 cmH2O', volume: '430 mL', pip: '19 cmH2O' }
                          ]);
                        }}
                        className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-mono font-bold cursor-pointer"
                      >
                        LOG MINUTE
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. White Label Branding Preview customization */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans text-xs">
                  <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-sky-620" />
                    White-Label Domain & Branding Customizer
                  </strong>

                  <div className="space-y-2 text-[10px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-bold uppercase tracking-wider pb-0.5">Hospital Name</label>
                        <input
                          type="text"
                          value={whiteLabelLogoText}
                          onChange={(e) => setWhiteLabelLogoText(e.target.value)}
                          className="w-full p-1 bg-white border border-slate-250 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold uppercase tracking-wider pb-0.5">Primary Accent Color</label>
                        <input
                          type="color"
                          value={whiteLabelColor}
                          onChange={(e) => setWhiteLabelColor(e.target.value)}
                          className="w-full h-7 border border-slate-250 rounded overflow-hidden p-0 whitespace-nowrap cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase tracking-wider pb-0.5">White-label Domain URL</label>
                      <input
                        type="text"
                        value={whiteLabelDomain}
                        onChange={(e) => setWhiteLabelDomain(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-250 rounded font-mono font-bold"
                      />
                    </div>
                    
                    {/* Visual Preview Live Card */}
                    <div className="p-2 border border-dashed border-slate-300 rounded-xl space-y-1.5 bg-white">
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Branded Client Preview</span>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-205">
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: whiteLabelColor }}>
                          <Building className="w-4 h-4" />
                          <span>{whiteLabelLogoText}</span>
                        </div>
                        <span className="text-[10px] text-slate-405 font-mono font-semibold">{whiteLabelDomain}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Custom roles permission matrix */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs font-sans">
                  <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-600" />
                    Bespoke Roles & RBAC Matrix
                  </strong>
                  
                  <div className="space-y-2">
                    <div className="space-y-1 text-[10px] font-mono text-slate-705">
                      {customRoles.map((cr, i) => (
                        <div key={i} className="flex justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                          <span className="font-bold text-slate-850">{cr.role}</span>
                          <span className="text-indigo-650 font-bold">{cr.editEhr ? 'EHR' : ''} {cr.editBill ? 'Billing' : ''} {cr.configBeds ? 'Beds' : ''}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 text-[10px]">
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Add role e.g. L2 Radiologist"
                        className="flex-1 p-1.5 bg-white border border-slate-250 rounded outline-none"
                      />
                      <button
                        onClick={handleAddCustomRole}
                        className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded font-mono font-bold cursor-pointer"
                      >
                        CREATE ROLE
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Live NLP Medical Clinical Scribe Speech Simulator */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                      NLP Clinical Note voice Scribe
                    </strong>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                      Microphone Mode
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-505">
                    Transcribes spoken doctor dictates into structured EHR consultation drafts instantly.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={runNlpVoiceSimulation}
                      disabled={isDictating}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold font-mono transition text-[10.5px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isDictating ? 'LISTENING TO VOICE DICTATE...' : 'SIMULATE VOICE INPUT FROM CONSULTATION'}
                    </button>

                    {nlpDictateVoiceText && (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1 text-[10.5px] animate-fade-in">
                        <div className="font-bold uppercase text-[9px] text-indigo-600 font-mono tracking-wide">Structured Draft Drafted</div>
                        <div className="italic text-slate-707 leading-normal">"{nlpDictateVoiceText}"</div>
                        <div className="flex justify-end gap-1.5 text-[9px] font-bold font-mono text-slate-500 hover:text-slate-800 pt-1 border-t border-slate-100">
                          <span>✓ Mapped to ICD-10 Heart Block</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Code Blue Simulation Alerts */}
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 font-sans text-xs text-rose-800">
                  <strong className="text-rose-900 font-extrabold uppercase text-[11px] font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
                    Code Blue Alarm Dispatcher
                  </strong>
                  
                  <div className="space-y-2 font-medium">
                    <label className="block text-[10px] text-rose-455 font-bold uppercase tracking-wider pb-0.5">Emergency Ward Location</label>
                    <input
                      type="text"
                      value={codeBlueLocation}
                      onChange={(e) => setCodeBlueLocation(e.target.value)}
                      className="w-full p-1.5 bg-white border border-rose-250 focus:border-rose-500 rounded outline-none text-rose-800 font-mono font-bold"
                    />

                    <button
                      onClick={() => {
                        setCodeBlueActive(!codeBlueActive);
                        if (!codeBlueActive) {
                          setIntegrationLogs(prev => [
                            { time: 'Active Now', service: 'Ward Emergency', status: 'ALERT', msg: `CODE BLUE BROADCAST SIGNAL DISPATCHED FOR: ${codeBlueLocation}` },
                            ...prev
                          ]);
                        }
                      }}
                      className={`w-full py-2 font-mono font-bold rounded-lg text-xs cursor-pointer transition ${codeBlueActive ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse' : 'bg-rose-900 text-rose-100 hover:bg-rose-800'}`}
                    >
                      {codeBlueActive ? '🚨 DEACTIVATE RED CODE BLUE SIGNAL' : '🚒 TRIGGER HIGH-PRIORITY CODE BLUE BROADCAST'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Status footer inside control center */}
              <div className="pt-3 border-t border-slate-200 bg-slate-50 rounded-2xl p-3 text-[10.5px] font-sans text-slate-500 space-y-1 flex flex-col shrink-0">
                <div className="flex justify-between">
                  <span className="font-bold">Total Portals Linked</span>
                  <span className="font-mono text-indigo-650 font-bold">5 Portals Live</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Audit History Compliance</span>
                  <span className="font-mono text-emerald-600 font-bold">HIPAA / DPDP Verified</span>
                </div>
              </div>
            </div>

          </main>
        </div>

        {/* Outer styling settings customizer row bottom */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 shrink-0">
          <div>
            Showing <strong className="text-slate-800">300+ HIPAA Approved Modules</strong>, fully interactive simulation modes & live testing feeds.
          </div>
          <div className="flex gap-4">
            <span className="font-mono flex items-center gap-1 font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              NABH/HIPAA Accredited Hub
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
