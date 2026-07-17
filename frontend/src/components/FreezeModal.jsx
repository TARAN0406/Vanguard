import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, KeyRound, CheckCircle } from 'lucide-react';
import { freezeEmployee } from '../services/api';

export default function FreezeModal({ emp, currentUser, onClose, onSuccess }) {
  const [executing, setExecuting] = useState(false);
  const [stage, setStage] = useState(0); 

  const isExecutive = currentUser.role === 'MD' || currentUser.role === 'CISO';

  const handleFreeze = async () => {
    setExecuting(true);
    setStage(1);
    
    // Simulate multi-stage compliance lock
    setTimeout(() => setStage(2), 800);
    setTimeout(() => setStage(3), 1600);
    
    try {
      await freezeEmployee(emp.id, currentUser?.name || 'SystemAdmin');
      setTimeout(() => {
        setStage(4);
        setTimeout(onSuccess, 1000);
      }, 2400);
    } catch (err) {
      console.error(err);
      setExecuting(false);
      setStage(0);
      alert("Containment Protocol Failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1b1b1b]/80 dark:bg-black/80 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border-t-8 border-[#d83933] dark:border-red-900 border-l border-r border-b border-[#adadad] dark:border-slate-700 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 transition-colors duration-300">
        
        <div className="bg-[#d83933] dark:bg-red-900 text-white px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest m-0">Authorization Required</h2>
            <p className="text-xs font-bold uppercase opacity-80 m-0">SOC Containment Protocol</p>
          </div>
        </div>

        <div className="p-8 font-sans">
          <p className="text-[#1b1b1b] dark:text-slate-300 font-bold mb-6 text-sm leading-relaxed">
            You are about to initiate a complete Zero-Trust Containment Freeze on <span className="text-[#112e51] dark:text-white font-black">{emp.name}</span> (<span className="font-mono">{emp.id}</span>).
          </p>

          <div className="bg-[#f9e8e8] dark:bg-red-950/30 border-l-4 border-[#d83933] dark:border-red-900 p-4 mb-8">
            <h4 className="text-[#d83933] dark:text-red-500 font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2"><ShieldAlert size={14}/> System Actions</h4>
            <ul className="text-xs font-bold text-[#1b1b1b] dark:text-slate-300 space-y-2 uppercase ml-6 list-disc">
              <li>Revoke Active Directory Access</li>
              <li>Terminate all active VPN/SSH sessions</li>
              <li>Block Core Banking System (CBS) login</li>
              <li>Log action to permanent Federal Audit Trail</li>
            </ul>
          </div>

          {!isExecutive ? (
            <div className="bg-[#f0f0f0] dark:bg-slate-950 border border-[#adadad] dark:border-slate-800 p-6 text-center">
               <Lock className="mx-auto text-[#5c5c5c] dark:text-slate-500 mb-3" size={24} />
               <h3 className="text-[#112e51] dark:text-white font-bold uppercase mb-1">Insufficient Clearance</h3>
               <p className="text-[#5c5c5c] dark:text-slate-400 text-xs font-bold">Only CISO or MD level personnel can authorize a containment freeze. Your role: <span className="text-[#d83933] dark:text-red-500">{currentUser.role}</span>.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {executing ? (
                 <div className="bg-[#f0f0f0] dark:bg-slate-950 border border-[#112e51] dark:border-slate-700 p-6 font-mono text-xs space-y-3">
                   <div className={`flex items-center gap-3 ${stage >= 1 ? 'text-[#112e51] dark:text-white font-bold' : 'text-[#adadad] dark:text-slate-600'}`}>
                     {stage > 1 ? <CheckCircle size={14} className="text-[#2e8540] dark:text-emerald-500"/> : stage === 1 ? <div className="w-3.5 h-3.5 border-2 border-[#112e51] dark:border-white border-t-transparent rounded-full animate-spin"></div> : <span className="w-3.5 h-3.5 rounded-full border border-current"></span>}
                     Verifying Executive Signature...
                   </div>
                   <div className={`flex items-center gap-3 ${stage >= 2 ? 'text-[#112e51] dark:text-white font-bold' : 'text-[#adadad] dark:text-slate-600'}`}>
                     {stage > 2 ? <CheckCircle size={14} className="text-[#2e8540] dark:text-emerald-500"/> : stage === 2 ? <div className="w-3.5 h-3.5 border-2 border-[#112e51] dark:border-white border-t-transparent rounded-full animate-spin"></div> : <span className="w-3.5 h-3.5 rounded-full border border-current"></span>}
                     Revoking IAM Tokens...
                   </div>
                   <div className={`flex items-center gap-3 ${stage >= 3 ? 'text-[#112e51] dark:text-white font-bold' : 'text-[#adadad] dark:text-slate-600'}`}>
                     {stage > 3 ? <CheckCircle size={14} className="text-[#2e8540] dark:text-emerald-500"/> : stage === 3 ? <div className="w-3.5 h-3.5 border-2 border-[#112e51] dark:border-white border-t-transparent rounded-full animate-spin"></div> : <span className="w-3.5 h-3.5 rounded-full border border-current"></span>}
                     Severing Core Banking DB Connections...
                   </div>
                   <div className={`flex items-center gap-3 ${stage >= 4 ? 'text-[#2e8540] dark:text-emerald-500 font-bold' : 'text-[#adadad] dark:text-slate-600'}`}>
                     {stage >= 4 ? <CheckCircle size={14} className="text-[#2e8540] dark:text-emerald-500"/> : <span className="w-3.5 h-3.5 rounded-full border border-current"></span>}
                     SUBJECT CONTAINED
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleFreeze}
                   className="w-full bg-[#d83933] dark:bg-red-800 hover:bg-[#a62b26] dark:hover:bg-red-700 text-white font-bold py-4 uppercase tracking-widest text-sm border-b-4 border-black dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                 >
                   <KeyRound size={18} /> Apply Cryptographic Signature & Freeze
                 </button>
               )}
            </div>
          )}

          {!executing && (
            <button 
              onClick={onClose}
              className="w-full mt-4 bg-white dark:bg-slate-800 border-2 border-[#112e51] dark:border-slate-700 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 text-[#112e51] dark:text-slate-300 font-bold py-3 uppercase tracking-widest text-xs transition-colors"
            >
              Cancel Operation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
