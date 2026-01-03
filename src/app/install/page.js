'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // ১. অ্যাপ অলরেডি ইন্সটল করা আছে কি না (iOS + Android both check)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true || 
        document.referrer.includes('android-app://')
      );
    };

    if (isInStandaloneMode()) {
      setIsStandalone(true);
    }

    // ২. ডিভাইস ডিটেকশন
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // ৩. PWA Install Event Listener
    const handler = (e) => {
      e.preventDefault(); // ডিফল্ট ব্যানার বন্ধ করা
      console.log("PWA Install Prompt fired!"); // ডিবাগিং এর জন্য
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-blue-600 font-bold flex items-center gap-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </Link>

      {/* Logo Area */}
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-6">
         <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Install App</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
        Install <span className="font-bold text-blue-600">ICT Reunion</span> for better experience and offline access.
      </p>

      {/* --- Logic Blocks --- */}

      {/* Case 1: Already Installed */}
      {isStandalone ? (
         <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-200 shadow-sm animate-pulse">
            ✅ App is already installed!
         </div>
      ) : (
        <>
          {/* Case 2: Standard Install Button (Android/Desktop) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install App
            </button>
          )}

          {/* Case 3: iOS Instructions */}
          {isIOS && !isStandalone && (
            <div className="bg-white p-5 rounded-2xl text-left text-sm text-gray-600 border border-gray-200 shadow-sm max-w-xs mx-auto mt-4">
              <p className="font-bold text-gray-800 mb-3 text-center border-b pb-2">iOS Installation Steps:</p>
              <ol className="space-y-3">
                <li className="flex items-center gap-2">
                  1. Tap the <span className="text-blue-600 text-2xl">share</span> button below.
                </li>
                <li className="flex items-center gap-2">
                  2. Scroll down & tap <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">Add to Home Screen</span>.
                </li>
                <li className="flex items-center gap-2">
                  3. Tap <span className="font-bold text-blue-600">Add</span> at top right.
                </li>
              </ol>
            </div>
          )}

          {/* Case 4: Android Fallback (যদি বাটন না আসে) */}
          {!deferredPrompt && isAndroid && !isStandalone && (
             <div className="bg-orange-50 p-4 rounded-xl text-left text-sm text-orange-800 border border-orange-100 shadow-sm max-w-xs mx-auto mt-4">
               <p className="font-bold mb-2 flex items-center gap-2">
                 <span className="text-xl">⚠️</span> Install Manually:
               </p>
               <ol className="list-decimal pl-4 space-y-1 text-orange-700">
                 <li>Tap the browser menu (⋮) at top right.</li>
                 <li>Select <span className="font-bold">"Install App"</span> or <span className="font-bold">"Add to Home Screen"</span>.</li>
               </ol>
             </div>
          )}

          {/* Case 5: Desktop/Other Fallback */}
          {!deferredPrompt && !isIOS && !isAndroid && (
             <div className="text-xs text-gray-400 mt-4 bg-gray-100 p-3 rounded-lg">
                If the install button doesn't appear, check the address bar for an install icon (⬇️).
             </div>
          )}
        </>
      )}

    </div>
  );
}