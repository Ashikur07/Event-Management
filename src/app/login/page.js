'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (type) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type }),
      });

      const data = await res.json();

      if (res.ok) {
        // লোকাল স্টোরেজে রোল সেভ রাখা (UI কন্ডিশনের জন্য)
        localStorage.setItem('user_role', data.role);
        
        Swal.fire({
            icon: 'success',
            title: `Welcome, ${data.role.toUpperCase()}!`,
            timer: 1500,
            showConfirmButton: false
        });
        router.push('/'); // হোম পেজে রিডাইরেক্ট
      } else {
        Swal.fire('Error', 'Wrong Password!', 'error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
        
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
          🔐
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Control</h1>
        <p className="text-slate-500 mb-8 text-sm">Enter access key to manage kits</p>

        <input 
          type="password" 
          placeholder="Enter Passkey..." 
          className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none mb-4 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          onClick={() => handleLogin('auth')}
          disabled={loading || !password}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Checking...' : 'Login System'}
        </button>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={() => handleLogin('viewer')}
          className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
        >
          View as Guest
        </button>

      </div>
    </div>
  );
}