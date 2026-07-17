import React, { useState, useEffect } from 'react';
import { getEmployees } from '../services/api';
import { ShieldCheck, ShieldAlert, LogOut, Activity, AlertTriangle, Users, LayoutDashboard, Search, FileText, Settings, Target, ChevronRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import IntelligencePortal from './IntelligencePortal';
import ThemeToggle from './ThemeToggle';

export default function Dashboard({ currentUser, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [riskThreshold, setRiskThreshold] = useState(76);
  const [confidenceLimit, setConfidenceLimit] = useState(90);

  const fetchData = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.sort((a, b) => b.riskScore - a.riskScore));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex h-screen bg-[#f0f0f0] dark:bg-slate-950 items-center justify-center"><div className="w-8 h-8 border-4 border-[#112e51] dark:border-slate-500 border-t-transparent animate-spin"></div></div>;
  }

  const critical = employees.filter(e => e.riskScore >= 76);
  const highRisk = employees.filter(e => e.riskScore >= 51 && e.riskScore < 76);
  const mediumRisk = employees.filter(e => e.riskScore >= 26 && e.riskScore <= 50);
  const lowRisk = employees.filter(e => e.riskScore < 26);
  const honeypotBreaches = employees.filter(e => e.touchedHoneypot).length;

  const donutData = [
    { name: 'Critical', value: critical.length },
    { name: 'High', value: highRisk.length },
    { name: 'Medium', value: mediumRisk.length },
    { name: 'Low', value: lowRisk.length }
  ];
  // USWDS Official Palette: Red, Gold, Green, Light Gray
  const DONUT_COLORS = ['#d83933', '#e5a000', '#2e8540', '#adadad'];

  const topRisky = employees.slice(0, 5);
  
  const recentAlerts = [];
  topRisky.forEach(emp => {
    if (emp.events && Array.isArray(emp.events)) {
      emp.events.slice(0, 2).forEach(ev => {
        recentAlerts.push({
          time: new Date(ev.timestamp).toLocaleTimeString(),
          empId: emp.id,
          event: ev.action.replace(/_/g, ' '),
          severity: emp.riskScore >= 76 ? 'Critical' : emp.riskScore >= 51 ? 'High' : 'Medium',
          timestamp: new Date(ev.timestamp).getTime()
        });
      });
    }
  });
  recentAlerts.sort((a, b) => b.timestamp - a.timestamp);

  const trajectoryEmp = topRisky[0];
  const rawTrajectory = trajectoryEmp?.trajectory || (trajectoryEmp ? Array.from({ length: 30 }, () => Math.max(0, Math.min(100, trajectoryEmp.riskScore + Math.floor(Math.random() * 10) - 5))) : []);
  const trajectoryData = rawTrajectory.map((val, i) => ({ day: `Jul ${i+1}`, score: val }));

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] dark:bg-slate-950 text-[#1b1b1b] dark:text-slate-300 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Top Header Navigation (USWDS Style) */}
      <header className="bg-white dark:bg-slate-900 border-b-4 border-[#d83933] dark:border-red-900 shadow-sm px-8 py-5 flex justify-between items-center shrink-0 z-10 relative transition-colors duration-300">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-[#112e51] dark:text-slate-200" size={36} />
          <div>
            <h1 className="text-2xl font-extrabold text-[#112e51] dark:text-white tracking-tight">BoM Insider Threat Portal</h1>
            <p className="text-xs text-[#5c5c5c] dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Bank of Maharashtra</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <ThemeToggle />
           <div className="flex items-center gap-2 bg-[#f0f0f0] dark:bg-slate-800 px-3 py-1.5 border border-[#adadad] dark:border-slate-700 transition-colors duration-300">
              <div className="w-3 h-3 bg-[#2e8540] dark:bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-[#1b1b1b] dark:text-slate-300 uppercase">System Secure</span>
           </div>
           <button onClick={onLogout} className="flex items-center gap-2 text-[#d83933] dark:text-red-400 hover:underline font-bold text-sm">
              <LogOut size={16} /> Disconnect
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Utilitarian Left Menu */}
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-[#adadad] dark:border-slate-800 shrink-0 overflow-y-auto hidden md:block transition-colors duration-300">
           <div className="p-4 bg-[#f0f0f0] dark:bg-slate-950 border-b border-[#adadad] dark:border-slate-800 text-sm font-bold text-[#112e51] dark:text-slate-400 uppercase transition-colors duration-300">Directory Menu</div>
           <nav className="flex flex-col">
             {[
               { name: 'Dashboard', icon: LayoutDashboard },
               { name: 'Risk Overview', icon: Activity },
               { name: 'Employees', icon: Users },
               { name: 'Alerts', icon: AlertTriangle },
               { name: 'Risk Trajectory', icon: TrendingUp },
               { name: 'Reports', icon: FileText },
               { name: 'Honeypot Events', icon: Target },
               { name: 'Settings', icon: Settings },
             ].map((item) => (
               <button 
                 key={item.name}
                 onClick={() => { setActiveTab(item.name); setSelectedEmp(null); }}
                 className={`flex items-center gap-3 px-6 py-4 border-b border-[#f0f0f0] dark:border-slate-800 text-left transition-colors ${
                   activeTab === item.name && !selectedEmp 
                    ? 'bg-[#112e51] dark:bg-slate-800 text-white font-bold border-l-4 border-l-[#d83933] dark:border-l-red-500' 
                    : 'text-[#112e51] dark:text-slate-400 hover:bg-[#f0f0f0] dark:hover:bg-slate-800 font-semibold'
                 }`}
               >
                 <item.icon size={18} />
                 <span className="text-sm">{item.name}</span>
               </button>
             ))}
           </nav>
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto relative p-6 md:p-10">
          {selectedEmp ? (
            <div className="max-w-7xl mx-auto">
              <IntelligencePortal empId={selectedEmp} onBack={() => setSelectedEmp(null)} currentUser={currentUser} refreshData={fetchData} />
            </div>
          ) : activeTab === 'Dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="flex justify-between items-end border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                 <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Operational Dashboard</h2>
                 <p className="text-sm font-bold text-[#5c5c5c] dark:text-slate-400">Last Updated: {new Date().toLocaleTimeString()}</p>
              </div>

              {/* USWDS Flat KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-[#adadad] dark:border-slate-700 p-5 shadow-sm transition-colors duration-300">
                  <p className="text-xs uppercase font-bold text-[#5c5c5c] dark:text-slate-400 mb-1">Total Monitored</p>
                  <p className="text-3xl font-black text-[#112e51] dark:text-white">1,248</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border-l-4 border-l-[#d83933] dark:border-l-red-500 border-t border-r border-b border-[#adadad] dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700 p-5 shadow-sm transition-colors duration-300">
                  <p className="text-xs uppercase font-bold text-[#5c5c5c] dark:text-slate-400 mb-1">Critical Risk</p>
                  <p className="text-3xl font-black text-[#d83933] dark:text-red-500">{critical.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border-l-4 border-l-[#e5a000] dark:border-l-yellow-500 border-t border-r border-b border-[#adadad] dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700 p-5 shadow-sm transition-colors duration-300">
                  <p className="text-xs uppercase font-bold text-[#5c5c5c] dark:text-slate-400 mb-1">High Risk</p>
                  <p className="text-3xl font-black text-[#e5a000] dark:text-yellow-500">{highRisk.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border-l-4 border-l-[#2e8540] dark:border-l-emerald-500 border-t border-r border-b border-[#adadad] dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700 p-5 shadow-sm transition-colors duration-300">
                  <p className="text-xs uppercase font-bold text-[#5c5c5c] dark:text-slate-400 mb-1">Honeypot Triggers</p>
                  <p className="text-3xl font-black text-[#2e8540] dark:text-emerald-500">{honeypotBreaches}</p>
                </div>
              </div>

              {/* Row 2: Top Risky Employees & Risk Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 {/* Top Risky Employees Table (USWDS Data Table) */}
                 <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                   <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                     <h3 className="text-lg font-bold">Top Actionable Threats</h3>
                   </div>
                   <div className="overflow-x-auto p-4">
                      <table className="w-full text-left text-sm text-[#1b1b1b] dark:text-slate-300 border-collapse">
                        <thead>
                          <tr className="border-b-2 border-[#112e51] dark:border-slate-700">
                            <th className="p-3 font-bold uppercase text-xs">Employee ID</th>
                            <th className="p-3 font-bold uppercase text-xs">Name</th>
                            <th className="p-3 font-bold uppercase text-xs">Score</th>
                            <th className="p-3 font-bold uppercase text-xs">Severity Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topRisky.map((emp, index) => (
                            <tr key={emp.id} onClick={() => setSelectedEmp(emp.id)} className={`cursor-pointer hover:bg-[#e1f3f8] dark:hover:bg-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'} border-b border-[#adadad] dark:border-slate-800 transition-colors duration-150`}>
                              <td className="p-3 font-mono text-[#5c5c5c] dark:text-slate-400 underline">{emp.id}</td>
                              <td className="p-3 font-bold text-[#112e51] dark:text-slate-200">{emp.name}</td>
                              <td className="p-3 font-bold">
                                 <span className={emp.riskScore >= 76 ? 'text-[#d83933] dark:text-red-500' : emp.riskScore >= 51 ? 'text-[#e5a000] dark:text-yellow-500' : 'text-[#2e8540] dark:text-emerald-500'}>
                                    {emp.riskScore}
                                 </span>
                              </td>
                              <td className="p-3 font-bold uppercase text-xs">
                                 <span className={`px-2 py-1 ${emp.riskScore >= 76 ? 'bg-[#d83933] dark:bg-red-500 text-white dark:text-slate-900' : emp.riskScore >= 51 ? 'bg-[#e5a000] dark:bg-yellow-500 text-white dark:text-slate-900' : 'bg-[#2e8540] dark:bg-emerald-500 text-white dark:text-slate-900'}`}>
                                    {emp.riskScore >= 76 ? 'Critical' : emp.riskScore >= 51 ? 'High' : 'Medium'}
                                 </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                 </div>

                 {/* Risk Distribution Donut */}
                 <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
                    <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                     <h3 className="text-lg font-bold">Risk Distribution</h3>
                    </div>
                    <div className="flex-1 relative min-h-[250px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                            {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #112e51', borderRadius: '0', color: '#1b1b1b', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
                        <span className="text-3xl font-black text-[#112e51] dark:text-white">1,248</span>
                        <span className="text-xs uppercase font-bold text-[#5c5c5c] dark:text-slate-400">Total</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Risk Overview' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Enterprise Risk Overview</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Risk Matrix */}
                <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                   <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                     <h3 className="text-lg font-bold">Risk by Department</h3>
                   </div>
                   <div className="p-4 space-y-2">
                      {['Finance', 'IT', 'Engineering', 'Marketing', 'HR'].map((dept, index) => {
                         const deptEmps = employees.filter(e => e.department && e.department.includes(dept));
                         const deptCritical = deptEmps.filter(e => e.riskScore >= 76).length;
                         const deptHigh = deptEmps.filter(e => e.riskScore >= 51 && e.riskScore < 76).length;
                         if (deptEmps.length === 0) return null;
                         return (
                           <div key={dept} className={`flex justify-between items-center p-3 border border-[#adadad] dark:border-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'}`}>
                              <span className="text-[#112e51] dark:text-slate-300 font-bold">{dept}</span>
                              <div className="flex gap-2">
                                 {deptCritical > 0 && <span className="px-2 py-0.5 bg-[#d83933] dark:bg-red-500 text-white dark:text-slate-900 text-xs font-bold">{deptCritical} Critical</span>}
                                 {deptHigh > 0 && <span className="px-2 py-0.5 bg-[#e5a000] dark:bg-yellow-500 text-white dark:text-slate-900 text-xs font-bold">{deptHigh} High</span>}
                                 {deptCritical === 0 && deptHigh === 0 && <span className="px-2 py-0.5 bg-[#2e8540] dark:bg-emerald-500 text-white dark:text-slate-900 text-xs font-bold">Secure</span>}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>

                {/* Active Threat Vectors */}
                <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                   <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                     <h3 className="text-lg font-bold">Active Threat Vectors</h3>
                   </div>
                   <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center p-4 border border-[#d83933] dark:border-red-900 bg-[#f9e8e8] dark:bg-red-950/30">
                         <div className="flex items-center gap-3">
                           <ShieldAlert className="text-[#d83933] dark:text-red-500" size={20} />
                           <span className="text-[#112e51] dark:text-slate-200 font-bold">Honeypot Decoy Access</span>
                         </div>
                         <span className="text-[#d83933] dark:text-red-500 font-bold">{employees.filter(e => e.touchedHoneypot).length} Triggers</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border border-[#e5a000] dark:border-yellow-900 bg-[#fcf2e1] dark:bg-yellow-950/30">
                         <div className="flex items-center gap-3">
                           <Activity className="text-[#e5a000] dark:text-yellow-500" size={20} />
                           <span className="text-[#112e51] dark:text-slate-200 font-bold">Offshore SWIFT Wire Transfers</span>
                         </div>
                         <span className="text-[#e5a000] dark:text-yellow-500 font-bold">1 Active</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border border-[#e5a000] dark:border-yellow-900 bg-[#fcf2e1] dark:bg-yellow-950/30">
                         <div className="flex items-center gap-3">
                           <Users className="text-[#e5a000] dark:text-yellow-500" size={20} />
                           <span className="text-[#112e51] dark:text-slate-200 font-bold">Lateral Movement (Collusion)</span>
                         </div>
                         <span className="text-[#e5a000] dark:text-yellow-500 font-bold">Detected</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'Employees' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Employee Directory</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                 <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
                   <h3 className="text-lg font-bold">Full Staff Roster</h3>
                   <div className="bg-white dark:bg-slate-900 text-[#1b1b1b] dark:text-slate-300 px-2 py-1 text-xs flex items-center gap-2"><Search size={14}/> Search</div>
                 </div>
                 <div className="overflow-x-auto p-4">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#112e51] dark:border-slate-700">
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Employee ID</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Name</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Role</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Risk Score</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp, index) => (
                          <tr key={emp.id} onClick={() => setSelectedEmp(emp.id)} className={`cursor-pointer hover:bg-[#e1f3f8] dark:hover:bg-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'} border-b border-[#adadad] dark:border-slate-800 transition-colors duration-150`}>
                            <td className="p-3 font-mono text-[#5c5c5c] dark:text-slate-500 underline">{emp.id}</td>
                            <td className="p-3 font-bold text-[#112e51] dark:text-slate-200">{emp.name}</td>
                            <td className="p-3 text-[#1b1b1b] dark:text-slate-300">{emp.role}</td>
                            <td className="p-3 font-bold">
                               <span className={emp.riskScore >= 76 ? 'text-[#d83933] dark:text-red-500' : emp.riskScore >= 51 ? 'text-[#e5a000] dark:text-yellow-500' : 'text-[#2e8540] dark:text-emerald-500'}>
                                  {emp.riskScore}
                               </span>
                            </td>
                            <td className="p-3">
                               <span className={`px-2 py-1 text-xs font-bold text-white dark:text-slate-900 ${emp.status === 'Suspended' ? 'bg-[#d83933] dark:bg-red-500' : 'bg-[#2e8540] dark:bg-emerald-500'}`}>{emp.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Alerts' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Security Alerts Feed</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                 <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                   <h3 className="text-lg font-bold">Incident Log</h3>
                 </div>
                 <div className="overflow-x-auto p-4">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#112e51] dark:border-slate-700">
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Time</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Employee ID</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Event</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#112e51] dark:text-slate-400">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAlerts.map((alert, idx) => (
                          <tr key={idx} className={`hover:bg-[#e1f3f8] dark:hover:bg-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-[#f0f0f0] dark:bg-slate-950'} border-b border-[#adadad] dark:border-slate-800 transition-colors duration-150`}>
                            <td className="p-3 font-mono text-[#5c5c5c] dark:text-slate-500">{alert.time}</td>
                            <td className="p-3 font-mono text-[#112e51] dark:text-slate-300 font-bold">{alert.empId}</td>
                            <td className="p-3 text-[#1b1b1b] dark:text-slate-300">{alert.event}</td>
                            <td className="p-3 font-bold text-xs">
                               <span className={`px-2 py-1 text-white dark:text-slate-900 ${alert.severity === 'Critical' ? 'bg-[#d83933] dark:bg-red-500' : alert.severity === 'High' ? 'bg-[#e5a000] dark:bg-yellow-500' : 'bg-[#2e8540] dark:bg-emerald-500'}`}>
                                  {alert.severity}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Risk Trajectory' ? (
            <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col pb-10">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4 shrink-0">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Global Risk Trajectory</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm flex-1 flex flex-col min-h-[400px] transition-colors duration-300">
                 <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3 shrink-0">
                   <h3 className="text-lg font-bold">Enterprise Threat Escalation (30 Days)</h3>
                 </div>
                 <div className="flex-1 w-full p-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trajectoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#adadad" vertical={false} />
                        <XAxis dataKey="day" stroke="#5c5c5c" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5c5c5c" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #112e51', borderRadius: '0', color: '#1b1b1b' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#d83933" strokeWidth={3} dot={{ fill: '#ffffff', stroke: '#d83933', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#d83933' }} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Reports' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4 flex justify-between items-end">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Automated Compliance Reports</h2>
                <button className="bg-[#112e51] dark:bg-slate-800 hover:bg-[#0b1c32] dark:hover:bg-slate-700 text-white px-6 py-2 text-sm font-bold transition-colors">
                   + Generate New Report
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                   <h3 className="text-lg font-bold">Available Documents</h3>
                </div>
                <div className="p-4 space-y-2">
                   {['Weekly Insider Threat Summary', 'RBI Master Direction IT Audit', 'CERT-In Incident Report', 'SWIFT Access Log'].map((report, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-[#adadad] dark:border-slate-800 bg-[#f0f0f0] dark:bg-slate-950 hover:bg-[#e1f3f8] dark:hover:bg-slate-800 cursor-pointer transition-colors duration-150">
                         <div className="flex items-center gap-4">
                            <FileText className="text-[#112e51] dark:text-slate-400" />
                            <div>
                               <p className="text-[#112e51] dark:text-slate-200 font-bold text-lg">{report}</p>
                               <p className="text-sm text-[#5c5c5c] dark:text-slate-500">Generated {i + 1} days ago • PDF Document</p>
                            </div>
                         </div>
                         <button className="text-[#005ea2] dark:text-blue-400 font-bold underline hover:text-[#112e51] dark:hover:text-white">Download PDF</button>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'Honeypot Events' ? (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Active Decoy Triggers</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border-2 border-[#d83933] dark:border-red-900 shadow-sm transition-colors duration-300">
                 <div className="bg-[#d83933] dark:bg-red-900 text-white px-4 py-3 flex items-center gap-2">
                   <ShieldAlert size={20} />
                   <h3 className="text-lg font-bold">Critical Honeypot Breaches</h3>
                 </div>
                 <div className="overflow-x-auto p-4">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#d83933] dark:border-red-900">
                          <th className="p-3 font-bold uppercase text-xs text-[#d83933] dark:text-red-500">Time</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#d83933] dark:text-red-500">Employee ID</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#d83933] dark:text-red-500">Decoy File</th>
                          <th className="p-3 font-bold uppercase text-xs text-[#d83933] dark:text-red-500">Source IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#adadad] dark:divide-slate-800">
                        {employees.filter(e => e.touchedHoneypot).map((emp, idx) => (
                          <tr key={idx} className="bg-[#f9e8e8] dark:bg-red-950/20">
                            <td className="p-3 font-mono text-[#1b1b1b] dark:text-slate-300">Today</td>
                            <td className="p-3 font-mono font-bold text-[#112e51] dark:text-white underline">{emp.id}</td>
                            <td className="p-3 text-[#d83933] dark:text-red-400 font-bold">VIP_Client_List_Q3.pdf</td>
                            <td className="p-3 font-mono text-[#1b1b1b] dark:text-slate-300">45.22.11.90</td>
                          </tr>
                        ))}
                        {employees.filter(e => e.touchedHoneypot).length === 0 && (
                           <tr><td colSpan="4" className="p-8 text-center text-[#5c5c5c] dark:text-slate-500">No honeypots breached recently.</td></tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Settings' ? (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="border-b-2 border-[#112e51] dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-[#112e51] dark:text-white">Platform Settings</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                 <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                   <h3 className="text-lg font-bold">Neural Engine Tuning</h3>
                 </div>
                 <div className="p-6 space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-bold text-[#112e51] dark:text-slate-300 mb-2"><span>Risk Score Threshold (Critical)</span><span className="text-[#d83933] dark:text-red-500">{riskThreshold}</span></label>
                      <input type="range" min="50" max="95" value={riskThreshold} onChange={(e) => setRiskThreshold(e.target.value)} className="w-full accent-[#112e51] dark:accent-slate-400" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-bold text-[#112e51] dark:text-slate-300 mb-2"><span>Auto-Freeze Confidence Limit</span><span className="text-[#d83933] dark:text-red-500">{confidenceLimit}%</span></label>
                      <input type="range" min="70" max="99" value={confidenceLimit} onChange={(e) => setConfidenceLimit(e.target.value)} className="w-full accent-[#112e51] dark:accent-slate-400" />
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[#112e51] dark:border-slate-700 shadow-sm transition-colors duration-300">
                 <div className="bg-[#112e51] dark:bg-slate-800 text-white px-4 py-3">
                   <h3 className="text-lg font-bold">System Integrations</h3>
                 </div>
                 <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 border border-[#adadad] dark:border-slate-800 bg-[#f0f0f0] dark:bg-slate-950">
                       <span className="text-[#112e51] dark:text-slate-300 font-bold">MahaCore Banking System (CBS)</span>
                       <span className="px-3 py-1 bg-[#2e8540] dark:bg-emerald-500 text-white dark:text-slate-900 font-bold text-xs">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#adadad] dark:border-slate-800 bg-[#f0f0f0] dark:bg-slate-950">
                       <span className="text-[#112e51] dark:text-slate-300 font-bold">SWIFT Telemetry Feed</span>
                       <span className="px-3 py-1 bg-[#2e8540] dark:bg-emerald-500 text-white dark:text-slate-900 font-bold text-xs">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#adadad] dark:border-slate-800 bg-[#f0f0f0] dark:bg-slate-950">
                       <span className="text-[#112e51] dark:text-slate-300 font-bold">MahaBank Active Directory / HRMS</span>
                       <span className="px-3 py-1 bg-[#2e8540] dark:bg-emerald-500 text-white dark:text-slate-900 font-bold text-xs">CONNECTED</span>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex justify-center"><h2 className="text-xl font-bold dark:text-white">Page Not Found</h2></div>
          )}
        </div>
      </div>
    </div>
  );
}
