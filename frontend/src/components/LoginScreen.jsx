import React, { useState } from 'react';
import { ShieldAlert, KeyRound, User, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function LoginScreen({ onLogin }) {
  const [role, setRole] = useState('Employee');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'CISO' && password !== 'ciso123') return setError('Invalid CISO credentials');
    if (role === 'MD' && password !== 'md123') return setError('Invalid MD credentials');
    if (role === 'Employee' && password !== 'employee123' && password !== '') {
      if (password !== 'employee123') return setError('Invalid Employee credentials');
    }
    
    setError('');
    onLogin({ 
      role, 
      name: role === 'CISO' ? 'Kavya Menon' : role === 'MD' ? 'Rajesh Sharma' : 'SOC Analyst' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f0f0] dark:bg-slate-950 relative transition-colors duration-300">
      
      <div className="absolute top-12 right-8">
         <ThemeToggle />
      </div>

      <button 
        onClick={() => navigate('/')} 
        className="absolute top-12 left-8 text-[#005ea2] dark:text-slate-400 hover:text-[#112e51] dark:hover:text-white hover:underline flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ChevronLeft size={16} /> Return to Public Portal
      </button>

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-t-8 border-[#112e51] dark:border-slate-700 border-l border-r border-b border-[#adadad] dark:border-b-slate-800 dark:border-l-slate-800 dark:border-r-slate-800 shadow-xl p-10 animate-in fade-in duration-500 mt-10 transition-colors duration-300">
        
        <div className="flex justify-center mb-6">
          <ShieldAlert size={48} className="text-[#112e51] dark:text-slate-300" />
        </div>
        
        <h1 className="text-2xl font-black text-center mb-2 text-[#112e51] dark:text-white tracking-tight uppercase">Security Gateway</h1>
        <p className="text-center text-[#5c5c5c] dark:text-slate-400 mb-6 text-xs uppercase tracking-widest font-bold">Authorized Personnel Only</p>
        
        {/* Bank of Maharashtra Warning Block */}
        <div className="bg-[#f9e8e8] dark:bg-red-950/30 border-l-4 border-[#d83933] dark:border-red-900 p-3 mb-8">
           <p className="text-[10px] text-[#1b1b1b] dark:text-slate-300 font-bold text-justify uppercase leading-relaxed">
             WARNING: You are accessing a Bank of Maharashtra (BoM) Information System that is provided for BoM-authorized use only. Unauthorized or improper use of this system may result in disciplinary action and civil and criminal penalties.
           </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#112e51] dark:text-slate-300 uppercase tracking-wider block">Select Clearance Level</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-[#5c5c5c] dark:text-slate-500" />
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#f0f0f0] dark:bg-slate-950 border-2 border-[#112e51] dark:border-slate-700 text-[#1b1b1b] dark:text-slate-200 font-bold rounded-none py-3 pl-10 pr-4 focus:ring-4 focus:ring-[#005ea2]/30 dark:focus:ring-slate-700 outline-none appearance-none"
              >
                <option value="Employee">SOC Analyst (Tier 1)</option>
                <option value="CISO">Chief Info Security Officer (Tier 3)</option>
                <option value="MD">Managing Director (Executive)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#112e51] dark:text-slate-300 uppercase tracking-wider block">Access Credential</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-[#5c5c5c] dark:text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role.toLowerCase() + '123'}
                className="w-full bg-[#f0f0f0] dark:bg-slate-950 border-2 border-[#112e51] dark:border-slate-700 text-[#1b1b1b] dark:text-slate-200 font-bold rounded-none py-3 pl-10 pr-4 focus:ring-4 focus:ring-[#005ea2]/30 dark:focus:ring-slate-700 outline-none"
              />
            </div>
          </div>

          {error && <p className="text-white text-xs font-bold text-center bg-[#d83933] dark:bg-red-900 py-3 uppercase border-2 border-[#8b2320] dark:border-red-950">{error}</p>}
          
          <button type="submit" className="w-full mt-4 bg-[#005ea2] dark:bg-slate-800 hover:bg-[#1a4480] dark:hover:bg-slate-700 border-b-4 border-[#112e51] dark:border-slate-950 active:border-b-0 active:translate-y-1 text-white font-bold py-4 transition-all uppercase tracking-widest text-sm">
            Initiate Handshake
          </button>
        </form>
      </div>
    </div>
  );
}
