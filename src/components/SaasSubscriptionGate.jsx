import React, { useState, useEffect } from 'react';
import { 
  Check, ArrowRight, ShieldCheck, CreditCard, Sparkles, Building, 
  HelpCircle, Clock, CheckCircle2, Award, ShieldAlert, Key, Zap, Lock,
  QrCode, Terminal, AlertTriangle, ChevronRight, RefreshCw, Layers
} from 'lucide-react';

export default function SaasSubscriptionGate({ 
  licenses = [], 
  branchAdminName = 'Branch Administrator',
  branchName = 'City General Clinic',
  onSubscriptionApproved 
}) {
  const [step, setStep] = useState('plan_selection'); // 'plan_selection' | 'payment_gateway' | 'processing' | 'approved'
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fallback plans if licenses is empty (as per user request, if it's empty, we explain why or use adaptive fallbacks)
  const fallbackPlans = [
    { id: 'lic-basic', name: 'Basic Tier Plan', description: 'Covers essential EHR tracking & basic OPD queues', price: 99, duration: 'month' },
    { id: 'lic-standard', name: 'Standard Tier License', description: 'Standard electronic prescriptions & full beds telemetry', price: 199, duration: 'month' },
    { id: 'lic-enterprise', name: 'Enterprise Licensing Tier', description: 'Complete backup redundancy, 2FA logs, and active compliance audits', price: 499, duration: 'month' }
  ];

  const activePlans = licenses && licenses.length > 0 ? licenses : [];

  // Set default selected plan
  useEffect(() => {
    if (activePlans.length > 0 && !selectedPlan) {
      setSelectedPlan(activePlans[0]);
    } else if (activePlans.length === 0) {
      setSelectedPlan(null);
    }
  }, [activePlans, selectedPlan]);

  // Payment states
  const [cardName, setCardName] = useState(branchAdminName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi'
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const [payError, setPayError] = useState('');

  // Processing logging timeline states
  const [processingLogIndex, setProcessingLogIndex] = useState(0);
  const processingTimeline = [
    "Establishing secure TLS token mapping ...",
    "Transmitting payment packets to licensed clearance network ...",
    "Validating secure HIPAA signature protocols ...",
    "Registering active tenant node with ABDM node gateway ...",
    "Provisioning branch workspace access keys ...",
    "Success! Core active licensing token compiled green."
  ];

  // Auto-typing simulator for card format
  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\s?/g, '');
    if (isNaN(Number(rawVal))) return;
    if (rawVal.length > 16) return;
    
    // Split into chunks of 4 characters
    const parts = [];
    for (let i = 0; i < rawVal.length; i += 4) {
      parts.push(rawVal.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\s?/g, '').replace('/', '');
    if (isNaN(Number(val))) return;
    if (val.length > 4) return;
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.trim();
    if (isNaN(Number(val))) return;
    if (val.length > 4) return;
    setCardCvv(val);
  };

  // Launch simulated transaction processor
  const handleProceedPayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setPayError('Security clearance error: Please provide a complete 16-digit credit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setPayError('Security clearance error: Expiry date must be in MM/YY timeline.');
        return;
      }
      if (cardCvv.length < 3) {
        setPayError('Security clearance error: Secure card validation CVV code is truncated.');
        return;
      }
    }
    
    setPayError('');
    setStep('processing');
    setProcessingLogIndex(0);
  };

  // Timeline iterator simulator
  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProcessingLogIndex((prev) => {
          if (prev >= processingTimeline.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('approved');
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Pricing calculations
  const basePrice = selectedPlan ? selectedPlan.price : 0;
  const gstCharge = Math.round(basePrice * 0.18);
  const totalCharge = basePrice + gstCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 flex justify-center items-center backdrop-blur-md p-4 animate-fade-in font-sans">
      <div id="saas-subscription-portal-wrapper" className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Banner header top */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-600 rounded-xl shadow-md text-white">
              <Building className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/40 uppercase font-black tracking-wider">
                SaaS Subscription Gate
              </span>
              <h2 className="text-base font-black tracking-tight mt-0.5">
                MedCore Branch Node Provisioning
              </h2>
            </div>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block font-semibold">{branchAdminName}</span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked Branch: {branchName}
            </span>
          </div>
        </div>

        {/* Progress Stepper indicators */}
        <div className="bg-slate-50 border-b border-slate-150 py-3.5 px-6 flex justify-around items-center text-xs font-mono">
          <div className={`flex items-center gap-2 ${step === 'plan_selection' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 'plan_selection' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
            <span>Plan Subscription</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${step === 'payment_gateway' || step === 'processing' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 'payment_gateway' || step === 'processing' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
            <span>Gateway Checkout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${step === 'approved' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 'approved' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
            <span>Permission Active</span>
          </div>
        </div>

        {/* STEP 1: PLAN SELECT WEBPAGE */}
        {step === 'plan_selection' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Authorize Your Workspace License Active
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                To continue accessing the healthcare administrator tools, select one of the following dynamic SaaS tiers. Your clinical node parameters will automatically adapt to standard HIPAA constraints.
              </p>
            </div>

            {/* Check if licenses database empty */}
            {licenses && licenses.length === 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-850">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-extrabold block text-sm">Tenant Licensing Tiers is Empty</strong>
                  <p className="text-rose-800 leading-relaxed font-sans text-xs">
                    As Tenant Licensing Tiers are empty, the SaaS Plan Tier Enforcements are also empty. Please register licensing plans via the SuperAdmin dashboard to make plans available here.
                  </p>
                </div>
              </div>
            )}

            {/* Cards Grid list / Empty State conditional display */}
            {activePlans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-sans border border-dashed border-slate-205 rounded-2xl bg-slate-50/50">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
                <span className="text-xs font-semibold block text-slate-705">SaaS Plan Tier Enforcements is Empty</span>
                <p className="text-[11px] text-slate-450 mt-1 font-sans">No active subscription plan codes configured. SuperAdmin must register licensing plans first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {activePlans.map((plan) => {
                  const isSelected = selectedPlan && selectedPlan.id === plan.id;
                  return (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`border rounded-2xl p-5 cursor-pointer relative transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-600 shadow-lg ring-1 ring-indigo-500' 
                          : 'bg-white border-slate-205 hover:border-slate-305 hover:bg-slate-50/50 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-3 left-4 bg-indigo-605 text-white px-2.5 py-0.5 text-[9px] rounded-full font-mono font-bold tracking-widest uppercase shadow-xs">
                          Selected Plan
                        </span>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-extrabold">
                            {plan.id?.replace('lic-', '')}
                          </h4>
                          <h3 className="text-sm font-black text-slate-800 tracking-tight mt-0.5">
                            {plan.name}
                          </h3>
                        </div>

                        <p className="text-[11px] text-slate-605 leading-relaxed font-medium min-h-[36px]">
                          {plan.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1 text-slate-800">
                          <span className="text-xl font-black">${plan.price}</span>
                          <span className="text-[9.5px] text-slate-400 font-bold font-mono">/ {plan.duration || 'month'}</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-[10.5px] text-slate-600 font-semibold font-sans">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-550 shrink-0" />
                          <span>Dynamic HIPAA Shield</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-550 shrink-0" />
                          <span>Prescription Engine mapping</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-550 shrink-0" />
                          <span>{plan.id === 'lic-enterprise' ? 'Unlimited database sync' : 'Check quota constraints'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <div className="text-xs font-mono text-slate-500 font-semibold">
                Chosen product: <strong className="text-slate-800">{selectedPlan?.name || 'None'}</strong>
              </div>
              <button
                onClick={() => setStep('payment_gateway')}
                disabled={!selectedPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg font-mono cursor-pointer"
              >
                <span>Proceed to Secure Gateway</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY WEBPAGE */}
        {step === 'payment_gateway' && (
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Payment form column left */}
            <form onSubmit={handleProceedPayment} className="md:col-span-7 space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-mono">
                  SECURE ENDPOINT CHECKOUT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify credential parameters & complete sandbox simulation deposit.
                </p>
              </div>

              {payError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-medium flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              {/* Toggle checkout mode */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-3 rounded-lg text-center transition flex justify-center items-center gap-1.5 cursor-pointer ${paymentMethod === 'card' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-655" />
                  <span>Verified Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-3 rounded-lg text-center transition flex justify-center items-center gap-1.5 cursor-pointer ${paymentMethod === 'upi' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>UPI Live QR Code</span>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Cardholder Billing Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-250 focus:border-indigo-500 rounded-xl outline-none font-semibold"
                      placeholder="e.g. Administrator General"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      16-Digit Vault Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full text-xs p-2.5 pl-10 bg-slate-50 focus:bg-white border border-slate-250 focus:border-indigo-500 rounded-xl outline-none font-mono font-bold tracking-widest"
                        placeholder="•••• •••• •••• ••••"
                      />
                      <CreditCard className="w-4 h-4 text-slate-408 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Expiry Date MM/YY
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-250 focus:border-indigo-500 rounded-xl outline-none font-mono text-center font-bold"
                        placeholder="12/28"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                        <span>CVV Code</span>
                        <button
                          type="button"
                          onClick={() => setIsCvvVisible(!isCvvVisible)}
                          className="text-[9px] text-indigo-500 hover:underline cursor-pointer"
                        >
                          {isCvvVisible ? 'Hide' : 'Show'}
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type={isCvvVisible ? "text" : "password"}
                          required
                          value={cardCvv}
                          onChange={handleCvvChange}
                          className="w-full text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-250 focus:border-indigo-500 rounded-xl outline-none font-mono text-center font-bold"
                          placeholder="•••"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-205 rounded-2xl flex flex-col items-center justify-center space-y-3.5 animate-fade-in text-center">
                  <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
                    {/* Generates standard sandbox payment QR code */}
                    <div className="w-36 h-36 bg-slate-100 flex flex-col items-center justify-center font-mono text-slate-400 border border-dashed border-slate-350 relative rounded-lg">
                      <QrCode className="w-16 h-16 text-slate-800" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold mt-1 text-slate-505">
                        Scan to Approve
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Deploy Sandbox Payment UPI Node</span>
                    <span className="text-[10px] text-slate-450 block font-mono">medcore-gateway@ybl • Secure Dynamic Payload</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-[10px] text-indigo-700 font-sans max-w-sm">
                    💡 <strong>Test Mode Tip:</strong> For mock sandbox scanning approval, you can trigger payment processing instantly by clicking standard checkout below.
                  </div>
                </div>
              )}

              {/* Form trigger buttons */}
              <div className="pt-4 border-t border-slate-150 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plan_selection')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 font-mono transition cursor-pointer"
                >
                  Change Plan
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Process & Approve License State (${totalCharge})</span>
                </button>
              </div>
            </form>

            {/* Billing summary card right */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
              <div className="space-y-4.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  BILLING LEDGER
                </span>

                <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block font-mono">Chosen Provision Plan</span>
                  <div className="font-sans font-semibold text-slate-805 text-xs">{selectedPlan?.name}</div>
                  <p className="text-[10px] text-slate-450 font-medium leading-normal">{selectedPlan?.description}</p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium font-sans">Monthly Base Rate</span>
                    <span className="font-mono font-bold text-slate-700">${basePrice}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium font-sans">National GST Level (18%)</span>
                    <span className="font-mono font-semibold text-slate-705">+ ${gstCharge}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-505 font-medium font-sans">Transactional Clearance Fee</span>
                    <span className="font-mono text-emerald-600 font-semibold">FREE</span>
                  </div>
                </div>
              </div>

              {/* Total calculations frame */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10.5px] uppercase font-mono text-slate-400 tracking-wider">MONTHLY CHARGE</span>
                  <span className="text-lg font-black font-mono text-indigo-400">${totalCharge}.00</span>
                </div>
                <div className="text-[9.5px] text-slate-500 leading-normal font-medium font-sans">
                  The active plan parameters will apply automatically inside the hospital framework upon payment clearance.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSACTION TIMELINE LOG (PROCESSING) */}
        {step === 'processing' && (
          <div className="p-10 flex flex-col items-center justify-center space-y-6 animate-pulse">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center relative">
              <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
            </div>

            <div className="text-center space-y-1.5 max-w-md">
              <h3 className="text-sm font-black text-slate-800 tracking-wider font-mono">
                CLEARING SECURITY TRANSACTIONS
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Connecting credentials to centralized MedCore HIPAA compliance node ledger ...
              </p>
            </div>

            {/* Custom Terminal system output simulation */}
            <div className="bg-slate-950 rounded-xl p-4 w-full max-w-lg font-mono text-xs text-indigo-300 space-y-2 text-left shadow-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] border-b border-sidebar-slate-800 pb-1.5 uppercase font-bold tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Core Log Stream</span>
              </div>
              <div className="space-y-1 min-h-[90px] text-[10.5px]">
                {processingTimeline.slice(0, processingLogIndex + 1).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span className="text-slate-500 select-none">&gt;</span>
                    <span className={idx === processingLogIndex ? 'text-white' : 'text-indigo-400'}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ACCESS APPROVED AND WORKSPACE INITIALIZED */}
        {step === 'approved' && (
          <div className="p-8 md:p-10 text-center space-y-6 flex flex-col items-center justify-center animate-fade-in-up">
            
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center justify-center relative shadow-md">
              <Check className="w-8 h-8 text-emerald-505" />
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 animate-pulse">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1.5 max-w-xl mx-auto">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded font-extrabold uppercase uppercase tracking-wider">
                LICENSED SECURED METRO
              </span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Gateway Cleared: Portal Access Approved
              </h2>
              <p className="text-xs text-slate-505 leading-relaxed font-sans font-medium">
                SaaS Plan subscription for <strong>{selectedPlan?.name}</strong> successfully provisioned on hospital node ID. All administrative modules, ward controllers, and invoice registries are verified and compiled.
              </p>
            </div>

            {/* Information badges checklist */}
            <div className="grid grid-cols-2 gap-3.5 max-w-md w-full text-left text-[11px] bg-slate-50 border border-slate-150 p-4 rounded-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-705">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>HIPAA Compliance Logs</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-705">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live telemetry feed active</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-705">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>EHR Sync active</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-705">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Authorized role token valid</span>
                </div>
              </div>
            </div>

            {/* Launch workspace button */}
            <button
              onClick={() => onSubscriptionApproved(selectedPlan)}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition font-mono shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer mt-2"
            >
              <span>Initialize Connected Dashboard</span>
              <ArrowRight className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
