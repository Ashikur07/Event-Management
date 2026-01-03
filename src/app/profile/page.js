'use client';
import MobileLayout from '@/components/MobileLayout';
import { useRole } from '@/hooks/useRole';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { role } = useRole();
  const router = useRouter();

  const handleLogout = () => {
    Swal.fire({
        title: 'Logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Logout',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            // কুকি এবং স্টোরেজ ক্লিয়ার
            Cookies.remove('app_role');
            localStorage.removeItem('user_role');
            window.location.href = '/login';
        }
    });
  };

  return (
    <MobileLayout title="My Profile">
      <div className="flex flex-col items-center py-10">
        
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white shadow-xl mb-4">
            {role ? role.charAt(0).toUpperCase() : 'U'}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 capitalize">{role || 'User'}</h2>
        <p className="text-gray-400 text-sm mb-8">Access Level</p>

        {/* Info Cards */}
        <div className="w-full space-y-3 px-4 mb-10">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-500">System Status</span>
                <span className="text-green-500 font-bold bg-green-50 px-2 py-1 rounded text-xs">● Online</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-500">App Version</span>
                <span className="text-gray-800 font-bold text-sm">v1.0.0</span>
            </div>
        </div>

        {/* Logout Button */}
        <button 
            onClick={handleLogout}
            className="w-11/12 bg-red-50 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
        </button>

      </div>
    </MobileLayout>
  );
}