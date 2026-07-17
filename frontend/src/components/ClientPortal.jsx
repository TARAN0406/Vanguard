import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Activity, Server, FileText } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function ClientPortal() {
  const [alerts, setAlerts] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/client/CLI_AMBANI')
      .then(r => r.json())
      .then(data => {
        setClientData(data);
      })
      .catch(err => console.error(err));

    const fetchClient = async () => {
      try {
        const clientRes = await fetch('http://localhost:5000/api/client/CLI_AMBANI');
        const clientData = await clientRes.json();
        setClientData(clientData);

        const alertsRes = await fetch('http://localhost:5000/api/client-alerts');
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (loading || !clientData) {
    return <div className="flex h-screen bg-[#f0f0f0] dark:bg-slate-950 items-center justify-center transition-colors"><div className="w-8 h-8 border-4 border-[#112e51] dark:border-slate-500 border-t-transparent animate-spin"></div></div>;
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-slate-950 text-[#1b1b1b] dark:text-slate-300 font-sans transition-colors duration-300">
      
      {/* Consumer Banking Navbar */}
      <nav className="bg-white dark:bg-slate-900 px-8 py-5 flex justify-between items-center border-b-4 border-[#d83933] dark:border-red-900 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#112e51] dark:bg-slate-800 flex justify-center items-center text-white font-black text-xl border-2 border-black dark:border-slate-950">
            BM
          </div>
          <h2 className="m-0 text-2xl font-extrabold text-[#112e51] dark:text-white tracking-tight uppercase">Bank of Maharashtra</h2>
        </div>
        <div className="flex gap-6 items-center">
          <ThemeToggle />
          <span className="font-bold text-[#1b1b1b] dark:text-slate-300 uppercase text-sm">Welcome, {clientData.name}</span>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#112e51] dark:bg-slate-800 hover:bg-[#0b1c32] dark:hover:bg-slate-700 text-white px-5 py-2.5 font-bold uppercase text-xs tracking-widest border-b-4 border-black dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Standard Banking UI */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900 border-t-8 border-[#112e51] dark:border-slate-700 border-l border-r border-b border-[#adadad] dark:border-slate-800 shadow-sm p-8 relative transition-colors duration-300">
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#e7f4e4] dark:bg-emerald-900/30 border-2 border-[#2e8540] dark:border-emerald-800 px-3 py-1.5 text-[#2e8540] dark:text-emerald-400 text-xs font-bold uppercase">
              <Lock size={14} /> QPC Signature: CRYSTALS-Kyber
            </div>
            <h3 className="uppercase text-[#5c5c5c] dark:text-slate-400 font-bold text-sm tracking-widest mb-2">Total Balance</h3>
            <h1 className="text-6xl font-black text-[#112e51] dark:text-white tracking-tight m-0">{clientData.balance}</h1>
            <div className="mt-8 flex gap-4">
              <button className="bg-[#005ea2] dark:bg-blue-800 hover:bg-[#1a4480] dark:hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-widest px-6 py-3 border-b-4 border-[#112e51] dark:border-blue-950 active:border-b-0 active:translate-y-1 transition-all">
                Transfer Funds
              </button>
              <button className="bg-white dark:bg-slate-800 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 border-2 border-[#112e51] dark:border-slate-600 text-[#112e51] dark:text-slate-300 font-bold uppercase text-xs tracking-widest px-6 py-3 transition-colors">
                Download Statement
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
            <div className="bg-[#112e51] dark:bg-slate-800 text-white px-6 py-4 flex items-center gap-2">
               <Activity size={18} />
               <h2 className="text-lg font-bold uppercase tracking-widest m-0">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#112e51] dark:border-slate-700 bg-[#f0f0f0] dark:bg-slate-950">
                    <th className="p-4 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Date</th>
                    <th className="p-4 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Description</th>
                    <th className="p-4 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.transactions && clientData.transactions.length > 0 ? (
                    clientData.transactions.map((tx, idx) => (
                      <tr key={idx} className={`hover:bg-[#e1f3f8] dark:hover:bg-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'} border-b border-[#adadad] dark:border-slate-800 transition-colors duration-150`}>
                        <td className="p-4 text-[#5c5c5c] dark:text-slate-500 font-mono">{tx.date}</td>
                        <td className="p-4 font-bold text-[#1b1b1b] dark:text-slate-300">{tx.description}</td>
                        <td className={`p-4 font-bold ${tx.type === 'credit' ? 'text-[#2e8540] dark:text-emerald-500' : 'text-[#d83933] dark:text-red-500'}`}>
                          {tx.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-[#5c5c5c] dark:text-slate-500 font-bold">No recent transactions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Transparency Portal */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border-t-8 border-[#d83933] dark:border-red-900 border-l border-r border-b border-[#adadad] dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="bg-[#f0f0f0] dark:bg-slate-950 px-6 py-4 border-b border-[#adadad] dark:border-slate-800 flex items-center gap-2">
               <ShieldCheck size={20} className="text-[#112e51] dark:text-white" />
               <h2 className="text-lg font-bold text-[#112e51] dark:text-white uppercase tracking-widest m-0">Data Privacy Audit</h2>
            </div>
            <div className="p-6">
              <p className="text-[#1b1b1b] dark:text-slate-300 font-medium text-sm leading-relaxed mt-0 mb-6 border-l-4 border-[#112e51] dark:border-slate-600 pl-3 bg-[#f9f9f9] dark:bg-slate-800 py-2">
                "One Family One Bank." Bank of Maharashtra operates on a Zero Trust architecture. Every access to your financial records by our personnel is permanently logged and audited.
              </p>
              
              <div className="flex flex-col gap-4">
                {alerts.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-[#adadad] dark:border-slate-700 text-center text-[#5c5c5c] dark:text-slate-500 font-bold bg-[#f0f0f0] dark:bg-slate-950">
                    No recent internal access to your files.
                  </div>
                ) : (
                  alerts.map((alert, idx) => {
                    const isUnauthorized = alert.status === 'Suspended' || alert.role === 'IT Admin';
                    return (
                      <div key={idx} className={`p-4 border-l-8 border-t border-r border-b border-[#adadad] dark:border-slate-800 transition-colors ${isUnauthorized ? 'bg-[#f9e8e8] dark:bg-red-950/20 border-l-[#d83933] dark:border-l-red-800' : 'bg-[#e7f4e4] dark:bg-emerald-900/20 border-l-[#2e8540] dark:border-l-emerald-800'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono font-bold text-[#5c5c5c] dark:text-slate-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-widest text-white ${isUnauthorized ? 'bg-[#d83933] dark:bg-red-800' : 'bg-[#2e8540] dark:bg-emerald-800'}`}>
                            {isUnauthorized ? 'BLOCKED' : 'VERIFIED'}
                          </span>
                        </div>
                        <div className="text-sm text-[#112e51] dark:text-slate-300 mb-2 font-medium">
                          <strong className="dark:text-white">{alert.role}</strong> ({alert.department}) accessed your file.
                        </div>
                        <div className="text-xs text-[#5c5c5c] dark:text-slate-500 font-bold mb-3 flex items-center gap-1">
                          <FileText size={12} /> File: <span className="font-mono text-[#1b1b1b] dark:text-slate-300">{alert.file_name}</span>
                        </div>
                        {isUnauthorized && (
                          <div className="mt-2 text-xs text-[#d83933] dark:text-red-400 font-bold flex gap-2 items-start bg-white dark:bg-slate-900 p-2 border border-[#d83933] dark:border-red-900">
                            <Server size={14} className="shrink-0 mt-0.5" />
                            <span>Our Autonomous SOAR system detected this as unauthorized snooping and instantly revoked the employee's access.</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
