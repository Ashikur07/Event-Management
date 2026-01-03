'use client'; 
import { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function DistributePage() {
  const [inputRoll, setInputRoll] = useState(''); // inputTicket -> inputRoll
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const inputRef = useRef(null);

  // অটো ফোকাস
  useEffect(() => {
    if (!showScanner && !isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [ticketData, isModalOpen, showScanner]);

  // ১. রোল নম্বর চেক API Call
  const checkRoll = async (rollNumber) => {
    if (!rollNumber) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setTicketData(null);
    setShowScanner(false);

    try {
      // API তে roll পাঠানো হচ্ছে
      const res = await fetch(`/api/distribute?roll=${rollNumber}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTicketData(data);
      setInputRoll(rollNumber);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
      setTimeout(() => {
        setInputRoll('');
        inputRef.current?.focus();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkRoll(inputRoll);
  };

  // ২. স্ক্যান হ্যান্ডলার
  const handleScan = (result) => {
    if (result) {
      const rawValue = result[0]?.rawValue;
      if (rawValue) {
        checkRoll(rawValue);
      }
    }
  };

  // ৩. ডিস্ট্রিবিউশন কনফার্ম
  const confirmDistribute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll: ticketData.roll }), // roll পাঠানো হচ্ছে
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`🎉 ${ticketData.name}-কে কিট দেওয়া সম্পন্ন হয়েছে!`);
      setIsModalOpen(false); 
      setInputRoll('');
      setTicketData(null);
      
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setInputRoll('');
  };

  // Alumni টাইপ শর্ট করার লজিক
  const getParticipantBadge = (type) => {
    if (!type) return 'Guest';
    if (type === 'Current Student') return 'Current Student';
    if (type.includes('Alumni')) return 'Alumni'; // সব Alumni-কে এক দেখাবে
    return type;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 Kit Distribution Point</h1>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        
        {/* QR Scanner Area */}
        {showScanner ? (
          <div className="mb-4 bg-black rounded-lg overflow-hidden relative border-2 border-indigo-500 aspect-square">
             <Scanner 
                onScan={handleScan}
                allowMultiple={true}
                scanDelay={2000}
                components={{ audio: false, finder: false }}
                styles={{ container: { width: '100%', height: '100%' } }}
             />
             <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-red-500/80 rounded-lg animate-pulse"></div>
             </div>
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold shadow-md z-20"
            >
              CLOSE CAM
            </button>
          </div>
        ) : (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowScanner(true)}
              className="bg-gray-800 text-white w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition mb-4 shadow-md"
            >
              📷 Scan QR Code
            </button>
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR TYPE ROLL</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            ref={inputRef}
            type="text"
            value={inputRoll}
            onChange={(e) => setInputRoll(e.target.value)}
            placeholder="ENTER ROLL NO"
            className="w-full px-4 py-3 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none text-center tracking-widest font-mono uppercase transition-all"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Go
          </button>
        </form>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold animate-pulse border border-red-200">
            ❌ {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center font-bold text-lg border border-green-200">
            {successMsg}
          </div>
        )}
      </div>

      {/* --- CONFIRMATION POPUP (MODAL) --- */}
      {isModalOpen && ticketData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            
            {/* Header: Ticket Number Removed, Participant Type Added */}
            <div className={`p-6 text-center ${ticketData.isUsed ? 'bg-red-50' : 'bg-indigo-50'}`}>
              <h2 className={`text-2xl font-bold ${ticketData.isUsed ? 'text-red-600' : 'text-indigo-800'}`}>
                {ticketData.isUsed ? '⚠️ Already Distributed!' : 'Student Details Found'}
              </h2>
              
              {/* Participant Type Badge */}
              <div className="mt-3">
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide border shadow-sm
                  ${getParticipantBadge(ticketData.participantType) === 'Alumni' 
                    ? 'bg-purple-100 text-purple-700 border-purple-200' 
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                  {getParticipantBadge(ticketData.participantType)}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Name</span>
                <span className="font-bold text-gray-800 text-lg">{ticketData.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Roll No</span>
                <span className="font-mono font-bold text-gray-800">{ticketData.roll}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Session</span>
                <span className="font-bold text-gray-800">{ticketData.session}</span>
              </div>
              
              <div className={`border rounded-lg p-4 flex justify-between items-center mt-4 ${ticketData.isUsed ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👕</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Size</p>
                    <p className="text-2xl font-black text-gray-800">{ticketData.tShirtSize}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold mb-1">STATUS</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${ticketData.isUsed ? 'bg-red-200 text-red-800' : 'bg-green-600 text-white'}`}>
                    {ticketData.isUsed ? 'DELIVERED' : 'READY TO GIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex gap-3 border-t">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              
              {!ticketData.isUsed && (
                <button
                  onClick={confirmDistribute}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition flex justify-center items-center gap-2"
                >
                  {loading ? 'Processing...' : '✅ CONFIRM'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}