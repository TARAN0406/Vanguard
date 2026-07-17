import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Fingerprint, Network, Cpu, ArrowRight, Landmark, Lock, Server } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-slate-950 relative overflow-x-hidden flex flex-col font-sans transition-colors duration-300">

      {/* Enterprise Header */}
      <header className="w-full border-b-4 border-[#d83933] dark:border-red-900 bg-white dark:bg-slate-900 shadow-sm z-40 sticky top-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={32} className="text-[#112e51] dark:text-slate-100" />
            <span className="text-2xl font-extrabold text-[#112e51] dark:text-slate-100 tracking-tight uppercase">BoM Portal</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#architecture" className="text-sm font-bold text-[#112e51] dark:text-slate-300 hover:underline">Core Architecture</a>
            <a href="#compliance" className="text-sm font-bold text-[#112e51] dark:text-slate-300 hover:underline">Compliance Standards</a>
            <a href="#enterprise" className="text-sm font-bold text-[#112e51] dark:text-slate-300 hover:underline">Federal Agencies</a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/login')}
              className="group flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#005ea2] dark:bg-slate-800 hover:bg-[#1a4480] dark:hover:bg-slate-700 border-b-4 border-[#112e51] dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all"
            >
              Access Terminal
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-6 relative z-10 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 border-2 border-[#112e51] dark:border-slate-700 mb-8 transition-colors duration-300">
          <span className="flex h-3 w-3 bg-[#d83933] dark:bg-red-500 animate-pulse"></span>
          <span className="text-xs font-bold text-[#112e51] dark:text-slate-300 uppercase tracking-widest">Bank of Maharashtra • Pune HQ</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-[#112e51] dark:text-white tracking-tight max-w-5xl leading-[1.1] mb-6 uppercase">
          One Family One Bank. <br />
          <span className="text-[#d83933] dark:text-red-500">Zero-Trust Security.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#1b1b1b] dark:text-slate-400 font-medium max-w-3xl mb-12 leading-relaxed">
          The central authoritative system for analyzing behavioral telemetry in real-time. Instantly identify structural anomalies, exfiltration attempts, and rogue actors within the banking perimeter.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-32">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-[#112e51] dark:bg-slate-200 hover:bg-[#0b1c32] dark:hover:bg-white text-white dark:text-slate-900 font-bold border-b-4 border-black dark:border-slate-400 active:border-b-0 active:translate-y-1 transition-all text-sm uppercase tracking-widest"
          >
            Launch Executive Gateway
          </button>
          <button 
            onClick={() => window.open('/client-portal', '_blank')}
            className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-[#112e51] dark:border-slate-700 hover:bg-[#f0f0f0] dark:hover:bg-slate-800 text-[#112e51] dark:text-slate-300 font-bold transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span>🏦</span> Consumer Banking Portal
          </button>
        </div>

        {/* SECTION: ARCHITECTURE */}
        <section id="architecture" className="w-full max-w-7xl mx-auto pt-20">
          <div className="text-left mb-12 border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
             <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white uppercase">Core Architecture</h2>
             <p className="text-[#5c5c5c] dark:text-slate-400 max-w-2xl text-lg font-bold mt-2">Built on a multi-layered detection matrix, ensuring internal threat vectors are neutralized before exfiltration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 border-t-8 border-[#112e51] dark:border-slate-700 border-l border-r border-b border-[#adadad] dark:border-b-slate-800 dark:border-l-slate-800 dark:border-r-slate-800 shadow-sm text-left transition-colors duration-300">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-slate-800 flex items-center justify-center mb-6 border-2 border-[#112e51] dark:border-slate-600">
                <Fingerprint className="text-[#112e51] dark:text-slate-300" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#112e51] dark:text-white mb-3 uppercase">Behavioral Fingerprinting</h3>
              <p className="text-[#1b1b1b] dark:text-slate-400 text-sm leading-relaxed font-medium">Dynamically scores user intent based on location, device posture, and historical access anomalies using a 100-point vector.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 border-t-8 border-[#005ea2] dark:border-blue-900 border-l border-r border-b border-[#adadad] dark:border-b-slate-800 dark:border-l-slate-800 dark:border-r-slate-800 shadow-sm text-left relative overflow-hidden transition-colors duration-300">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-slate-800 flex items-center justify-center mb-6 border-2 border-[#005ea2] dark:border-blue-800">
                <Cpu className="text-[#005ea2] dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#112e51] dark:text-white mb-3 uppercase relative z-10">Live AI Investigations</h3>
              <p className="text-[#1b1b1b] dark:text-slate-400 text-sm leading-relaxed relative z-10 font-medium">Streams contextual telemetry directly into autonomous AI for sub-second, narrative incident reporting and MITRE ATT&CK mapping.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 border-t-8 border-[#d83933] dark:border-red-900 border-l border-r border-b border-[#adadad] dark:border-b-slate-800 dark:border-l-slate-800 dark:border-r-slate-800 shadow-sm text-left transition-colors duration-300">
              <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-slate-800 flex items-center justify-center mb-6 border-2 border-[#d83933] dark:border-red-800">
                <Network className="text-[#d83933] dark:text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#112e51] dark:text-white mb-3 uppercase">QPC Decoy Architecture</h3>
              <p className="text-[#1b1b1b] dark:text-slate-400 text-sm leading-relaxed font-medium">Deploys secured honeypots. Unauthorized access triggers instant, automated account suspension and containment.</p>
            </div>
          </div>
        </section>

        {/* SECTION: COMPLIANCE */}
        <section id="compliance" className="w-full max-w-7xl mx-auto pt-32 mt-12 border-t-2 border-[#adadad] dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start gap-12 text-left">
            <div className="flex-1">
               <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white mb-4 uppercase">Regulatory Compliance, <br/><span className="text-[#d83933] dark:text-red-500">Automated.</span></h2>
               <p className="text-[#1b1b1b] dark:text-slate-400 text-lg mb-8 font-medium">Bank of Maharashtra's internal systems are natively engineered to adhere to the strictest banking cybersecurity directives, automating audit trails and ensuring board-level oversight for critical actions.</p>
               
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="mt-1"><Landmark size={24} className="text-[#112e51] dark:text-slate-400"/></div>
                    <div>
                      <h4 className="text-[#112e51] dark:text-white font-bold uppercase text-sm">Federal Financial Directives</h4>
                      <p className="text-[#5c5c5c] dark:text-slate-500 text-sm font-medium mt-1">Full lifecycle logging of privileged access and automated anomaly flagging.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="mt-1"><Server size={24} className="text-[#112e51] dark:text-slate-400"/></div>
                    <div>
                      <h4 className="text-[#112e51] dark:text-white font-bold uppercase text-sm">Mandatory Incident Directives</h4>
                      <p className="text-[#5c5c5c] dark:text-slate-500 text-sm font-medium mt-1">6-hour rapid incident detection matching specific MITRE ATT&CK vectors.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="mt-1"><Lock size={24} className="text-[#112e51] dark:text-slate-400"/></div>
                    <div>
                      <h4 className="text-[#112e51] dark:text-white font-bold uppercase text-sm">4-Eyes Executive Principle</h4>
                      <p className="text-[#5c5c5c] dark:text-slate-500 text-sm font-medium mt-1">Zero-trust network severing requires dual-authorization and cryptographic signature validation.</p>
                    </div>
                 </div>
               </div>
            </div>
            
            <div className="flex-1 w-full bg-white dark:bg-slate-900 border-4 border-[#112e51] dark:border-slate-700 shadow-xl transition-colors duration-300">
               <div className="bg-[#112e51] dark:bg-slate-800 text-white p-4 flex items-center justify-between">
                 <span className="text-xs font-mono font-bold">SYSTEM.AUDIT_LOG</span>
                 <span className="flex items-center gap-2 text-xs font-bold uppercase"><span className="w-2 h-2 bg-[#2e8540] dark:bg-emerald-500 animate-pulse"></span> COMPLIANT</span>
               </div>
               <div className="p-6 space-y-4 font-mono text-[10px] sm:text-xs text-[#1b1b1b] dark:text-slate-300 bg-[#f9f9f9] dark:bg-slate-900/50">
                 <div className="flex gap-4"><span className="text-[#5c5c5c] dark:text-slate-500">14:02:01</span><span className="font-bold">Evaluating Fed_Directive_4.2</span><span className="text-[#2e8540] dark:text-emerald-500 ml-auto font-bold">[PASS]</span></div>
                 <div className="flex gap-4"><span className="text-[#5c5c5c] dark:text-slate-500">14:02:01</span><span className="font-bold">Checking Least_Privilege</span><span className="text-[#2e8540] dark:text-emerald-500 ml-auto font-bold">[PASS]</span></div>
                 <div className="flex gap-4"><span className="text-[#5c5c5c] dark:text-slate-500">14:02:02</span><span className="font-bold">Validating Decoy_Integrity</span><span className="text-[#2e8540] dark:text-emerald-500 ml-auto font-bold">[PASS]</span></div>
                 <div className="flex gap-4 border-t-2 border-[#adadad] dark:border-slate-800 pt-4"><span className="text-[#5c5c5c] dark:text-slate-500">14:02:05</span><span className="text-[#d83933] dark:text-red-400 font-bold">Alert: T1078 Valid_Accounts (EMP003)</span><span className="text-[#d83933] dark:text-red-500 ml-auto font-bold">[LOGGED]</span></div>
                 <div className="flex gap-4"><span className="text-[#5c5c5c] dark:text-slate-500">14:02:05</span><span className="font-bold">Initiating 6hr Reporting Protocol</span><span className="text-[#e5a000] dark:text-yellow-500 ml-auto font-bold">[PENDING]</span></div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION: ENTERPRISE */}
        <section id="enterprise" className="w-full max-w-7xl mx-auto pt-32 mt-12 pb-12 border-t-2 border-[#adadad] dark:border-slate-800">
          <h2 className="text-sm font-bold text-[#5c5c5c] dark:text-slate-500 uppercase tracking-widest mb-10">Securing MahaBank Operations Since 1935</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 dark:opacity-40 grayscale">
            <div className="text-2xl font-black text-[#112e51] dark:text-white flex items-center gap-2"><div className="w-6 h-6 bg-[#112e51] dark:bg-white"></div> BANK OF<span className="font-light">MAHARASHTRA</span></div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#112e51] dark:border-slate-800 bg-[#f0f0f0] dark:bg-slate-950 py-10 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#1b1b1b] dark:text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 Bank of Maharashtra InfoSec, Pune.</p>
          <div className="flex gap-4 mt-4 md:mt-0 font-bold">
            <span className="text-[#005ea2] dark:text-slate-500 text-xs">RBI Master Direction</span>
            <span className="text-[#adadad] dark:text-slate-700 text-xs">|</span>
            <span className="text-[#005ea2] dark:text-slate-500 text-xs">CERT-In Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
