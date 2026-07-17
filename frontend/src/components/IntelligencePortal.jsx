import React, { useState, useEffect, useRef } from 'react';
import { getEmployeeById, investigateEmployee } from '../services/api';
import { ShieldAlert, Terminal, Lock, Activity, Server, FileText, ChevronLeft, MapPin, Briefcase, ChevronRight, Cpu } from 'lucide-react';
import FreezeModal from './FreezeModal';

export default function IntelligencePortal({ empId, onBack, currentUser, refreshData }) {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [empId]);

  const fetchData = async () => {
    try {
      const res = await getEmployeeById(empId);
      setEmp(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleInvestigate = async () => {
    setInvestigating(true);
    setTerminalOutput(prev => [...prev, `[SYS] Initiating Deep Forensic LLM Analysis for ${emp.name}...`, `[SYS] Extracting behavioral telemetry over 30 days...`, `[SYS] Feeding vectors into Gemini Intelligence Model...`]);
    try {
      const res = await investigateEmployee(empId);
      setEmp(prev => ({ ...prev, investigationResult: res.data.report }));
      
      const sections = res.data.report.split('\n\n');
      sections.forEach((sec, idx) => {
        setTimeout(() => {
          setTerminalOutput(prev => [...prev, sec]);
          if (idx === sections.length - 1) setInvestigating(false);
        }, (idx + 1) * 800);
      });
      
      refreshData();
    } catch (err) {
      setTerminalOutput(prev => [...prev, '[ERR] Intelligence Model Connection Failed.']);
      setInvestigating(false);
    }
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      const reportContent = `BANK OF MAHARASHTRA
RESERVE BANK OF INDIA (RBI) MANDATORY DISCLOSURE
SUSPICIOUS ACTIVITY REPORT (SAR)

DATE: ${new Date().toLocaleString()}
SUBJECT: ${emp.name} (${emp.id})
ROLE: ${emp.role} | ${emp.department}
RISK SCORE: ${emp.riskScore}/100

-- CONTEXTUAL TELEMETRY --
${emp.backgroundContext || 'Cleared for MahaCore internal systems. MahaBank financial disclosure filed Q1 2026.'}

-- BEHAVIORAL LOGS --
${emp.events?.map(e => `[${new Date(e.timestamp).toISOString()}] IP: ${e.ip} ACTION: ${e.action}`).join('\n') || 'None'}

-- FORENSIC LLM ANALYSIS --
${emp.investigationResult || 'Intelligence analysis has not been executed.'}

-- END OF REPORT --`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RBI_SAR_${emp.id}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setGeneratingReport(false);
    }, 1500);
  };

  if (loading || !emp) {
    return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#112e51] dark:border-slate-500 border-t-transparent animate-spin"></div></div>;
  }

  const isCritical = emp.riskScore >= 76;
  const isSuspended = emp.status === 'Suspended';

  // MITRE ATT&CK Mapping logic
  const ztVectors = [];
  if (emp.events?.some(e => e.action === 'OFFSHORE_WIRE_TRANSFER')) ztVectors.push({ id: 'T1567', name: 'Exfiltration Over Web Service', color: '#d83933', darkColor: 'text-red-500', bg: 'bg-[#d83933]', darkBg: 'dark:bg-red-500' });
  if (emp.events?.some(e => e.action === 'ACCESS_VIP_FILES')) ztVectors.push({ id: 'T1078', name: 'Valid Accounts', color: '#e5a000', darkColor: 'text-yellow-500', bg: 'bg-[#e5a000]', darkBg: 'dark:bg-yellow-500' });
  if (emp.touchedHoneypot) ztVectors.push({ id: 'T1020', name: 'Automated Exfiltration (Honeypot)', color: '#d83933', darkColor: 'text-red-500', bg: 'bg-[#d83933]', darkBg: 'dark:bg-red-500' });
  if (emp.events?.some(e => e.action === 'AFTER_HOURS_LOGIN')) ztVectors.push({ id: 'T1071', name: 'Standard App Layer Protocol', color: '#e5a000', darkColor: 'text-yellow-500', bg: 'bg-[#e5a000]', darkBg: 'dark:bg-yellow-500' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1b1b1b] dark:text-slate-300 transition-colors">
      
      {/* Dossier Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-[#005ea2] dark:text-blue-400 hover:text-[#112e51] dark:hover:text-white hover:underline flex items-center font-bold text-sm">
           <ChevronLeft size={16} /> Return to Directory
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 border-t-8 ${isCritical ? 'border-[#d83933] dark:border-red-900' : 'border-[#112e51] dark:border-slate-700'} border-l border-r border-b border-[#adadad] dark:border-slate-800 shadow-sm transition-colors duration-300`}>
         <div className={`px-6 py-4 text-white flex justify-between items-center ${isCritical ? 'bg-[#d83933] dark:bg-red-900' : 'bg-[#112e51] dark:bg-slate-800'}`}>
            <div>
               <h1 className="text-2xl font-extrabold uppercase">Subject Dossier: {emp.name}</h1>
               <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-80 mt-1">ID: {emp.id}</p>
            </div>
            <div className="text-right">
               <div className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Risk Score</div>
               <div className="text-4xl font-black">{emp.riskScore}/100</div>
            </div>
         </div>

         {/* Info Strip */}
         <div className="bg-[#f0f0f0] dark:bg-slate-950 px-6 py-3 border-b border-[#adadad] dark:border-slate-800 flex flex-wrap gap-6 text-sm font-bold transition-colors">
            <div className="flex items-center gap-2"><Briefcase size={16} className="text-[#5c5c5c] dark:text-slate-500" /> {emp.role} • {emp.department}</div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-[#5c5c5c] dark:text-slate-500" /> {emp.location}</div>
            <div className="flex items-center gap-2">
               <Activity size={16} className="text-[#5c5c5c] dark:text-slate-500" /> 
               Status: <span className={`px-2 py-0.5 text-white ${isSuspended ? 'bg-[#d83933] dark:bg-red-500' : 'bg-[#2e8540] dark:bg-emerald-500'}`}>{emp.status}</span>
            </div>
         </div>

         <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Context & Telemetry */}
            <div className="lg:col-span-2 space-y-6">
               <div className="border border-[#112e51] dark:border-slate-700">
                  <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-2 font-bold flex items-center gap-2"><FileText size={16}/> Contextual Telemetry</div>
                  <div className="p-4 bg-[#f9f9f9] dark:bg-slate-900/50 text-sm font-medium leading-relaxed">
                    {emp.backgroundContext || "Standard employee background. Cleared for MahaCore internal systems. MahaBank financial disclosure filed Q1 2026."}
                  </div>
               </div>

               <div className="border border-[#112e51] dark:border-slate-700">
                  <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-2 font-bold flex items-center gap-2"><Server size={16}/> Recent Raw Events</div>
                  <div className="p-0">
                     <table className="w-full text-sm text-left">
                       <tbody className="divide-y divide-[#adadad] dark:divide-slate-800">
                         {emp.events?.map((ev, idx) => (
                           <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'}`}>
                             <td className="p-3 font-mono text-[#5c5c5c] dark:text-slate-500 text-xs w-32">{new Date(ev.timestamp).toLocaleString()}</td>
                             <td className="p-3 font-bold text-[#112e51] dark:text-slate-300">{ev.action.replace(/_/g, ' ')}</td>
                             <td className="p-3 font-mono text-xs">{ev.ip}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* MITRE Mapping & Actions */}
            <div className="space-y-6">
               <div className="border-2 border-[#112e51] dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                  <h3 className="font-extrabold text-[#112e51] dark:text-white uppercase mb-4 border-b-2 border-[#112e51] dark:border-slate-700 pb-2">MITRE ATT&CK Mapping</h3>
                  {ztVectors.length > 0 ? (
                     <div className="space-y-3">
                        {ztVectors.map(vec => (
                           <div key={vec.id} className="flex gap-3">
                              <span className={`px-2 py-1 text-white text-xs font-bold shrink-0 h-fit ${vec.bg} ${vec.darkBg}`}>{vec.id}</span>
                              <span className="text-sm font-bold leading-tight">{vec.name}</span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-sm font-bold text-[#5c5c5c] dark:text-slate-500 bg-[#f0f0f0] dark:bg-slate-950 p-3">No active threat vectors identified.</div>
                  )}
               </div>

               <div className="border-t-4 border-[#112e51] dark:border-slate-700 bg-[#f0f0f0] dark:bg-slate-950 p-5">
                  <h3 className="font-extrabold text-[#112e51] dark:text-white uppercase mb-4">Command & Control</h3>
                  <div className="space-y-3">
                     <button 
                       onClick={handleInvestigate}
                       disabled={investigating}
                       className="w-full bg-[#112e51] dark:bg-slate-800 hover:bg-[#0b1c32] dark:hover:bg-slate-700 text-white font-bold py-3 uppercase tracking-widest text-xs border-b-4 border-black dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                       <Cpu size={16} /> {investigating ? 'Running Intelligence...' : 'Run LLM Intelligence'}
                     </button>
                     
                     {!isSuspended ? (
                       <button 
                         onClick={() => setShowFreezeModal(true)}
                         className="w-full bg-[#d83933] dark:bg-red-800 hover:bg-[#a62b26] dark:hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-xs border-b-4 border-black dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                       >
                         <ShieldAlert size={16} /> SOC Containment Freeze
                       </button>
                     ) : (
                       <div className="w-full bg-[#f9e8e8] dark:bg-red-950/30 border border-[#d83933] dark:border-red-900 text-[#d83933] dark:text-red-500 font-bold py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                         <Lock size={16} /> Subject Contained
                       </div>
                     )}
                     
                     <button 
                       onClick={handleGenerateReport}
                       disabled={generatingReport}
                       className="w-full bg-white dark:bg-slate-800 border-2 border-[#112e51] dark:border-slate-600 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 text-[#112e51] dark:text-slate-300 font-bold py-3 uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                       <FileText size={16} /> {generatingReport ? 'Compiling PDF...' : 'Generate RBI Report'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Deep Forensic Terminal */}
         {(terminalOutput.length > 0 || emp.investigationResult) && (
            <div className="border-t border-[#adadad] dark:border-slate-800 p-6 bg-[#f9f9f9] dark:bg-slate-950">
               <h3 className="font-extrabold text-[#112e51] dark:text-white uppercase mb-4 flex items-center gap-2">
                 <Terminal size={18} /> Deep Forensic Analysis
               </h3>
               <div ref={terminalRef} className="bg-black text-[#00ff00] p-6 font-mono text-sm h-80 overflow-y-auto leading-relaxed border-4 border-[#1b1b1b] dark:border-slate-800">
                  {emp.investigationResult && terminalOutput.length === 0 ? (
                     emp.investigationResult.split('\n\n').map((block, i) => (
                        <div key={i} className="mb-4">{block}</div>
                     ))
                  ) : (
                     terminalOutput.map((line, i) => (
                        <div key={i} className={`mb-4 animate-in slide-in-from-bottom-2 ${line.includes('[ERR]') ? 'text-[#ff0000]' : ''}`}>{line}</div>
                     ))
                  )}
                  {investigating && <div className="animate-pulse flex items-center gap-2 mt-4"><span>_</span> Processing Vectors...</div>}
               </div>
            </div>
         )}
      </div>

      {showFreezeModal && (
        <FreezeModal 
          emp={emp} 
          currentUser={currentUser}
          onClose={() => setShowFreezeModal(false)} 
          onSuccess={() => { setShowFreezeModal(false); refreshData(); }} 
        />
      )}
    </div>
  );
}
